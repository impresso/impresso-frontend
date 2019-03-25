<template lang="html">
  <div id="search-facets">
    <div v-for="(facet, index) in facets" class="pt-1px border-top border-tertiary">
      <div class="px-3 py-2 border-top small">
        <base-title-bar>{{facet.type}}</base-title-bar>
        <ul v-if="facet.type === 'language'" class="list-unstyled">
          <li v-for="bucket in facet.buckets" class="facet-filter">
            <div class="left">
              <a href="#" v-on:click.prevent="submitFacet(facet, bucket, 'include')">{{$t(`languages.${bucket.item.uid}`)}} ({{$n(bucket.count)}})</a>
            </div>
            <div class="right pl-1">
              <a href="#" v-on:click.prevent="submitFacet(facet, bucket, 'exclude')">Exclude</a>
            </div>
          </li>
        </ul>
        <ul v-if="facet.type === 'topic'" class="list-unstyled">
          <li v-for="bucket in facet.buckets" class="facet-filter">
            <div class="left">
              <a href="#" v-on:click.prevent="submitFacet(facet, bucket, 'include')">{{bucket.item.getHtmlExcerpt()}} ({{$n(bucket.count)}})</a>
            </div>
            <div class="right pl-1">
              <a href="#" v-on:click.prevent="submitFacet(facet, bucket, 'exclude')">Exclude</a>
            </div>
          </li>
        </ul>
        <ul v-if="facet.type === 'newspaper'" class="list-unstyled">
          <li v-for="bucket in facet.buckets" class="facet-filter">
            <div class="left">
              <a href="#" v-on:click.prevent="submitFacet(facet, bucket, 'include')">{{bucket.item.name}} ({{$n(bucket.count)}})</a>
            </div>
            <div class="right pl-1">
              <a href="#" v-on:click.prevent="submitFacet(facet, bucket, 'exclude')">Exclude</a>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
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
    submitFacet(facet, bucket, context = 'include') {
      if (facet.type === 'topic') {
        this.$emit('submit-facet', {
          type: facet.type,
          item: bucket.item,
          h: bucket.val,
          q: bucket.val,
          context,
        });
      } else if (facet.type === 'newspaper') {
        this.$emit('submit-facet', {
          type: facet.type,
          item: bucket.item,
          context,
        });
      } else if (facet.type === 'language') {
        this.$emit('submit-facet', {
          type: facet.type,
          item: bucket.item,
          context,
        });
      }
    },
  },
  components: {
    BaseTitleBar,
  },
};
</script>

<style scoped lang="scss">
.facet-filter{
  display: grid;
  grid-template-columns: auto min-content;
  grid-template-areas: "left" "right";
  .left{
    grid-area: "left"
  }
  .right{
    opacity: 0;
    grid-area: "right"
  }
  &:hover{
    .right{
      opacity: 1;
    }
  }
}
</style>
