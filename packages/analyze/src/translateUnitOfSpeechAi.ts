import { ChatGPTLanguage } from '@vocably/model';

export type TranslateUnitOfSpeechPayload = {
  sourceLanguage: ChatGPTLanguage;
  targetLanguage: ChatGPTLanguage;
  partOfSpeech: string;
  source: string;
  definitions?: string[];
  examples?: string[];
  number?: string;
};

export const getExpectedNumberOfTranslations = (
  definitions: string[]
): number => {
  if (definitions.length <= 1) {
    return 2;
  }

  return definitions.length;
};
