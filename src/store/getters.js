import { derivePathFromKey, getKeyPair } from '@aeternity/hd-wallet/src/hd-key';
import { generateHDWallet as generateHdWallet } from '@aeternity/hd-wallet/src';
import { mnemonicToSeed } from '@aeternity/bip39';
import { Crypto } from '@aeternity/aepp-sdk/es';
import { defaultNetworks } from '../popup/utils/constants';

const getHdWalletAccount = (wallet, accountIdx = 0) => {
  const keyPair = getKeyPair(derivePathFromKey(`${accountIdx}h/0h/0h`, wallet).privateKey);
  return {
    ...keyPair,
    idx: accountIdx,
    address: Crypto.aeEncodeKey(keyPair.publicKey),
  };
};

export default {
  account({ mnemonic }, getters) {
    if (!mnemonic) return {}; // TODO: Return null
    const account = getHdWalletAccount(generateHdWallet(mnemonicToSeed(mnemonic)));
    return {
      ...account,
      name: getters['names/getDefault'](account.address),
      type: 'Main account',
    };
  },
  isLoggedIn: (state, { account }) => Object.keys(account).length > 0,
  currentCurrencyRate: ({ current: { currency }, currencies }) => currencies[currency] || 0,
  convertToCurrency: (state, { currentCurrencyRate }) => (value) =>
    +(currentCurrencyRate * value).toFixed(2),
  formatCurrency: ({ current: { currency } }) => (value) =>
    // TODO: Use the current language from i18n module
    new Intl.NumberFormat(navigator.language, { style: 'currency', currency }).format(value),
  convertToCurrencyFormatted: (state, { convertToCurrency, formatCurrency }) => (value) =>
    formatCurrency(convertToCurrency(value)),
  minTipAmount: ({ currencies: { usd } }) => 0.01 / usd,
  networks({ userNetworks }) {
    return [
      ...defaultNetworks,
      ...userNetworks.map((network, index) => ({ index, ...network })),
    ].reduce((acc, n) => ({ ...acc, [n.name]: n }), {});
  },
  activeNetwork({ current: { network } }, { networks }) {
    return networks[network];
  },
  getProfileImage: (_, { activeNetwork }) => (address) =>
    `${activeNetwork.backendUrl}/profile/image/${address}`,
  getAvatar: () => (address) => `https://avatars.z52da5wt.xyz/${address}`,
  tippingSupported(state, { activeNetwork }) {
    return (
      ['ae_mainnet', 'ae_uat'].includes(activeNetwork.networkId) || process.env.RUNNING_IN_TESTS
    );
  },
};
