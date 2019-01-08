<template lang="html">
  <i-layout-section class="p-3">
    <h3>Collections Explorer Page</h3>
  </i-layout-section>
</template>

<script>
import Collection from '@/models/Collection';

export default {
  computed: {
    collections: {
      get() {
        return this.$store.getters['collections/collections'].filter(
          c => c.name.toLowerCase().indexOf(this.search.toLowerCase()) !== -1);
      },
    },
    collectionAll: {
      get() {
        let articles = 0;
        let entities = 0;
        let issues = 0;
        let pages = 0;

        this.collections.forEach((item) => {
          articles += item.countArticles;
          entities += item.countEntities;
          issues += item.countIssues;
          pages += item.countPages;
        });

        return new Collection({
          uid: 'all',
          name: 'All Collections',
          description: 'This shows a combination of all your custom collections',
          countArticles: articles,
          countEntities: entities,
          countPages: pages,
          countIssues: issues,
        });
      },
    },
  },
};
</script>

<style lang="css">
</style>
