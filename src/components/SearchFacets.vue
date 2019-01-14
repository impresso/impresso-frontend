<template lang="html">
  <div id="search-facets" class="px-4">
    <div v-for="(facet, index) in facets">
      <base-title-bar>{{facet.type}}</base-title-bar>
      <facet-language
        v-if="facet.type === 'language'"
        v-model="facets[index]"
        v-on:submit="submitFacet"
      />
      <facet-topic
        v-else-if="facet.type === 'topic'"
        v-model="facets[index]"
        v-on:submit="submitFacet"
      />
      <facet-newspaper
        v-else-if="facet.type === 'newspaper'"
        v-model="facets[index]"
        v-on:submit="submitFacet"
      />
    </div>
  </div>
</template>

<script>
import FacetLanguage from './modules/FacetLanguage';
import FacetTopic from './modules/FacetTopic';
import FacetNewspaper from './modules/FacetNewspaper';
import BaseTitleBar from './base/BaseTitleBar';

export default {
  data: () => ({
    facetsOrder: ['language', 'newspaper', 'topic'],
  }),
  computed: {
    facets: {
      get() {
        return this.$store.state.search.facets.sort((a, b) => {
          const indexA = this.facetsOrder.indexOf(a.type);
          const indexB = this.facetsOrder.indexOf(b.type);

          if (indexA < indexB) {
            return -1;
          }

          if (indexA > indexB) {
            return 1;
          }

          return 0;
        });
      },
    },
  },
  methods: {
    submitFacet(facet, bucket) {
      if (facet.type === 'topic') {
        this.$emit('submit-facet', {
          type: facet.type,
          item: bucket.item,
          h: bucket.val,
          q: bucket.val,
        });
      } else if (facet.type === 'newspaper') {
        this.$emit('submit-facet', {
          type: facet.type,
          item: bucket.item,
        });
      } else if (facet.type === 'language') {
        this.$emit('submit-facet', {
          type: facet.type,
          item: bucket.item,
        });
      }
    },
  },
  components: {
    BaseTitleBar,
    FacetLanguage,
    FacetNewspaper,
    FacetTopic,
  },
};
</script>

<style lang="less">
</style>
