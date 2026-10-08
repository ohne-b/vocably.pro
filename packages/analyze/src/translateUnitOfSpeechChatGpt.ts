import { chatGptRequest, GPT_4O } from '@vocably/lambda-shared';
import { languageList, Result } from '@vocably/model';
import { uniq } from 'lodash-es';
import {
  getExpectedNumberOfTranslations,
  TranslateUnitOfSpeechPayload as Payload,
} from './translateUnitOfSpeechAi';

export const translateUnitOfSpeechChatGpt = async ({
  sourceLanguage,
  targetLanguage,
  source,
  partOfSpeech,
  definitions = [],
  examples = [],
  number,
}: Payload): Promise<Result<string[]>> => {
  const safeSourceLanguage = languageList[sourceLanguage];
  const safeTargetLanguage = languageList[targetLanguage];

  const definitionsMd =
    definitions?.length > 0 ? [`#Definitions`, ...definitions] : [];
  const examplesMd = examples?.length > 0 ? [`#Examples`, ...examples] : [];

  const result = await chatGptRequest({
    messages: [
      {
        role: 'system',
        content: [
          `You are ${safeSourceLanguage}-${safeTargetLanguage} dictionary`,
          `User provides ${safeSourceLanguage} ${partOfSpeech}${
            definitions?.length > 0 ? ' and its definitions' : ''
          }.`,
          `Give up to ${getExpectedNumberOfTranslations(
            definitions
          )} relevant translations into ${safeTargetLanguage}${
            definitions?.length > 0 ? ' in the context of definitions' : ''
          }.`,
          `Only respond in text format with each translation on a separate line`,
          partOfSpeech.includes('verb')
            ? `Consider tense of the provided ${partOfSpeech}`
            : '',
          partOfSpeech.includes('preposition')
            ? `Shortly explain in ${safeTargetLanguage} in brackets if necessary`
            : '',
          number === 'plural' && partOfSpeech === 'noun'
            ? 'This is plural'
            : '',
          `Omit explanations`,
          `Sort results by commonality`,
        ].join('\n'),
      },
      { role: 'user', content: source },
      { role: 'user', content: [definitionsMd, examplesMd].join('\n') },
    ],
    model: GPT_4O,
    responseFormat: {
      type: 'text',
    },
  });

  if (result.success === false) {
    return result;
  }

  if (!result.success) {
    return result;
  }

  const translations = uniq(
    result.value
      .split('\n')
      .map((s: string) => s.trim().replace(/^-/, '').trim().toLowerCase())
      .map((pos: string) => {
        if (/substantiv[^,]*/i.test(pos)) {
          return 'noun';
        }

        return pos;
      })
  ) as string[];

  return {
    success: true,
    value: translations,
  };
};
