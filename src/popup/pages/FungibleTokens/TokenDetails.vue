<template>
  <div class="token-details">
    <DetailsRow
      v-if="tokenData.symbol"
      :label="tokenData.isAe ? $t('pages.token-details.coin') : $t('pages.token-details.token')"
      :text="tokenData.symbol"
    >
      <template #text>
        <Tokens
          v-if="tokens"
          class="token-details-tokens"
          :tokens="tokens"
        />
      </template>
    </DetailsRow>
    <DetailsRow
      v-if="tokenData.decimals"
      :label="$t('pages.token-details.decimals')"
      :text="tokenData.decimals"
    />
    <DetailsRow
      v-if="tokenData.contractId"
      :label="$t('pages.token-details.contract')"
    >
      <template #text>
        <AddressShortening :address="tokenData.contractId" />
      </template>
    </DetailsRow>
    <DetailsRow
      v-if="tokenData.circulating_supply"
      :label="$t('pages.token-details.max-supply')"
      :text="formatNumber(tokenData.circulating_supply)"
    />
    <DetailsRow
      v-if="tokenData.total_supply"
      :label="$t('pages.token-details.total-supply')"
      :text="formatNumber(tokenData.total_supply)"
    />
    <DetailsRow
      v-if="tokenData.market_cap"
      :label="$t('pages.token-details.market-cap')"
      class="price"
      :text="formatCurrency(tokenData.market_cap)"
    />
    <DetailsRow
      v-if="tokenPairs.balances"
      :label="$t('pages.token-details.holders')"
      :text="tokenPairs.balances.size"
    />
    <DetailsRow
      v-if="tokenPairs.token0 && tokenPairs.token0.amount > 0"
      :text="getPooledTokenAmount(tokenPairs.token0)"
    >
      <template #label>
        {{ $t('pages.token-details.pooled') }}
        <span class="white">{{ tokenPairs.token0.symbol }}</span>
      </template>
    </DetailsRow>

    <DetailsRow
      v-if="tokenPairs.token1 && tokenPairs.token1.amount > 0"
      :text="getPooledTokenAmount(tokenPairs.token1)"
    >
      <template #label>
        {{ $t('pages.token-details.pooled') }}
        <span class="white">{{ tokenPairs.token1.symbol }}</span>
      </template>
    </DetailsRow>

    <DetailsRow
      v-if="poolShare"
      :label="$t('pages.token-details.poolShare')"
      :text="poolShare"
    />
    <DetailsRow
      v-if="!tokenData.isAe && UNFINISHED_FEATURES"
      :label="$t('pages.token-details.transactions')"
    />

    <DetailsRow
      v-if="tokenData.total_volume"
      :label="$t('pages.token-details.volume')"
      :text="formatCurrency(tokenData.total_volume)"
    />
    <DetailsRow
      v-if="tokenData.market_cap_change_24h"
      class="price"
      :label="$t('pages.token-details.volumeDaily')"
    >
      <template #text>
        <span
          :class="{
            green: tokenData.market_cap_change_percentage_24h > 0,
            red: tokenData.market_cap_change_percentage_24h < 0,
          }"
        >
          {{ Number(tokenData.market_cap_change_percentage_24h).toFixed(2) }}%
        </span>
        {{ formatCurrency(tokenData.market_cap_change_24h) }}
      </template>
    </DetailsRow>
    <DetailsRow
      v-if="!tokenData.isAe && UNFINISHED_FEATURES"
      :label="$t('pages.token-details.feeDaily')"
    />

    <DetailsRow
      v-if="!tokenData.isAe"
      class="link"
      :label="$t('pages.token-details.chart')"
    >
      <template #text>
        <a
          :href="DEX_URL"
          target="_blank"
        >
          {{ displayDexUrl }}
          <ExternalLink />
        </a>
      </template>
    </DetailsRow>
    <DetailsRow
      v-if="!tokenData.isAe && UNFINISHED_FEATURES"
      :label="$t('pages.token-details.price-ae')"
    />
    <DetailsRow
      v-if="tokenData.current_price"
      class="price"
      :label="$t('pages.token-details.price')"
    >
      <template #text>
        <span
          :class="{
            green: tokenData.price_change_percentage_24h > 0,
            red: tokenData.price_change_percentage_24h < 0,
          }"
        >
          {{ Number(tokenData.price_change_percentage_24h).toFixed(2) }}%
        </span>
        {{ formatCurrency(tokenData.current_price) }}
      </template>
    </DetailsRow>
    <DetailsRow
      v-if="tokenData.ath"
      :label="$t('pages.token-details.ath-change')"
      :text="formatCurrency(tokenData.ath)"
    />
    <DetailsRow
      v-if="tokenData.atl"
      :label="$t('pages.token-details.atl-change')"
      :text="formatCurrency(tokenData.atl)"
    />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
} from '@vue/composition-api';
import BigNumber from 'bignumber.js';
import {
  DEX_URL,
  amountRounded,
  convertToken,
} from '../../utils';
import { useGetter } from '../../../composables';

import DetailsRow from '../../components/FungibleTokens/DetailsRow.vue';
import AddressShortening from '../../components/AddressShortening.vue';
import Tokens from '../../components/Tokens.vue';
import ExternalLink from '../../../icons/external-link.svg?vue-component';

export default defineComponent({
  name: 'TokenDetails',
  components: {
    DetailsRow,
    AddressShortening,
    Tokens,
    ExternalLink,
  },
  props: {
    contractId: { type: String, default: null },
    tokenPairs: { type: Object, default: () => ({}) },
    tokenData: { type: Object, default: () => ({}) },
    tokens: { type: Array, default: () => ([]) },
  },
  setup(props) {
    const formatNumber = useGetter('formatNumber');
    const formatCurrency = useGetter('formatCurrency');

    const displayDexUrl = DEX_URL.replace('https://', '');

    const poolShare = computed(() => {
      if (!props.tokenPairs || !props.tokenPairs.balance || !props.tokenPairs.totalSupply) {
        return null;
      }
      return `${amountRounded((new BigNumber(props.tokenPairs.balance))
        .times(100).div(props.tokenPairs.totalSupply))}%`;
    });

    const getPooledTokenAmount = (token: any) => amountRounded(
      convertToken(token.amount, -token.decimals),
    );

    return {
      displayDexUrl,
      DEX_URL,
      UNFINISHED_FEATURES: process.env.UNFINISHED_FEATURES,
      getPooledTokenAmount,
      poolShare,
      formatCurrency,
      formatNumber,
    };
  },
});
</script>

<style lang="scss" scoped>
@use '../../../styles/typography';
@use '../../../styles/variables';

.token-details {
  margin-top: 10px;

  .price {
    .green {
      color: variables.$color-success;
      font-weight: 400;
    }

    .red {
      color: variables.$color-danger;
      font-weight: 400;
    }
  }

  .link a {
    color: variables.$color-grey-light;
    text-decoration: none;
    display: inline-flex;
    align-items: center;

    svg {
      width: 22px;
      height: 22px;
    }
  }

  .address-shortening {
    color: variables.$color-grey-light;

    &:hover {
      color: variables.$color-white;
    }
  }

  .token-details-tokens {
    @extend %face-sans-15-medium;

    color: variables.$color-white;
  }
}
</style>
