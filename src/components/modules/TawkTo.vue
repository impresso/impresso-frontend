<template lang="html">
  <div id="tawk-to" ref="tawkTo" />
</template>

<script>
export default {
  props: {
    site_id: {
      required: true,
    },
  },
  mounted() {
    const siteId = this.site_id;
    /* eslint-disable */
    var Tawk_API = Tawk_API || {};
    var Tawk_LoadStart = new Date();
    (function() {
      var s1 = document.createElement("script"),
        s0 = document.getElementById("tawk-to");
      s1.async = true;
      s1.src = `https://embed.tawk.to/${siteId}/default`;
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      s0.parentNode.insertBefore(s1, s0);
    })();
    /* eslint-enable */
  },
};

</script>

<style lang="scss">
</style>
