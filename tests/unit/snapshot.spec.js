import Vue from 'vue';
import { mount, RouterLinkStub } from '@vue/test-utils';
import Index from '../../src/popup/router/pages/Index.vue';
import About from '../../src/popup/router/pages/About.vue';
import TermsOfService from '../../src/popup/router/pages/TermsOfService.vue';
import PrivacyPolicy from '../../src/popup/router/pages/PrivacyPolicy.vue';
import Intro from '../../src/popup/router/pages/Intro.vue';

Object.assign(Vue.prototype, {
  $t: () => 'locale-specific-text',
});

describe('Pages', () => {
  [{
    name: 'Index',
    page: Index,
    options: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
    data: [{
      termsAgreed: true,
      IS_WEB: true,
    },
    {
      IS_WEB: false,
    },
    {
      IN_FRAME: true,
    }],
  },
  {
    name: 'About',
    page: About,
    options: {
      stubs: ['router-link'],
    },
    data: [{
      extensionVersion: 'version-specific-text',
    }],
  },
  {
    name: 'TermsOfService',
    page: TermsOfService,
  },
  {
    name: 'PrivacyPolicy',
    page: PrivacyPolicy,
  },
  {
    name: 'Intro',
    page: Intro,
    data: [{
      step: 1,
      totalsteps: 4,
    },
    {
      step: 2,
      totalsteps: 4,
    },
    {
      step: 3,
      totalsteps: 4,
    },
    {
      step: 4,
      totalsteps: 4,
    }],
  }].forEach((test) => it(test.name, async () => {
    const wrapper = mount(test.page, test.options);
    // eslint-disable-next-line no-restricted-syntax
    for (const data of test.data ?? [{}]) {
      // eslint-disable-next-line no-await-in-loop
      await wrapper.setData(data);
      expect(wrapper.element).toMatchSnapshot();
    }
  }));
});
