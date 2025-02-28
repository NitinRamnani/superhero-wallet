import Vue from 'vue';
import { Validator, ErrorBag, install as VeeValidate } from 'vee-validate/dist/vee-validate.minimal.esm';
import { required } from 'vee-validate/dist/rules.esm';
import BigNumber from 'bignumber.js';
import { debounce } from 'lodash-es';
import { Crypto } from '@aeternity/aepp-sdk';
import { i18n } from './languages';
import {
  isNotFoundError,
  getAddressByNameEntry,
  checkAensName,
  validateTipUrl, isValidURL,
} from '../../popup/utils/helper';
import { AENS_DOMAIN } from '../../popup/utils/constants';

Vue.use(VeeValidate);

const filteredRules = (errors, validatedField, rules) => errors.filter(
  ({ field, rule }) => field === validatedField && !rules.includes(rule),
);

Object.assign(Validator.prototype, {
  firstExcept(field, rules) {
    return filteredRules(this.errors.items, field, rules)[0]?.msg;
  },
  anyExcept(field, rules) {
    return !!(filteredRules(this.errors.items, field, rules).length);
  },
});

Object.assign(ErrorBag.prototype, {
  firstByRules(field, rules) {
    return rules.map((r) => this.firstByRule(field, r)).find((r) => r);
  },
  anyByRules(field, rules) {
    return !!this.firstByRules(field, rules);
  },
});

Validator.extend('url', (url) => isValidURL(url));
Validator.extend('required', required);
Validator.extend('account', (value) => Crypto.isAddressValid(value) || checkAensName(value));
Validator.extend('name', (value) => checkAensName(`${value}${AENS_DOMAIN}`));
Validator.extend('min_value', (value, [arg]) => BigNumber(value).isGreaterThanOrEqualTo(arg));
Validator.extend('min_value_exclusive', (value, [arg]) => BigNumber(value).isGreaterThan(arg));
Validator.extend('max_value', (value, [arg]) => BigNumber(value).isLessThanOrEqualTo(arg));

Validator.localize('en', {
  messages: {
    url: () => i18n.t('validation.url'),
    required: () => i18n.t('validation.required'),
    account: () => i18n.t('validation.address'),
    name: () => i18n.t('validation.name'),
    name_registered_address: () => i18n.t('validation.nameRegisteredAddress'),
    name_unregistered: () => i18n.t('validation.nameUnregistered'),
    not_same_as: () => i18n.t('validation.notSameAs'),
    token_to_an_address: () => i18n.t('validation.tokenToAnAddress'),
    min_value: (field, [arg]) => i18n.t('validation.minValue', [arg]),
    min_value_exclusive: (field, [arg]) => i18n.t('validation.minValueExclusive', [arg]),
    max_value: (field, [arg]) => i18n.t('validation.maxValue', [arg]),
    enough_ae: () => i18n.t('validation.enoughAe'),
    not_token: () => i18n.t('validation.notToken'),
    name_registered_address_or_url: () => i18n.t('validation.invalidAddressChainUrl'),
    min_tip_amount: () => i18n.t('pages.tipPage.minAmountError'),
    invalid_hostname: () => i18n.t('pages.network.error.invalidHostname'),
    network_name: () => i18n.t('pages.network.error.enterName'),
    network_exists: () => i18n.t('pages.network.error.networkExists'),
  },
});

export default (store) => {
  const NAME_STATES = {
    REGISTERED: Symbol('name state: registered'),
    REGISTERED_ADDRESS: Symbol('name state: registered and points to address'),
    UNREGISTERED: Symbol('name state: unregistered'),
    NOT_SAME: Symbol('name state: not same as provided'),
  };

  const checkNameDebounced = debounce(
    async (name, expectedNameState, comparedAddress, { resolve, reject }) => {
      try {
        const nameEntry = await store.getters['sdkPlugin/sdk'].api.getNameEntryByName(name);
        const address = getAddressByNameEntry(nameEntry);
        resolve(({
          [NAME_STATES.REGISTERED]: true,
          [NAME_STATES.REGISTERED_ADDRESS]: !!address,
          [NAME_STATES.UNREGISTERED]: false,
          [NAME_STATES.NOT_SAME]: comparedAddress !== address,
        }[expectedNameState]));
      } catch (error) {
        if (!isNotFoundError(error)) reject(error);
        else {
          resolve(
            expectedNameState === NAME_STATES.UNREGISTERED
            || expectedNameState === NAME_STATES.NOT_SAME,
          );
        }
      }
    },
    300,
    { leading: true },
  );

  let lastName;
  const checkName = (expectedNameState) => (name, [comparedAddress]) => new Promise(
    (resolve, reject) => {
      if (name === lastName) checkNameDebounced.flush();
      lastName = name;
      checkNameDebounced(name, expectedNameState, comparedAddress, { resolve, reject });
    },
  );

  const checkNameRegisteredAddress = async (value) => {
    try {
      return Crypto.isAddressValid(value) || await checkName(NAME_STATES.REGISTERED_ADDRESS)(
        value, [],
      );
    } catch (error) {
      return false;
    }
  };

  Validator.extend('min_tip_amount', (value) => BigNumber(value).isGreaterThan(store.getters.minTipAmount));
  Validator.extend('name_unregistered', (value) => checkName(NAME_STATES.UNREGISTERED)(`${value}.chain`, []));
  Validator.extend('name_registered_address', (value) => checkAensName(value) && checkNameRegisteredAddress(value));
  Validator.extend('token_to_an_address', {
    validate(value, args) {
      return !checkAensName(value) || (checkAensName(value) && !args.isToken);
    },
    params: ['isToken'],
  });
  Validator.extend('not_same_as', (nameOrAddress, [comparedAddress]) => {
    if (!checkAensName(nameOrAddress)) return nameOrAddress !== comparedAddress;
    return checkName(NAME_STATES.NOT_SAME)(nameOrAddress, [comparedAddress]);
  });
  Validator.extend('enough_ae', (_, [arg]) => new Promise(
    (resolve) => store.state.observables.balance
      .subscribe((balance) => resolve(balance.isGreaterThanOrEqualTo(arg)))
      .unsubscribe(),
  ));
  Validator.extend('name_registered_address_or_url', (value) => (checkAensName(value)
    ? checkNameRegisteredAddress(value) : Crypto.isAddressValid(value) || validateTipUrl(value)));
  Validator.extend('invalid_hostname', (value) => {
    try {
      const _url = new URL(value);
      return !!_url.hostname;
    } catch (error) {
      return false;
    }
  });
  Validator.extend('network_name', (value) => ({
    valid: !!value,
    data: {
      required: true,
    },
  }), {
    computesRequired: true,
  });
  Validator.extend('network_exists', (name, [index, networks]) => {
    const networkWithSameName = networks[name];
    return !networkWithSameName
      && (index === undefined || networkWithSameName?.index !== index);
  });
};
