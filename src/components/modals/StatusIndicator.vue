<template lang="html">
  <div class="box w-25 bg-light drop-shadow border border-primary p-4 text-center">
    {{ status }}
    <i-spinner class="mt-4"></i-spinner>
  </div>
</template>

<script>

export default {
  computed: {
    status() {
      return this.$store.state.processing_message;
    },
  },
};
</script>

<style lang="scss">
  .box {
    margin: 45vh;
  }
</style>
