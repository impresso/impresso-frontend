<template lang="html">
  <div id="search-facets" class="px-4">
    <div v-for="facet in facets">
      <base-title-bar>{{facet.type}}</base-title-bar>
      <b-button
        v-on:click="submitFacet(facet, bucket)"
        class="mr-2 mb-2"
        v-for="bucket in facet.buckets"
        variant="secondary"
        size="sm">{{bucket.val}} ({{$n(bucket.count)}})</b-button>
    </div>
  </div>
</template>

<script>
import SuggestionFactory from '@/models/SuggestionFactory';
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
        this.$emit('submit-facet', SuggestionFactory.create({
          type: facet.type,
          item: bucket.item,
          h: bucket.val,
          q: bucket.val,
        }));
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
  },
};
</script>

<style lang="less">
</style>
