import '@sneas/telephone';
import { Component, Element, forceUpdate, h, Host, Prop } from '@stencil/core';
import { TranslationCard } from '@vocably/model';
import { explode } from '@vocably/sulna';
import { subscribeToLocale, t } from '../../i18n';

export type CongratulationPlatform = 'ios' | 'android' | 'desktop';

const APP_STORE_URL =
  'https://apps.apple.com/app/vocably-pro-language-cards/id1641258757';
const GOOGLE_PLAY_URL =
  'https://play.google.com/store/apps/details?id=com.vocablypro';

const detectPlatform = (): CongratulationPlatform => {
  const ua = navigator.userAgent;

  if (/android/i.test(ua)) {
    return 'android';
  }

  // iPadOS reports itself as a Mac, touch support gives it away
  if (
    /iPad|iPhone|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  ) {
    return 'ios';
  }

  return 'desktop';
};

// Replaces {placeholders} in a translated string with JSX nodes
const interpolate = (template: string, params: Record<string, any>) =>
  template.split(/(\{\w+\})/).map((part) => {
    const match = part.match(/^\{(\w+)\}$/);
    return match && match[1] in params ? params[match[1]] : part;
  });

// Keeps the headline readable when a whole sentence was translated
const truncate = (text: string, maxLength = 48) => {
  if (text.length <= maxLength) {
    return text;
  }

  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > maxLength / 2 ? cut.slice(0, lastSpace) : cut).trim()}…`;
};

@Component({
  tag: 'vocably-first-translation-congratulation',
  styleUrl: 'first-translation-congratulation.scss',
  shadow: true,
})
export class VocablyFirstTranslationCongratulation {
  @Element() el: HTMLElement;
  @Prop() card: TranslationCard;
  /**
   * Overrides the platform detected from the user agent.
   */
  @Prop() platform?: CongratulationPlatform;

  private unsubLocale: (() => void) | undefined;

  connectedCallback() {
    this.unsubLocale = subscribeToLocale(this.el, () => forceUpdate(this.el));
  }

  disconnectedCallback() {
    this.unsubLocale?.();
  }

  private renderPhone() {
    const examples = explode(this.card.data.example ?? '');
    const definitions = explode(this.card.data.definition ?? '');

    return (
      <iphone-16-max class="phone">
        <div class="phone-bg">
          <div class="card">
            <div class="card-side-wrapper front">
              <div class="card-side">
                <div class="card-source-line">
                  <div class="emphasize small">{this.card.data.source}</div>
                  {this.card.data.ipa && (
                    <div class="small">[{this.card.data.ipa}]</div>
                  )}
                  {this.card.data.g && (
                    <div class="small">({this.card.data.g})</div>
                  )}
                  {this.card.data.partOfSpeech && (
                    <div class="small">{this.card.data.partOfSpeech}</div>
                  )}
                </div>
                {examples.length === 1 && (
                  <div class="small">{examples[0]}</div>
                )}
                {examples.length > 1 && (
                  <ul class="small vocably-list">
                    {examples.map((item) => (
                      <li>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div class="card-side-wrapper back">
              <div class="card-side">
                {definitions.length > 0 && (
                  <ul class="small vocably-list">
                    {this.card.data.translation && (
                      <li class="emphasize">{this.card.data.translation}</li>
                    )}
                    {definitions.map((item) => (
                      <li>{item}</li>
                    ))}
                  </ul>
                )}
                {definitions.length === 0 && (
                  <div class="emphasize small">
                    {this.card.data.translation}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </iphone-16-max>
    );
  }

  private renderQrCode() {
    return (
      <div class="get-app">
        <div class="qr-frame">
          <vocably-qr-code class="qr"></vocably-qr-code>
        </div>
        <div class="get-app-text">
          <div class="get-app-title">{t('congrats.get_app')}</div>
          <div class="get-app-hint">{t('congrats.scan_qr')}</div>
        </div>
      </div>
    );
  }

  private renderAppStoreBadge() {
    return (
      <a
        class="store-badge"
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener"
        aria-label="App Store"
      >
        <svg class="store-logo" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
          />
        </svg>
        <span class="store-text">
          <span class="store-caption">{t('congrats.app_store_caption')}</span>
          <span class="store-name">App Store</span>
        </span>
      </a>
    );
  }

  private renderGooglePlayBadge() {
    return (
      <a
        class="store-badge"
        href={GOOGLE_PLAY_URL}
        target="_blank"
        rel="noopener"
        aria-label="Google Play"
      >
        <svg class="store-logo" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#00C3FF"
            d="M3.5 1.8 13.2 12 3.5 22.2a1.6 1.6 0 0 1-.5-1.2V3a1.6 1.6 0 0 1 .5-1.2z"
          />
          <path
            fill="#00E676"
            d="M3.5 1.8a1.5 1.5 0 0 1 1.7-.1l11.4 6.6-3.4 3.7z"
          />
          <path
            fill="#FF3A44"
            d="M3.5 22.2 13.2 12l3.4 3.7-11.4 6.6a1.5 1.5 0 0 1-1.7-.1z"
          />
          <path
            fill="#FFD500"
            d="m16.6 8.3 3.9 2.3c1.1.6 1.1 2.2 0 2.8l-3.9 2.3-3.4-3.7z"
          />
        </svg>
        <span class="store-text">
          <span class="store-caption">{t('congrats.google_play_caption')}</span>
          <span class="store-name">Google Play</span>
        </span>
      </a>
    );
  }

  private renderStoreBadge(platform: 'ios' | 'android') {
    return (
      <div class="get-app-mobile">
        <div class="get-app-hint">{t('congrats.get_app_mobile')}</div>
        {platform === 'ios'
          ? this.renderAppStoreBadge()
          : this.renderGooglePlayBadge()}
      </div>
    );
  }

  render() {
    const platform = this.platform ?? detectPlatform();

    return (
      <Host>
        <div class={{ container: true, [`platform-${platform}`]: true }}>
          <div class="illustration">{this.renderPhone()}</div>
          <div class="content">
            <div class="status">
              <svg class="status-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"
                />
              </svg>
              {t('congrats.badge')}
            </div>
            <div class="title">
              {interpolate(t('congrats.title'), {
                word: (
                  <span class="word">{truncate(this.card.data.source)}</span>
                ),
              })}
            </div>
            <div class="description">{t('congrats.description')}</div>

            {platform === 'desktop'
              ? this.renderQrCode()
              : this.renderStoreBadge(platform)}

            <div class="browser">
              {interpolate(t('congrats.browser'), {
                link: (
                  <a
                    class="link"
                    href={`https://app.vocably.pro/deck/${this.card.data.language}`}
                    target="_blank"
                    rel="noopener"
                  >
                    app.vocably.pro
                  </a>
                ),
              })}
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
