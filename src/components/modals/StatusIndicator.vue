<template>
  <div class="box w-25 bg-light drop-shadow border border-primary p-4 text-center">
    {{ $t('loading') }}
    <i-spinner class="mt-4"></i-spinner>
  </div>
</template>

<script>
export default {
  computed: {}
}
</script>

<style lang="scss">
.box {
  position: absolute;
  left: 37.5%; // 50% - (25% / 2)
  top: 42vh; // 42 is the answer to the universe
}
</style>
