<template>
  <BtnPlain
    v-bind="$attrs"
    class="tab"
    :class="{ active }"
    :text="text"
    v-on="$listeners"
  />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import BtnPlain from '../buttons/BtnPlain.vue';

export default defineComponent({
  components: {
    BtnPlain,
  },
  props: {
    text: { type: String, required: true },
    active: Boolean,
  },
});
</script>

<style lang="scss" scoped>
@use '../../../styles/variables';
@use '../../../styles/typography';
@use '../../../styles/mixins';

.tab {
  @extend %face-sans-14-medium;

  @include mixins.flex(center, center, row);

  flex: 1 1 0;
  padding: 4px 10px;
  border-radius: variables.$border-radius-interactive - 3px;
  color: rgba(variables.$color-white, 0.75);
  transition: all 100ms;

  &:hover {
    color: variables.$color-white;
  }

  &.router-link-active,
  &.active {
    background-color: rgba(variables.$color-white, 0.15);
    color: variables.$color-white;
  }
}
</style>
