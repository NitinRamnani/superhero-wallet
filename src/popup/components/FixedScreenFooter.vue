<template>
  <div :class="['fixed-screen-footer', { mobile: IS_MOBILE_DEVICE }]">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { IS_MOBILE_DEVICE } from '../../lib/environment';

export default defineComponent({
  setup() {
    return {
      IS_MOBILE_DEVICE,
    };
  },
});

</script>

<style lang="scss" scoped>
.fixed-screen-footer {
  position: sticky;
  bottom: 0;
  margin: auto 0 0; // Moves the footer to the bottom of the container
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 24px;

  &.mobile {
    margin-bottom: 20px;
  }

  // Semi-transparent and gradient-like cover under the buttons
  &::before {
    content: '';
    position: absolute;
    z-index: -1;
    inset: 0;
    background-color: var(--screen-bg-color);
    top: 40px;
    box-shadow: 0 -30px 20px var(--screen-bg-color);
    opacity: 0.9;
  }

  // Make the footer bottom rounded corners the same as the container
  &,
  &::before {
    border-bottom-left-radius: inherit;
    border-bottom-right-radius: inherit;
  }
}
</style>
