<template>
  <div :class="['seed-phrase-notification', { error: hasError }]">
    <div class="icon-wrapper">
      <AlertIcon v-if="hasError" />
      <CheckCircleIcon v-else />
    </div>
    <div class="text">
      <div>
        {{ notificationMessage }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api/dist/vue-composition-api';
import CheckCircleIcon from '../../icons/check-circle.svg?vue-component';
import AlertIcon from '../../icons/alert.svg?vue-component';

export default defineComponent({
  components: {
    CheckCircleIcon,
    AlertIcon,
  },
  props: {
    hasError: Boolean,
  },
  setup(props, { root }) {
    const notificationMessage = computed(() => props.hasError
      ? root.$t('pages.seed-phrase-settings.seed-phrase-incorrect')
      : root.$t('pages.seed-phrase-settings.seed-phrase-correct'));

    return {
      notificationMessage,
    };
  },
});
</script>

<style lang="scss" scoped>
@use '../../styles/variables';
@use '../../styles/typography';

.seed-phrase-notification {
  min-height: 176px;
  border: 2px solid variables.$color-success-dark;
  border-radius: variables.$border-radius-card;
  background: rgba(variables.$color-black, 0.85);
  position: absolute;
  bottom: 90px;
  width: calc(100% - (2 * var(--screen-padding-x)));
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: variables.$color-success-dark;

  @extend %face-sans-16-medium;

  &.error {
    border-color: variables.$color-danger;
    color: variables.$color-danger;
  }

  .text {
    padding: 16px;
    text-align: center;
  }

  .icon-wrapper {
    width: 40px;
    height: 40px;
    background: rgba(variables.$color-black, 0.3);
    border-radius: 20px;

    .icon {
      width: 40px;
      height: 40px;
    }
  }
}
</style>
