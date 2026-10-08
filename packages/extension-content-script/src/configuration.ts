export type ContentScriptConfiguration = {
  askForRatingEnabled: boolean;
  displayMobileLookupButton: boolean;
  allowFirstTranslationCongratulation: boolean;
  webPaymentLink: string;
  // Used instead of the platform's own payment link when set. A web page that
  // embeds the content script has no store to send the user to.
  paymentLink?: string;
};

export let contentScriptConfiguration: ContentScriptConfiguration = {
  askForRatingEnabled: false,
  displayMobileLookupButton: false,
  allowFirstTranslationCongratulation: false,
  webPaymentLink: 'https://app.vocably.pro/subscribe',
};

export const configureContentScript = (
  configuration: Partial<ContentScriptConfiguration>
) => {
  contentScriptConfiguration = {
    ...contentScriptConfiguration,
    ...configuration,
  };
};
