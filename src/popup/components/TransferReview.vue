<template>
  <div class="review-wrapper">
    <ModalHeader
      :title="$t('pages.send.reviewtx')"
      :subtitle="$t('pages.send.checkalert')"
    />

    <DetailsItem
      :label="$t('pages.send.sender')"
      data-cy="review-sender"
    >
      <template #value>
        <AvatarWithChainName
          :address="account.address"
          :name="account.name"
          :show-address="!isRecipientName"
        />
      </template>
    </DetailsItem>

    <DetailsItem
      v-if="isAddressUrl"
      data-cy="review-tip-url"
      class="tip-url"
      :label="$t('pages.send.receivingUrl')"
      :value="transferData.address"
    />
    <DetailsItem
      v-else
      data-cy="review-recipient"
      :label="$t('pages.send.recipient')"
    >
      <template #value>
        <AvatarWithChainName
          :address="transferData.address"
          :name="isAddressChain ? transferData.address : null"
          :show-address="!isAddressChain"
        />
      </template>
    </DetailsItem>

    <DetailsItem
      :label="$t('pages.tipPage.amountLabel')"
    >
      <template #value>
        <TokenAmount
          :amount="+transferData.amount"
          :symbol="tokenSymbol"
          :hide-fiat="isSelectedAssetAex9"
          data-cy="review-total"
        />
      </template>
    </DetailsItem>

    <DetailsItem
      :label="$t('pages.signTransaction.fee')"
    >
      <template #value>
        <TokenAmount
          :amount="+transferData.fee.toFixed()"
          symbol="AE"
          hide-fiat
          high-precision
          data-cy="review-fee"
        />
      </template>
    </DetailsItem>
    <DetailsItem
      v-if="transferData.selectedAsset.contractId === AETERNITY_CONTRACT_ID"
      :label="$t('pages.signTransaction.total')"
    >
      <template #value>
        <TokenAmount
          :amount="+transferData.total"
          symbol="AE"
          hide-fiat
          high-precision
          data-cy="review-fee"
        />
      </template>
    </DetailsItem>
    <Loader v-if="loading" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api';
import { SCHEMA } from '@aeternity/aepp-sdk';
import { useDeepLinkApi, useGetter } from '../../composables';
import {
  aeToAettos,
  checkAensName,
  convertToken,
  escapeSpecialChars,
} from '../utils';
import { IAccount, IPendingTransaction, ISdk } from '../../types';
import { MODAL_DEFAULT, AETERNITY_CONTRACT_ID } from '../utils/constants';
import DetailsItem from './DetailsItem.vue';
import TokenAmount from './TokenAmount.vue';
import AvatarWithChainName from './AvatarWithChainName.vue';
import ModalHeader from './ModalHeader.vue';

export default defineComponent({
  name: 'TransferReview',
  components: {
    ModalHeader,
    AvatarWithChainName,
    DetailsItem,
    TokenAmount,
  },
  model: {
    prop: 'transferData',
  },
  props: {
    transferData: { type: Object, required: true },
    isAddressChain: Boolean,
    isAddressUrl: Boolean,
    recipientAddress: { type: String, default: null },
    amount: { type: Number, default: null },
  },
  setup(props, { root, emit }) {
    const { openCallbackOrGoHome } = useDeepLinkApi({ router: root.$router });
    const loading = ref<boolean>(false);
    const account = computed<IAccount>(() => root.$store.getters.account);
    const tippingV1 = computed(() => root.$store.state.tippingV1);
    const tippingV2 = computed(() => root.$store.state.tippingV2);
    const sdk = useGetter<ISdk>('sdkPlugin/sdk');
    const isRecipientName = computed(
      () => props.recipientAddress && checkAensName(props.recipientAddress),
    );
    const tokenSymbol = computed(() => props.transferData.selectedAsset?.symbol || '-');
    const tippingContract = computed(() => tippingV2.value || tippingV1.value);
    const isSelectedAssetAex9 = computed(() => (
      !!props.transferData.selectedAsset
      && props.transferData.selectedAsset.contractId !== AETERNITY_CONTRACT_ID
    ));

    function openTransactionFailedModal() {
      root.$store.dispatch('modals/open', {
        name: MODAL_DEFAULT,
        title: root.$t('modals.transaction-failed.msg'),
        icon: 'critical',
      });
    }

    async function transfer({ amount, recipient, selectedAsset }: any) {
      loading.value = true;
      try {
        let actionResult;

        if (props.transferData.invoiceId !== null) {
          actionResult = await root.$store.dispatch('fungibleTokens/burnTriggerPoS', [
            selectedAsset.contractId,
            amount,
            props.transferData.invoiceContract,
            props.transferData.invoiceId,
            { waitMined: false, modal: false },
          ]);
        } else if (selectedAsset.contractId !== AETERNITY_CONTRACT_ID) {
          actionResult = await root.$store.dispatch('fungibleTokens/transfer', [
            selectedAsset.contractId,
            recipient,
            amount,
            { waitMined: false, modal: false },
          ]);
        } else {
          actionResult = await sdk.value.spend(amount, recipient, {
            waitMined: false,
            modal: false,
          });
        }

        if (actionResult && selectedAsset.contractId !== AETERNITY_CONTRACT_ID) {
          const transaction: IPendingTransaction = {
            amount,
            recipient,
            hash: actionResult.hash,
            type: 'spendToken',
            pendingTokenTx: true,
            tx: {
              callerId: account.value.address,
              contractId: selectedAsset.contractId,
              type: SCHEMA.TX_TYPE.contractCall,
              function: 'transfer',
            },
          };

          root.$store.dispatch('addPendingTransaction', transaction);
        } else if (actionResult) {
          const transaction: IPendingTransaction = {
            hash: actionResult.hash,
            amount,
            type: 'spend',
            tx: {
              senderId: account.value.address,
              recipientId: recipient,
              type: SCHEMA.TX_TYPE.spend,
            },
          };

          root.$store.dispatch('addPendingTransaction', transaction);
        }
        emit('success');
      } catch (error) {
        openTransactionFailedModal();
        throw error;
      } finally {
        loading.value = false;
      }
    }

    async function sendTip({
      amount,
      recipient,
      selectedAsset,
      note,
    }: any) {
      loading.value = true;
      try {
        let txResult = null;
        if (selectedAsset.contractId !== AETERNITY_CONTRACT_ID) {
          await root.$store.dispatch('fungibleTokens/createOrChangeAllowance', [
            selectedAsset.contractId,
            props.amount,
          ]);
          txResult = await tippingV2.value.methods.tip_token(
            recipient,
            escapeSpecialChars(note),
            selectedAsset.contractId,
            amount,
          );
        } else {
          txResult = await tippingContract.value.call(
            'tip',
            [recipient, escapeSpecialChars(note)],
            {
              amount,
              waitMined: false,
              modal: false,
            },
          );
        }
        const transaction: IPendingTransaction = {
          hash: txResult.hash,
          amount,
          tipUrl: recipient,
          tx: {
            callerId: account.value.address,
            contractId: tippingContract.value.deployInfo.address,
            type: SCHEMA.TX_TYPE.contractCall,
            function: 'tip',
            selectedTokenContractId: selectedAsset.contractId,
          },
        };
        root.$store.dispatch('addPendingTransaction', transaction);
        openCallbackOrGoHome(true);
        emit('success');
      } catch (error: any) {
        openCallbackOrGoHome(false);
        openTransactionFailedModal();
        error.payload = { url: recipient };
        throw error;
      } finally {
        loading.value = false;
      }
    }

    async function submit() {
      const {
        amount: amountRaw,
        address: recipient,
        selectedAsset,
        note,
      } = props.transferData;

      if (!amountRaw || !recipient || !selectedAsset) {
        return;
      }

      const amount = (selectedAsset.contractId === AETERNITY_CONTRACT_ID)
        ? aeToAettos(amountRaw)
        : convertToken(amountRaw, selectedAsset.decimals);

      if (props.isAddressUrl) {
        sendTip({
          amount,
          recipient,
          selectedAsset,
          note,
        });
      } else {
        transfer({
          amount,
          recipient,
          selectedAsset,
        });
      }
    }

    return {
      AETERNITY_CONTRACT_ID,
      loading,
      submit,
      isRecipientName,
      isSelectedAssetAex9,
      tokenSymbol,
      account,
    };
  },
});
</script>
