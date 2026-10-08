import '@vocably/jest';
import { configureTestAnalyzer } from './test/configureTestAnalyzer';
import {
  getUnitOfSpeechTranslationFileName,
  translateUnitOfSpeechNoCache,
} from './translateUnitOfSpeech';

configureTestAnalyzer();

describe('translateUnitOfSpeech', () => {
  if (process.env.TEST_SKIP_SPEC === 'true') {
    it('skip spec testing', () => {});
    return;
  }

  it('bank', async () => {
    const translationResult = await translateUnitOfSpeechNoCache({
      source: 'bank',
      partOfSpeech: 'noun',
      sourceLanguage: 'en',
      targetLanguage: 'ru',
    });
    expect(translationResult.success).toEqual(true);
    if (translationResult.success === false) {
      return;
    }

    expect(translationResult.value[0]).toEqual('банк');
    expect(translationResult.value[1]).toEqual('берег');
  }, 60_000);

  it('trims article before translation', async () => {
    const translationResult = await translateUnitOfSpeechNoCache({
      source: 'het pad',
      partOfSpeech: 'noun',
      sourceLanguage: 'nl',
      targetLanguage: 'en',
      definitions: [
        'Een smalle weg voor wandelaars of fietsers.',
        'Een traject of koers die men volgt.',
        'Een amfibie uit de familie Bufonidae.',
      ],
      examples: ['een smal pad door het bos', 'het juiste pad kiezen'],
    });
    expect(translationResult.success).toEqual(true);
    if (translationResult.success === false) {
      return;
    }

    console.log(translationResult.value);

    expect(translationResult.value.every((v) => !v.startsWith('the'))).toEqual(
      true
    );
  }, 60_000);

  it('tailor', async () => {
    const translationResult = await translateUnitOfSpeechNoCache({
      source: 'tailor',
      partOfSpeech: 'verb',
      sourceLanguage: 'en',
      targetLanguage: 'ru',
    });

    console.log(translationResult);

    expect(translationResult.success).toEqual(true);

    if (!translationResult.success) {
      return;
    }

    // @ts-ignore
    expect(translationResult.value[0]).toEqual('шить');
  }, 60_000);

  it('de bron to en', async () => {
    const translationResult = await translateUnitOfSpeechNoCache({
      source: 'bron',
      partOfSpeech: 'noun',
      sourceLanguage: 'nl',
      targetLanguage: 'en',
    });
    expect(translationResult.success).toEqual(true);
    // @ts-ignore
    expect(translationResult.value[0]).toEqual('source');
  }, 60_000);

  it('de bron to ru', async () => {
    const translationResult = await translateUnitOfSpeechNoCache({
      source: 'bron',
      partOfSpeech: 'noun',
      sourceLanguage: 'nl',
      targetLanguage: 'ru',
    });
    expect(translationResult.success).toEqual(true);
    if (!translationResult.success) {
      return;
    }
    expect(translationResult.value.length).toBeGreaterThanOrEqual(2);
    // @ts-ignore
    expect(translationResult.value[0]).toEqual('источник');
    expect(translationResult.value[1]).toHaveSomeOf('источник, родник, ключ');
  }, 60_000);

  it('arrival', async () => {
    const translationResult = await translateUnitOfSpeechNoCache({
      source: 'arrival',
      partOfSpeech: 'noun',
      sourceLanguage: 'en',
      targetLanguage: 'ru',
    });
    expect(translationResult.success).toEqual(true);
    if (!translationResult.success) {
      return;
    }
    expect(translationResult.value.length).toBeGreaterThanOrEqual(2);
    expect(translationResult.value[0]).toEqual('прибытие');
    expect(translationResult.value[1]).toEqual('приезд');
  }, 60_000);

  it('bottle', async () => {
    const translationResult = await translateUnitOfSpeechNoCache({
      source: 'bottle',
      partOfSpeech: 'noun',
      sourceLanguage: 'en',
      targetLanguage: 'ru',
    });
    expect(translationResult.success).toEqual(true);
    if (!translationResult.success) {
      return;
    }
    expect(translationResult.value.length).toBeGreaterThanOrEqual(2);
    // @ts-ignore
    expect(translationResult.value[0]).toEqual('бутылка');
  }, 60_000);

  it('past tense 01', async () => {
    const translationResult = await translateUnitOfSpeechNoCache({
      source: 'doet',
      partOfSpeech: 'verb',
      sourceLanguage: 'nl',
      targetLanguage: 'en',
      definitions: [
        'maakt iets tot werkelijkheid',
        'verricht een handeling',
        'functioneert op een specifieke manier',
      ],
      examples: [
        'Hij doet zijn werk goed.',
        'Dat doet pijn.',
        'Zij doet de deur dicht.',
      ],
    });
    expect(translationResult.success).toEqual(true);
    if (!translationResult.success) {
      return;
    }

    expect(translationResult.value[0]).toEqual('does');
  }, 60_000);

  it('past tense 02', async () => {
    const translationResult = await translateUnitOfSpeechNoCache({
      source: 'aangekondigd',
      partOfSpeech: 'verb',
      sourceLanguage: 'nl',
      targetLanguage: 'ru',
    });
    expect(translationResult.success).toEqual(true);
    if (!translationResult.success) {
      return;
    }

    expect(translationResult.value[0]).toHaveSomeOf([
      'объявленный',
      'объявлено',
      'объявил',
    ]);
  }, 60_000);

  describe('get file name', () => {
    it('replaces slashes', () => {
      expect(
        getUnitOfSpeechTranslationFileName({
          source: 'some/wrong/file/name',
          sourceLanguage: 'en',
          partOfSpeech: 'noun/and/something/else',
          targetLanguage: 'nl',
        })
      ).toEqual(
        'en/translations/some-wrong-file-name/noun-and-something-else/nl.txt'
      );
    });

    it('works fine', () => {
      expect(
        getUnitOfSpeechTranslationFileName({
          source: 'խնձոր',
          sourceLanguage: 'hy',
          partOfSpeech: 'noun',
          targetLanguage: 'en',
        })
      ).toEqual('hy/translations/խնձոր/noun/en.txt');
    });
  });
});
