<template>
  <div
    class="index"
    :class="{ 'extended-top-padding': !IS_WEB && !IS_MOBILE_DEVICE }"
  >
    <img
      v-if="IN_FRAME"
      src="../../icons/iframe/sendAndReceive.svg"
    >
    <div
      v-else
      class="not-iframe"
    >
      <SuperheroLogoIcon class="superhero-logo" />
      <div class="heading">
        <i18n
          path="pages.index.heading.message"
          tag="span"
          class="tag"
        >
          <span class="receive">{{ $t('pages.index.heading.receive') }}</span>
          <span class="store">{{ $t('pages.index.heading.store') }}</span>
          <span class="send">{{ $t('pages.index.heading.send') }}</span>
          <span class="aeternity-name">{{ $t('pages.index.heading.aeternityBlockchain') }}</span>
        </i18n>
      </div>

      <Platforms v-if="!IS_EXTENSION">
        <template #header>
          {{ $t('pages.index.platforms.heading') }}
        </template>
        <template #footer>
          {{ $t('pages.index.webVersion') }}
        </template>
      </Platforms>
    </div>

    <div :class="['terms-agreement', { mobile: !IS_WEB }]">
      <CheckBox
        v-model="termsAgreed"
        data-cy="checkbox"
      >
        <span>
          {{ $t('pages.index.term1') }}
        </span>
      </CheckBox>
      <RouterLink
        :to="{ name: 'about-terms' }"
        data-cy="terms"
        class="terms-of-use"
        :class="{ agreed: termsAgreed }"
      >
        {{ $t('pages.index.termsAndConditions') }}
      </RouterLink>
    </div>
    <div
      class="wallet-button-box"
    >
      <BtnSubheader
        v-show="termsAgreed"
        data-cy="generate-wallet"
        :subheader="$t('pages.index.getStartedWithWallet')"
        :header="$t('pages.index.generateWallet')"
        @click="createWallet"
      >
        <PlusCircleIcon />
      </BtnSubheader>
      <BtnSubheader
        v-show="termsAgreed"
        data-cy="import-wallet"
        :subheader="$t('pages.index.enterSeed')"
        :header="$t('pages.index.importWallet')"
        @click="importWallet"
      >
        <CheckCircleIcon />
      </BtnSubheader>
    </div>
  </div>
</template>

<script>
import { generateMnemonic } from '@aeternity/bip39';
import {
  IS_EXTENSION, IS_WEB, IN_FRAME, IS_MOBILE_DEVICE,
} from '../../lib/environment';
import CheckBox from '../components/CheckBox.vue';
import BtnSubheader from '../components/buttons/BtnSubheader.vue';
import Platforms from '../components/Platforms.vue';
import { MODAL_ACCOUNT_IMPORT } from '../utils/constants';
import SuperheroLogoIcon from '../../icons/logo.svg?vue-component';
import PlusCircleIcon from '../../icons/plus-circle-fill.svg?vue-component';
import CheckCircleIcon from '../../icons/check-circle-fill.svg?vue-component';

export default {
  components: {
    SuperheroLogoIcon,
    CheckBox,
    BtnSubheader,
    PlusCircleIcon,
    CheckCircleIcon,
    Platforms,
  },
  data: () => ({
    termsAgreed: false,
    IS_EXTENSION,
    IS_WEB,
    IS_MOBILE_DEVICE,
    IN_FRAME,
  }),
  methods: {
    async createWallet() {
      this.$store.commit('setMnemonic', generateMnemonic());
      this.$router.push(this.$store.state.loginTargetLocation);
    },
    async importWallet() {
      await this.$store.dispatch('modals/open', {
        name: MODAL_ACCOUNT_IMPORT,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../../styles/variables';
@use '../../styles/typography';
@use '../../styles/mixins';

.index {
  --padding-top: 44px;

  padding-top: var(--padding-top);
  padding-top: calc(var(--padding-top) + env(safe-area-inset-top));
  text-align: center;

  &.extended-top-padding {
    --padding-top: 64px;
  }

  .terms-agreement {
    @include mixins.flex(center, center);

    margin-bottom: 16px;

    .terms-of-use {
      @extend %face-sans-15-regular;

      color: rgba(variables.$color-white, 0.75);
      text-decoration: none;
      margin-left: 4px;

      &:hover {
        color: variables.$color-white;
        text-decoration: underline;
      }

      &.agreed {
        color: white;
      }
    }

    &.mobile {
      margin-top: 32px;
    }
  }

  .not-iframe {
    text-align: center;

    .superhero-logo {
      height: 32px;
      margin-bottom: 8px;
    }

    .heading {
      @extend %face-sans-18-medium;

      @include mixins.flex(center);

      line-height: 125%;
      color: variables.$color-white;
      margin: 4px 60px 24px;

      .tag {
        color: rgba(variables.$color-white, 0.75);

        .receive,
        .store,
        .send {
          color: variables.$color-white;
        }

        .aeternity-name {
          color: variables.$color-danger;
        }
      }
    }

    &.mobile {
      @extend %face-sans-20-regular;

      color: variables.$color-white;
      max-width: 80%;
      margin: 0 auto;
      min-height: 25vh;
      padding-top: 30px;
    }

    &.go {
      @extend %face-sans-20-bold;

      margin-top: -36px;
      margin-bottom: 42px;
    }

    .spinner {
      width: 256px;
      height: 256px;
      color: variables.$color-primary;
    }

    .platforms {
      margin: 0 auto;
      max-width: 312px;
    }
  }

  .wallet-button-box {
    margin-inline: 16px;
    padding-block: 4px;
  }
}
</style>
