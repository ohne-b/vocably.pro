import { nodeFetchS3File, nodePutS3File } from '@vocably/lambda-shared';
import { Result } from '@vocably/model';
import { trimArticle } from '@vocably/sulna';
import { config } from './config';
import { fallback, FallbackResult } from './fallback';
import { TranslateUnitOfSpeechPayload as Payload } from './translateUnitOfSpeechAi';
import { translateUnitOfSpeechChatGpt } from './translateUnitOfSpeechChatGpt';
import { translateUnitOfSpeechGemini } from './translateUnitOfSpeechGemini';
import { validateSource } from './validateSource';

export const translateUnitOfSpeechNoCache = async (
  payload: Payload
): Promise<FallbackResult<string[]>> => {
  const trimmedPayload = {
    ...payload,
    source: trimArticle(payload.sourceLanguage, payload.source).source,
  };

  return fallback(translateUnitOfSpeechGemini(trimmedPayload), () =>
    translateUnitOfSpeechChatGpt(trimmedPayload)
  );
};

export const getUnitOfSpeechTranslationFileName = (
  payload: Pick<
    Payload,
    'sourceLanguage' | 'targetLanguage' | 'source' | 'partOfSpeech'
  >
): string => {
  return `${payload.sourceLanguage.toLowerCase()}/translations/${payload.source
    .toLowerCase()
    .replace(/\//g, '-')}/${payload.partOfSpeech
    .toLowerCase()
    .replace(/\//g, '-')}/${payload.targetLanguage.toLowerCase()}.txt`;
};

// Translations are usually saved one per line, but sometimes as a JSON array.
const parseTranslationsFile = (contents: string): string[] => {
  if (contents.trimStart().startsWith('[')) {
    try {
      const parsed = JSON.parse(contents);

      if (Array.isArray(parsed)) {
        return parsed
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean);
      }
    } catch {
      // Not JSON, fall back to newline-separated translations.
    }
  }

  return contents.split('\n').filter((s) => !!s);
};

export const translateUnitOfSpeech = async (
  payload: Payload
): Promise<Result<string[]>> => {
  const isValidSource = validateSource({
    source: payload.source,
    partOfSpeech: payload.partOfSpeech,
  });
  const fileName = getUnitOfSpeechTranslationFileName(payload);
  const s3FetchResult = await nodeFetchS3File(
    config.unitsOfSpeechBucket,
    fileName
  );

  if (s3FetchResult.success && s3FetchResult.value !== null) {
    const translations = parseTranslationsFile(s3FetchResult.value);

    return {
      success: true,
      value: translations,
    };
  }

  const translationResult = await translateUnitOfSpeechNoCache(payload);

  if (!translationResult.success) {
    return translationResult;
  }

  if (isValidSource && !translationResult.fallenBack) {
    const putResult = await nodePutS3File(
      config.unitsOfSpeechBucket,
      fileName,
      translationResult.value.join('\n')
    );

    if (!putResult.success) {
      console.error('Failed to put the translation result to S3', putResult);
    }
  }

  return translationResult;
};
