import { Component, h, Host } from '@stencil/core';

@Component({
  tag: 'vocably-spinner',
  styleUrl: 'spinner.scss',
  shadow: true,
})
export class VocablySpinner {
  render() {
    return (
      <Host>
        <div class="spinner" role="status" aria-label="Loading">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </Host>
    );
  }
}
