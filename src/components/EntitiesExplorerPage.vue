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
        <p v-if="e.wikidata && e.wikidata.labels">
          <strong>{{ e.wikidata.labels[activeLanguageCode] }}</strong>
          <em>{{ e.wikidata.descriptions[activeLanguageCode] }}</em>
        </p>
        <p v-else><strong>{{e.name}}</strong></p>
      </div>
    </b-card>

  </i-layout-section>
</template>

<script>
export default {
  data: () => ({
  }),
  computed: {
    entities() {
      return this.$store.state.entities;
    },
    activeLanguageCode() {
      return this.$store.state.settings.language_code;
    },
  },
};
</script>

<style lang="css" scoped>
</style>
