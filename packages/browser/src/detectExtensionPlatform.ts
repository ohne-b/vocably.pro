import { browser } from './browser';

type ExtensionPlatform = {
  url: string;
  name: string;
  platform:
    | 'chromeExtension'
    | 'edgeExtension'
    | 'safariExtension'
    | 'iosSafariExtension';
  paymentLink: string | 'web' | false;
};

const edgeExtensionId = 'dahphaiflimmafjchchidjmgidlkajho';

/**
 * Edge runs the Chrome Web Store build too, and many Edge users have that one
 * installed. The browser alone therefore says nothing about the store; the ID
 * of the running extension does.
 */
const isEdgeAddonsBuild = (): boolean =>
  typeof chrome !== 'undefined' && chrome.runtime?.id === edgeExtensionId;

export const detectExtensionPlatform = (): ExtensionPlatform => {
  if (
    browser.satisfies({
      macos: {
        safari: '>10.1',
      },
    })
  ) {
    return {
      url: 'https://apps.apple.com/app/id6464076425',
      name: 'App Store',
      platform: 'safariExtension',
      paymentLink: false,
    };
  }

  if (
    browser.getOSName(true) === 'ios' &&
    browser.getBrowserName(true) === 'safari' &&
    !browser.getPlatformType(true).includes('desktop')
  ) {
    return {
      url: 'https://apps.apple.com/app/vocably-pro-language-cards/id1641258757',
      name: 'App Store',
      platform: 'iosSafariExtension',
      paymentLink: 'vocably-pro://upgrade',
    };
  }

  if (isEdgeAddonsBuild()) {
    return {
      url: `https://microsoftedge.microsoft.com/addons/detail/${edgeExtensionId}`,
      name: 'Edge Add-ons',
      platform: 'edgeExtension',
      paymentLink: 'web',
    };
  }

  return {
    url: 'https://chrome.google.com/webstore/detail/vocably/baocigmmhhdemijfjnjdidbkfgpgogmb',
    name: 'Chrome Web Store',
    platform: 'chromeExtension',
    paymentLink: 'web',
  };
};
