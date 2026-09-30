import {
  Component,
  Element,
  Event,
  EventEmitter,
  forceUpdate,
  h,
  Host,
  Prop,
} from '@stencil/core';
import { subscribeToLocale, t } from '../../i18n';

const Star = () => (
  <svg
    class="vocably-rate-star"
    viewBox="0 0 24 24"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96L12 2.5z" />
  </svg>
);

@Component({
  tag: 'vocably-rate',
  styleUrl: 'rate.scss',
  shadow: false,
})
export class VocablyRate {
  @Element() el: HTMLElement;
  @Event() userSelected: EventEmitter<
    'review' | 'later' | 'never' | 'feedback'
  >;

  @Prop() platform: { name: string; url: string };

  private unsubLocale: (() => void) | undefined;

  connectedCallback() {
    this.unsubLocale = subscribeToLocale(this.el, () => forceUpdate(this.el));
  }

  disconnectedCallback() {
    this.unsubLocale?.();
  }

  render() {
    return (
      <Host>
        <div class="vocably-rate-card">
          <div class="vocably-rate-stars">
            <Star />
            <Star />
            <Star />
            <Star />
            <Star />
          </div>
          <div class="vocably-rate-title">{t('rate.title')}</div>
          <div class="vocably-rate-description">
            {t('rate.description', { platform: this.platform.name })}
          </div>
          <div class="vocably-rate-actions">
            <a
              href={this.platform.url}
              target="_blank"
              class="vocably-rate-primary"
              onClick={() => this.userSelected.emit('review')}
            >
              {t('rate.ok')}
            </a>
            <button
              class="vocably-rate-secondary"
              title={t('rate.show_again')}
              onClick={() => this.userSelected.emit('later')}
            >
              {t('rate.later')}
            </button>
          </div>
          <div class="vocably-rate-footer">
            <span>
              {t('rate.dislike')}{' '}
              <a
                href="https://app.vocably.pro/feedback"
                target="_blank"
                class="vocably-rate-link"
                onClick={() => this.userSelected.emit('feedback')}
              >
                {t('rate.contact')}
              </a>
            </span>
            <button
              class="vocably-rate-dismiss"
              onClick={() => this.userSelected.emit('never')}
            >
              {t('rate.never')}
            </button>
          </div>
        </div>
      </Host>
    );
  }
}
