<template>
  <div class="comment-new">
    <div class="tip-note-preview">
      {{ text }}
    </div>

    <BtnMain
      :disabled="!tippingSupported"
      @click="sendComment"
    >
      {{ $t('pages.tipPage.confirm') }}
    </BtnMain>
    <BtnMain @click="openCallbackOrGoHome(false)">
      {{ $t('pages.tipPage.cancel') }}
    </BtnMain>

    <Loader v-if="loading" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  watch,
} from '@vue/composition-api';
import { Route } from 'vue-router';
import { MODAL_DEFAULT } from '../utils';
import { useDeepLinkApi, useGetter, useSdk } from '../../composables';
import BtnMain from '../components/buttons/BtnMain.vue';

export default defineComponent({
  name: 'CommentNew',
  components: {
    BtnMain,
  },
  setup(props, { root }) {
    const { getSdk } = useSdk();
    const { openCallbackOrGoHome } = useDeepLinkApi({ router: root.$router });

    const id = ref<string>('');
    const parentId = ref<number | undefined>(undefined);
    const text = ref<string>('');
    const loading = ref<boolean>(false);
    const tippingSupported = useGetter('tippingSupported');

    watch(
      () => root.$route,
      ({ query }: Route) => {
        id.value = query.id as string ?? '';
        parentId.value = query.parentId ? +query.parentId : undefined;
        text.value = query.text as string ?? '';

        if (!id.value || !text.value) {
          root.$router.push({ name: 'account' });
          throw new Error('CommentNew: Invalid arguments');
        }
      },
    );

    async function sendComment() {
      loading.value = true;
      const sdk = await getSdk();
      try {
        await root.$store.dispatch('sendTipComment', [
          id,
          text,
          await sdk.address(),
          parentId,
        ]);
        openCallbackOrGoHome(true);
      } catch (e: any) {
        root.$store.dispatch('modals/open', {
          name: MODAL_DEFAULT,
          title: root.$t('modals.transaction-failed.msg'),
          icon: 'critical',
        });
        e.payload = { id, parentId, text };
        throw e;
      } finally {
        loading.value = false;
      }
    }

    // Wait until the `tippingSupported` is established by the SDK
    (async () => {
      loading.value = true;
      await getSdk();
      loading.value = false;
    })();

    return {
      id,
      parentId,
      text,
      loading,
      tippingSupported,
      sendComment,
    };
  },
});
</script>
