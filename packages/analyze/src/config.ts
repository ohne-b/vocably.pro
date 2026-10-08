import { setOpenAIConfig } from '@vocably/lambda-shared';

export const config = {
  googleProjectId: 'vocably-332109',
  openaiApiKey: 'must be provided',
  geminiApiKey: 'must be provided',
  jevApiKey: 'must be provided',
  awsRegion: 'us-east-1',
  unitsOfSpeechBucket: 'vocably-prod-units-of-speech',
  claudeApiKey: 'must be provided',
};

type AnalyzerConfig = Omit<typeof config, 'claudeApiKey'> & {
  claudeApiKey?: string;
};

export const configureAnalyzer = (newConfig: AnalyzerConfig) => {
  Object.assign(config, newConfig);
  setOpenAIConfig({
    apiKey: config.openaiApiKey,
  });
};
