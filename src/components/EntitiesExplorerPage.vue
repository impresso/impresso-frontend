<template lang="html">
  <i-layout-section>
    <b-navbar type="light" variant="light" class="border-bottom">
      <section>
        <!-- <pre>{{entities}}</pre> -->
        <div class="label small-caps">
          Entities
        </div>
        <h3>List of Entity Timelines</h3>
      </section>
    </b-navbar>
    <b-card v-for="e in entities.entities" class="m-3">
      <div class="clearfix">
        <div
          class="ml-3 float-right"
          v-if="e.wikidata.images">
          <img :src="`http://commons.wikimedia.org/wiki/Special:FilePath/${e.wikidata.images[0].value}?width=200px`" width="100">
        </div>
        <strong>{{e.name}}</strong>
      </div>
      <timeline
       class="border"
            :contrast="false"
            :values="values"
            :domain="[start, end]">
      </timeline>
    </b-card>

  </i-layout-section>
</template>

<script>
import Timeline from './modules/Timeline';

export default {
  data: () => ({
    values: [{ t: 1900, w: 19 }, { t: 1901, w: 34 }, { t: 1902, w: 34 },
    { t: 1903, w: 89 }, { t: 1904, w: 44 }, { t: 1905, w: 34 }],
    start: 1900,
    end: 1905,
    highlights: ['A', 'B'],
    highlightA: null,
    highlightB: null,
    valueType: 'pages',
    scrollTop: 0,
  }),
  components: {
    Timeline,
  },
  computed: {
    entities() {
      return this.$store.state.entities;
    },
  },
};
</script>

<style lang="css" scoped>
</style>
