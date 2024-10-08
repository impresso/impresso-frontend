<template lang="html">
  <div class="h-100 v-100" id="test-frame">
    <iframe :src="getIframeSrc" :style="getStyle" allowtransparency="true" />
  </div>
</template>

<script>
export default {
  computed: {
    getIframeSrc() {
      return '/img/abcd?size=cover&bg=none'
    },
    getStyle() {
      return {
        width: '400px',
        height: '400px'
      }
    }
  }
}
</script>

<style lang="css" scoped>
#test-frame {
  background: #333;
}
</style>
