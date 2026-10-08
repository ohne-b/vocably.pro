import '@vocably/jest';
import { configureTestAnalyzer } from './test/configureTestAnalyzer';
import { translateUnitOfSpeechChatGpt } from './translateUnitOfSpeechChatGpt';

configureTestAnalyzer();

describe('translateUnitOfSpeechChatGpt', () => {
  if (process.env.TEST_SKIP_SPEC === 'true') {
    it('skip spec testing', () => {});
    return;
  }

  it('chatgpt bank', async () => {
    const translationResult = await translateUnitOfSpeechChatGpt({
      source: 'bank',
      partOfSpeech: 'noun',
      sourceLanguage: 'en',
      targetLanguage: 'ru',
      definitions: [
        'A financial institution where money and other valuables are stored and managed.',
        'A long, raised mass or mound of earth, especially bordering or paralleling a river or shore.',
        'A set or series of similar or related things, particularly in a row or tier.',
      ],
      examples: [
        'I deposited money in the bank.',
        'The river overflowed its banks.',
        'A bank of computers.',
      ],
    });
    expect(translationResult.success).toEqual(true);

    if (translationResult.success === false) {
      return;
    }

    expect(translationResult.value[0]).toEqual('банк');
    expect(translationResult.value[1]).toEqual('берег');
  }, 60_000);

  it('chatgpt consider plurals', async () => {
    const translationResult = await translateUnitOfSpeechChatGpt({
      source: 'balken',
      partOfSpeech: 'noun',
      sourceLanguage: 'nl',
      targetLanguage: 'ru',
      number: 'plural',
      definitions: [
        'Lange, zware stukken bewerkt hout, metaal of beton gebruikt in de bouw.',
        'Horizontale steunstukken in een constructie.',
      ],
    });

    expect(translationResult.success).toEqual(true);
    if (!translationResult.success) {
      return;
    }

    expect(translationResult.value[0]).toEqual('балки');
  });

  it('chatgpt properly translates duck', async () => {
    const translationResult = await translateUnitOfSpeechChatGpt({
      source: 'duck',
      partOfSpeech: 'verb',
      sourceLanguage: 'en',
      targetLanguage: 'ru',
      definitions: [
        'to lower the head or body quickly to avoid being hit or seen',
        'to evade or avoid a task, responsibility, or difficult situation',
      ],
      examples: ['The duck swam in the pond.', 'He made a quick duck.'],
    });

    expect(translationResult.success).toEqual(true);
    if (!translationResult.success) {
      return;
    }

    expect(
      translationResult.value.some((v) => v.includes('пригнуться'))
    ).toEqual(true);

    expect(translationResult.value.some((v) => v.includes('утка'))).toEqual(
      false
    );
  });
});
