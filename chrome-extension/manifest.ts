import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

const manifest = {
  manifest_version: 3,
  default_locale: 'en', // Kept for __MSG_...__ localization
  name: '__MSG_extensionName__',
  version: packageJson.version,
  description: '__MSG_extensionDescription__',
  permissions: ['storage'], // Only permission needed
  chrome_url_overrides: {
    newtab: 'new-tab/index.html',
  },
  icons: {
    128: 'icon-128.png',
  },
  // Optional fields below (kept from original but can be removed if unused)
  browser_specific_settings: {
    gecko: {
      id: 'example@example.com',
      strict_min_version: '109.0',
    },
  },
  options_page: 'options/index.html',
  background: {
    service_worker: 'background.js',
    type: 'module',
  },
  action: {
    default_popup: 'popup/index.html',
    default_icon: 'icon-34.png',
  },
};

export default manifest;