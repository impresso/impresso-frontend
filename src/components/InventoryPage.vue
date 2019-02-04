<template lang="html">
  <i-layout id="inventory">
    <div id="spinner">
        <div>
             <img src="https://www.ajaxload.info/images/exemples/25.gif" />
        </div>
    </div>
    <iframe src="https://organicdesignlabs.com/impresso/inventory/" width="100%" height="100%" frameborder="0" />
  </i-layout>
</template>

<script>
export default {
  mounted() {
    this.$store.commit('SET_HEADER_TITLE', {
      subtitle: 'Inventory',
      title: 'Corpus',
    });
  },
};
</script>
