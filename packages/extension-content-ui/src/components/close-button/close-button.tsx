import {
  Component,
  Element,
  Event,
  EventEmitter,
  forceUpdate,
  h,
  Host,
} from '@stencil/core';
import { subscribeToLocale, t } from '../../i18n';

@Component({
  tag: 'vocably-close-button',
  styleUrl: 'close-button.scss',
  shadow: false,
})
export class VocablyCloseButton {
  @Element() el: HTMLElement;
  @Event() close: EventEmitter<void>;

  private unsubLocale: (() => void) | undefined;

  connectedCallback() {
    this.unsubLocale = subscribeToLocale(this.el, () => forceUpdate(this.el));
  }

  disconnectedCallback() {
    this.unsubLocale?.();
  }

  render() {
    const label = t('close_button.label');

    return (
      <Host>
        <button
          type="button"
          class="vocably-close-button"
          aria-label={label}
          title={label}
          onClick={() => this.close.emit()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
        >
          <svg
            class="vocably-close-svg"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
          >
            <path class="vocably-close-svg-path" d="M10 0L0 10M0 0L10 10" />
          </svg>
        </button>
      </Host>
    );
  }
}
