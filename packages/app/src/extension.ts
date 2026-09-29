import { pingExternal } from '@vocably/extension-messages';
import { isChrome, isEdge, isIOSSafari, isMacSafari } from './browser';
import { environment } from './environments/environment';
import { isFirefox } from './firefox';

export const canExtensionBeInstalled =
  isIOSSafari || isMacSafari || isChrome || isEdge || isFirefox;

const edgeExtensionId = 'dahphaiflimmafjchchidjmgidlkajho';

export const edgeExtensionInstallationUrl = `https://microsoftedge.microsoft.com/addons/detail/${edgeExtensionId}`;

export const chromeExtensionInstallationUrl =
  'https://chrome.google.com/webstore/detail/vocably/baocigmmhhdemijfjnjdidbkfgpgogmb';

const iosSafariExtensionId =
  localStorage.getItem('ios-extension-id') ?? environment.iosSafariExtensionId;

const pingTimeout = 1000;

const isInstalled = (extensionId: string): Promise<boolean> =>
  Promise.race([
    pingExternal(extensionId)
      .then((response) => response === 'pong')
      .catch(() => false),
    new Promise<boolean>((resolve) =>
      setTimeout(() => resolve(false), pingTimeout)
    ),
  ]);

/**
 * Edge runs both builds, and users who found Vocably before the Edge listing
 * existed are still on the Chrome Web Store one. The Edge ID is therefore only
 * used once the Chrome build has been shown to be absent.
 *
 * Firefox never reaches the ID: it talks to the extension over a DOM bridge
 * (see `./firefox`).
 */
const resolveExtensionId = async (): Promise<string> => {
  if (isIOSSafari) {
    return iosSafariExtensionId;
  }

  if (isMacSafari) {
    return environment.safariExtensionId;
  }

  if (!isEdge) {
    return environment.chromeExtensionId;
  }

  return (await isInstalled(environment.chromeExtensionId))
    ? environment.chromeExtensionId
    : edgeExtensionId;
};

const extensionIdPromise = resolveExtensionId();

/**
 * Resolved once per page load. Non-Edge browsers settle immediately.
 */
export const getExtensionId = (): Promise<string> => extensionIdPromise;

export const extensionInstallationUrl = isIOSSafari
  ? 'https://vocably.pro/ios-safari-extension.html'
  : isMacSafari
    ? 'https://apps.apple.com/app/id6464076425'
    : isEdge
      ? edgeExtensionInstallationUrl
      : chromeExtensionInstallationUrl;
