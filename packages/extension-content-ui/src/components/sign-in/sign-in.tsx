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

type Benefit = {
  key: string;
  // Material Design Icons
  icon: string;
};

const benefits: Benefit[] = [
  {
    // cloud-sync-outline
    key: 'sign_in.benefit.sync',
    icon: 'M13.03 18C13.08 18.7 13.24 19.38 13.5 20H6.5C5 20 3.69 19.5 2.61 18.43C1.54 17.38 1 16.09 1 14.58C1 13.28 1.39 12.12 2.17 11.1S4 9.43 5.25 9.15C5.67 7.62 6.5 6.38 7.75 5.43S10.42 4 12 4C13.95 4 15.6 4.68 16.96 6.04C18.32 7.4 19 9.05 19 11C19.04 11 19.07 11 19.1 11C18.36 11.07 17.65 11.23 17 11.5V11C17 9.62 16.5 8.44 15.54 7.46C14.56 6.5 13.38 6 12 6S9.44 6.5 8.46 7.46C7.5 8.44 7 9.62 7 11H6.5C5.53 11 4.71 11.34 4.03 12.03C3.34 12.71 3 13.53 3 14.5S3.34 16.29 4.03 17C4.71 17.66 5.53 18 6.5 18H13.03M19 13.5V12L16.75 14.25L19 16.5V15C20.38 15 21.5 16.12 21.5 17.5C21.5 17.9 21.41 18.28 21.24 18.62L22.33 19.71C22.75 19.08 23 18.32 23 17.5C23 15.29 21.21 13.5 19 13.5M19 20C17.62 20 16.5 18.88 16.5 17.5C16.5 17.1 16.59 16.72 16.76 16.38L15.67 15.29C15.25 15.92 15 16.68 15 17.5C15 19.71 16.79 21.5 19 21.5V23L21.25 20.75L19 18.5V20Z',
  },
  {
    // cellphone-link
    key: 'sign_in.benefit.study',
    icon: 'M22,17H18V10H22M23,8H17A1,1 0 0,0 16,9V19A1,1 0 0,0 17,20H23A1,1 0 0,0 24,19V9A1,1 0 0,0 23,8M4,6H22V4H4A2,2 0 0,0 2,6V17H0V20H14V17H4V6Z',
  },
  {
    // file-delimited-outline
    key: 'sign_in.benefit.export',
    icon: 'M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2M18 20H6V4H13V9H18V20M10 19L12 15H9V10H15V15L13 19H10',
  },
];

@Component({
  tag: 'vocably-sign-in',
  styleUrl: 'sign-in.scss',
  shadow: true,
})
export class VocablySignIn {
  @Element() el: HTMLElement;
  @Event() confirm: EventEmitter;

  private unsubLocale: (() => void) | undefined;

  connectedCallback() {
    this.unsubLocale = subscribeToLocale(this.el, () => forceUpdate(this.el));
  }

  disconnectedCallback() {
    this.unsubLocale?.();
  }

  render() {
    return (
      <Host data-test="sign-in">
        <div class="container">
          <div class="header">
            <div class="title">{t('sign_in.title')}</div>
            <div class="description">{t('sign_in.description')}</div>
          </div>
          <ul class="benefits">
            {benefits.map((benefit) => (
              <li class="benefit" key={benefit.key}>
                <span class="benefit-icon-tile">
                  <svg
                    class="benefit-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d={benefit.icon} />
                  </svg>
                </span>
                <span class="benefit-text">{t(benefit.key)}</span>
              </li>
            ))}
          </ul>
          <button
            class="button"
            data-test="sign-in-button"
            onClick={() => this.confirm.emit()}
          >
            <span>{t('sign_in.button')}</span>
            <svg
              class="button-arrow"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z" />
            </svg>
          </button>
        </div>
      </Host>
    );
  }
}
