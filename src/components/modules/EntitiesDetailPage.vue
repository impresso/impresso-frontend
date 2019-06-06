<template lang="html">
  <i-layout-section class="p-3">
    <b-card>
      <div class="float-right">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/DBP_1977_926_Jean_Monnet.jpg/300px-DBP_1977_926_Jean_Monnet.jpg" alt="DBP 1977 926 Jean Monnet">
      </div>
      <div class="small-caps">
        {{ entity.wikidata.type }}
      </div>
      <h1>{{ entity.name }}</h1>
      <p>
        <a
          v-if="entity.wikidata.birthPlace"
          :href="`https://www.wikidata.org/wiki/${this.entity.wikidata.birthPlace.id}`"
          target="_blank">
          {{ entity.wikidata.birthPlace.labels[activeLanguageCode] }}</a>,
        <span v-if="entity.wikidata.birthDate">
          {{ parseWkDate(entity.wikidata.birthDate)  }} -
        </span>
        <a
          v-if="entity.wikidata.deathPlace"
          :href="`https://www.wikidata.org/wiki/${this.entity.wikidata.deathPlace.id}`"
          target="_blank">
          {{ entity.wikidata.deathPlace.labels[activeLanguageCode] }}</a>,
        </span>
        {{ parseWkDate(entity.wikidata.deathDate)  }}
      </p>
      <p>
        <strong>French political economist regarded by many as a chief architect of European unity</strong>
      </p>
      <p>
        <strong>6</strong> Occurrences (1902 - 1989), <br>
        <strong>7</strong> mentions within corpus.
      </p>
      <div class="float-right small small-caps">
        <a href="https://www.wikidata.org/wiki/Q159700">Source: WikiData</a>
      </div>
      <pre>{{ entity}}</pre>
    </b-card>
  </i-layout-section>

</template>

<script>
import Entity from '@/models/Entity';

export default {
  data: () => ({
    entity: new Entity(),
  }),
  computed: {
    activeLanguageCode() {
      return this.$store.state.settings.language_code;
    },
  },
  methods: {
    async getEntity() {
      return this.$store.dispatch('entities/LOAD_DETAIL', this.$route.params.entity_id);
    },
    parseWkDate(wkDate) {
      let numYear = parseInt(wkDate.split('-')[0], 10);
      // console.log(numYear);
      if (isNaN(numYear)) {
        numYear = parseInt(wkDate.split('-')[1], 10) * -1;
        console.log(numYear);
      }
      return numYear;
    },
  },
  watch: {
    '$route.params.entity_id': {
      immediate: true,
      async handler() {
        this.entity = await this.getEntity();
      },
    },
  },
};
</script>

<style lang="css" scoped>
</style>
