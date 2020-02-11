import IndexComponent from './pages/Index';
import AccountComponent from './pages/Account';
import AccountPasswordComponent from './pages/AccountPassword';
import SeedPhraseComponent from './pages/SeedPhrase';
import SignTransactionComponent from './pages/SignTransaction';
import PopupSignTransactionComponent from './pages/Popups/PopupSignTx';
import PopupConnectComponent from './pages/Popups/PopupConnect';
import PopupAskAccountsComponent from './pages/Popups/PopupAskAccounts';
import SettingsComponent from './pages/Settings';
import GeneralSettingsComponent from './pages/GeneralSettings';
import SecuritySettingsComponent from './pages/SecuritySettings';
import AboutSettingsComponent from './pages/AboutSettings';
import TipComponent from './pages/TipPage';
import QrCodeReader from './pages/QrCodeReader';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ImportAccount from './pages/ImportAccount';
import IntroComponent from './pages/Intro';
import TransactionsComponent from './pages/Transactions';
import SendComponent from './pages/Send';
import ReceiveComponent from './pages/Receive';
import SuccessTip from './pages/SuccessTip';
import WelcomePage from './pages/Welcome';

export default [
  {
    path: '/',
    component: IndexComponent,
    meta: {
      title: '',
      navigation: false,
    },
  },
  {
    path: '/account',
    name: 'account',
    component: AccountComponent,
  },
  {
    name: 'password',
    path: '/password',
    component: AccountPasswordComponent,
    props: true,
  },
  {
    name: 'seed',
    path: '/seed',
    component: SeedPhraseComponent,
    props: true,
  },
  {
    name: 'sign',
    path: '/sign-transaction/:type?',
    component: SignTransactionComponent,
    props: true,
  },
  {
    name: 'popup-sign-tx',
    path: '/popup-sign-tx',
    component: PopupSignTransactionComponent,
    props: true,
  },
  {
    name: 'connect',
    path: '/connect',
    component: PopupConnectComponent,
    props: true,
  },
  {
    name: 'ask-accounts',
    path: '/ask-accounts',
    component: PopupAskAccountsComponent,
    props: true,
  },
  {
    path: '/settings',
    component: SettingsComponent,
    meta: {
      title: 'Settings',
    },
  },
  {
    path: '/generalSettings',
    component: GeneralSettingsComponent,
    meta: {
      title: 'General',
    },
  },
  {
    path: '/securitySettings',
    component: SecuritySettingsComponent,
    meta: {
      title: 'Security',
    },
  },
  {
    path: '/aboutSettings',
    component: AboutSettingsComponent,
    meta: {
      title: 'About',
    },
  },
  {
    path: '/tip',
    component: TipComponent,
    meta: {
      title: 'Send æid',
    },
  },
  {
    path: '/qrCodeReader',
    name: 'qrCodeReader',
    props: true,
    component: QrCodeReader,
    meta: {
      title: 'Scan QR',
    },
  },
  {
    path: '/termsOfService',
    component: TermsOfService,
    meta: {
      title: 'Terms & Conditions',
    },
  },
  {
    path: '/privacyPolicy',
    component: PrivacyPolicy,
    meta: {
      title: 'Privacy Policy',
    },
  },
  {
    path: '/importAccount',
    component: ImportAccount,
    meta: {
      title: 'Retrieve Existing Account',
    },
  },
  {
    path: '/intro',
    component: IntroComponent,
  },

  {
    path: '/transactions',
    component: TransactionsComponent,
    meta: {
      title: 'Transactions',
    },
  },
  {
    path: '/send',
    name: 'send',
    props: true,
    component: SendComponent,
    meta: {
      title: 'Withdraw',
    },
  },
  {
    path: '/receive',
    component: ReceiveComponent,
    meta: {
      title: 'Receive',
    },
  },
  {
    path: '/success-tip',
    component: SuccessTip,
    name: 'success-tip',
    props: true,
    meta: {
      title: 'Send æid',
    },
  },
  {
    path: '/welcome',
    component: WelcomePage,
    meta: {
      navigation: false,
    },
  },
];
