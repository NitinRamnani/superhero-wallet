<template>
  <Connect
    :app="app"
    :resolve="onResolve"
    :reject="onReject"
    :access="[POPUP_CONNECT_ADDRESS_PERMISSION]"
  />
</template>

<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api';
import { useDeepLinkApi } from '../../composables';
import { POPUP_CONNECT_ADDRESS_PERMISSION } from '../utils/constants';
import Connect from './Popups/Connect.vue';

export default defineComponent({
  name: 'Address',
  components: { Connect },
  setup(props, { root }) {
    const { openCallbackOrGoHome, callbackOrigin } = useDeepLinkApi({ router: root.$router });
    const app = computed<any>(() => callbackOrigin.value ? ({
      name: callbackOrigin.value.hostname,
      url: callbackOrigin.value.origin,
      host: callbackOrigin.value.host,
    }) : {});

    const onResolve = () => openCallbackOrGoHome(true, {
      address: root.$store.getters.account.address,
      networkId: root.$store.getters.activeNetwork.networkId,
    });

    const onReject = () => openCallbackOrGoHome(false);

    return {
      onResolve,
      onReject,
      app,
      POPUP_CONNECT_ADDRESS_PERMISSION,
    };
  },
});
</script>
