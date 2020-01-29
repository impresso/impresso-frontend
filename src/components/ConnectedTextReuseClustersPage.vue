<template lang="html">
  <i-layout id="ConnectedTextReuseClustersPage">
    <i-layout-section width="400px" class="border-right p-2">
      <div slot="header">
        [cluster text search placeholder]
        <autocomplete v-on:submit="submit" />
      </div>
      <div class="p-4">
        [list of matching clusters placeholder]
      </div>
    </i-layout-section>
    <i-layout-section class="pt-2">
        [connected clusters placeholder]
    </i-layout-section>
  </i-layout>
</template>

<script>

export default {
  data: () => ({
  }),
};
</script>
