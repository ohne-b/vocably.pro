import { jest } from '@jest/globals';
import { detectInputTypeJev } from './detectInputTypeJev';

const mockJevResponse = (body: unknown) =>
  jest.spyOn(global, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  );

const getRequestBody = (fetchMock: ReturnType<typeof mockJevResponse>) =>
  JSON.parse(fetchMock.mock.calls[0][1]?.body as string);

describe('detectInputTypeJev (British English)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('offers en-GB without other English variants as language candidates', async () => {
    const fetchMock = mockJevResponse({
      answers: {
        type: { choice: 'word' },
        language: { probabilities: { 'en-GB': 0.9 } },
      },
    });

    await detectInputTypeJev({ language: 'en-GB', source: 'colour' });

    const candidates = Object.keys(
      getRequestBody(fetchMock).questions.language.criteria
    );
    expect(candidates[0]).toEqual('en-GB');
    expect(candidates).not.toContain('en');
    expect(candidates).toContain('de');
  });

  it('keeps en as a candidate for en', async () => {
    const fetchMock = mockJevResponse({
      answers: {
        type: { choice: 'word' },
        language: { probabilities: { en: 0.9 } },
      },
    });

    await detectInputTypeJev({ language: 'en', source: 'color' });

    const candidates = Object.keys(
      getRequestBody(fetchMock).questions.language.criteria
    );
    expect(candidates.filter((code) => code === 'en').length).toEqual(1);
    expect(candidates).not.toContain('en-GB');
  });

  it('is direct when en-GB probability is above the threshold', async () => {
    mockJevResponse({
      answers: {
        type: { choice: 'word' },
        language: { probabilities: { 'en-GB': 0.8, de: 0.1 } },
      },
    });

    const result = await detectInputTypeJev({
      language: 'en-GB',
      source: 'lorry',
    });

    expect(result).toEqual({
      success: true,
      value: { type: 'word', isDirect: true },
    });
  });

  it('is not direct when en-GB probability is below the threshold', async () => {
    mockJevResponse({
      answers: {
        type: { choice: 'word' },
        language: { probabilities: { 'en-GB': 0.05, ru: 0.9 } },
      },
    });

    const result = await detectInputTypeJev({
      language: 'en-GB',
      source: 'собака',
    });

    expect(result).toEqual({
      success: true,
      value: { type: 'word', isDirect: false },
    });
  });

  it('fails when en-GB probability is missing', async () => {
    mockJevResponse({
      answers: {
        type: { choice: 'word' },
        language: { probabilities: { en: 0.9 } },
      },
    });

    const result = await detectInputTypeJev({
      language: 'en-GB',
      source: 'colour',
    });

    expect(result.success).toEqual(false);
  });
});
