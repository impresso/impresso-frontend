<template lang="html">
  <div v-if="visible" class="punch-explorer drop-shadow"
    :class="{
      'dark-mode': darkMode,
      'bg-dark': darkMode,
    }">
    <h3 class="header pb-2 m-2">
      <slot name="header"></slot>
    </h3>
    <div class="p-2">
      <slot></slot>
    </div>
    <div class="d-flex px-2 pb-2">
      <slot name="footer">
        <b-button
            variant="outline-primary"
            size="sm"
            class="ml-auto"
            @click="$emit('close')">
            {{ $t('actions.close') }}
        </b-button>
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    darkMode: Boolean,
    visible: Boolean,
  },
}
</script>

<style lang="scss">
.punch-explorer {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1040;
  background: white;
  min-width: 240px;
  max-width: 350px;
  &.dark-mode{
    background: black !important;
    color: #caccce;
    h3{
      color: white;
      border-bottom: 1px solid white;
    }
  }
}
</style>
