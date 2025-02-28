<template>
  <div
    class="account-switcher"
    :class="{ 'notification-above': notification }"
  >
    <TotalWalletAmount v-if="accounts.length > 1" />
    <swiper
      ref="customSwiper"
      class="swiper"
      :options="swiperOptions"
      @slideChange="onSlideChange"
    >
      <swiper-slide
        v-for="(account, idx) in accounts"
        :key="account.idx"
      >
        <BtnPlain
          v-if="idx !== 0 && !IS_CORDOVA"
          class="swiper-button prev"
          @click="setCurrentSlide(swiper.realIndex - 1)"
        >
          <Chevron />
        </BtnPlain>
        <AccountCard
          :account-idx="account.idx"
          :selected="account.idx === activeIdx"
        />
        <BtnPlain
          v-if="!IS_CORDOVA"
          class="swiper-button next"
          @click="setCurrentSlide(swiper.realIndex + 1)"
        >
          <Chevron />
        </BtnPlain>
      </swiper-slide>
      <swiper-slide>
        <BtnPlain
          v-if="!IS_CORDOVA"
          class="swiper-button prev"
          @click="setCurrentSlide(swiper.realIndex - 1)"
        >
          <Chevron />
        </BtnPlain>
        <AccountCardAdd />
      </swiper-slide>
    </swiper>
    <BulletSwitcher
      v-if="accounts && accounts.length"
      :active-color="getAccountColor(currentIdx)"
      :current-idx="currentIdx"
      :options-size="accounts.length"
      @change="setCurrentSlide"
    />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { Swiper, SwiperSlide } from 'vue-awesome-swiper';
import { watchUntilTruthy } from '../utils';
import { getAddressColor } from '../utils/avatar';

import AccountCard from './AccountCard.vue';
import AccountCardAdd from './AccountCardAdd.vue';
import BtnPlain from './buttons/BtnPlain.vue';
import BulletSwitcher from './BulletSwitcher.vue';
import TotalWalletAmount from './TotalWalletAmount.vue';
import Chevron from '../../icons/chevron.svg?vue-component';

export default {
  components: {
    TotalWalletAmount,
    BulletSwitcher,
    AccountCard,
    AccountCardAdd,
    Swiper,
    SwiperSlide,
    BtnPlain,
    Chevron,
  },
  props: { notification: Boolean },
  data() {
    return {
      IS_CORDOVA: process.env.IS_CORDOVA,
      currentIdx: 0,
      swiperOptions: {
        slidesPerView: 1.1,
        centeredSlides: true,
        spaceBetween: 8,
      },
    };
  },
  computed: {
    ...mapState('accounts', ['activeIdx']),
    ...mapGetters(['accounts']),
    swiper() {
      return this.$refs.customSwiper.$swiper;
    },
  },
  mounted() {
    if (this.activeIdx) {
      this.setCurrentSlide(this.activeIdx, 0);
    }
    this.$watch('activeIdx', (activeIdx) => this.setCurrentSlide(activeIdx, 0));
  },
  methods: {
    async selectAccount(idx) {
      await watchUntilTruthy(() => this.$store.state.middleware);
      this.$store.commit('accounts/setActiveIdx', idx);
    },
    onSlideChange() {
      const { realIndex } = this.swiper;
      if (this.swiper.realIndex < this.accounts.length
        && this.accounts[realIndex]) {
        this.selectAccount(this.accounts[realIndex].idx);
      }
      if (this.currentIdx !== realIndex) this.currentIdx = realIndex;
    },
    getAccountColor(idx) {
      return getAddressColor(this.accounts[idx]?.address);
    },
    setCurrentSlide(idx, slideParams) {
      if (this.currentIdx !== idx) {
        this.currentIdx = idx;
        this.swiper.slideTo(idx, slideParams);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../../styles/variables';
@use '../../styles/mixins';

@import '../../../node_modules/swiper/css/swiper.css';

.account-switcher {
  ::v-deep .account-card,
  ::v-deep .add-account-card {
    width: 100%;
    height: 192px;
    margin: 0;
  }

  .swiper-button {
    position: absolute;
    opacity: 0.5;
    top: 61px;
    color: variables.$color-white;
    z-index: 1;
    height: 60px;
    width: 30px;

    &.prev {
      left: 2px;
      transform: rotate(180deg);
    }

    &.next {
      right: 2px;
    }

    &:hover {
      opacity: 1;
    }
  }
}
</style>
