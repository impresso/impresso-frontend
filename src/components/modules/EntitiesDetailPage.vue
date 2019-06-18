<template lang="html">
  <i-layout-section class="p-3">
    <b-card v-if="entity.wikidata">

      <div class="float-right ml-4">
        <div class="border mb-2" v-for="(im, index) in entity.wikidata.images">
          <img :src="`http://commons.wikimedia.org/wiki/Special:FilePath/${im.value}?width=600px`" width="300">
        </div>
        <iframe
          v-if="entity.wikidata.coordinates"
          width="300" height="250"
          :src="`https://www.openstreetmap.org/export/embed.html?bbox=&marker=${entity.wikidata.coordinates.latitude},${entity.wikidata.coordinates.longitude}`"
          class="border mb-2">
        </iframe>
        <div class="small small-caps text-right">
          <a :href="`https://www.wikidata.org/wiki/${this.entity.wikidata.id}`"
            target="_blank">Source: wikiData/{{entity.wikidata.id}}</a>
        </div>
      </div>

      <div>
        <div class="small-caps">
          {{ entity.wikidata.type }} // {{ mention.type }}
        </div>
        <h1>{{ entity.name }}</h1>
        <p>
          <a
            v-if="entity.wikidata.birthPlace"
            :href="`https://www.wikidata.org/wiki/${this.entity.wikidata.birthPlace.id}`"
            target="_blank">
            {{ entity.wikidata.birthPlace.labels[activeLanguageCode] }},</a>
          <span v-if="entity.wikidata.birthDate">
            {{ parseWkDate(entity.wikidata.birthDate) }} -
          </span>
          <a
            v-if="entity.wikidata.deathPlace"
            :href="`https://www.wikidata.org/wiki/${this.entity.wikidata.deathPlace.id}`"
            target="_blank">
            {{ entity.wikidata.deathPlace.labels[activeLanguageCode] }},</a>
          <span v-if="entity.wikidata.deathDate">
          {{ parseWkDate(entity.wikidata.deathDate) }}
          </span>
        </p>
        <p v-if="entity.wikidata.descriptions">
          <strong>{{ entity.wikidata.labels[activeLanguageCode] }}</strong>
          <em>{{ entity.wikidata.descriptions[activeLanguageCode] }}</em>
        </p>
          <strong>{{mention.l}}</strong> Occurrences (1902 - 1989), <br>
          <strong>{{mention.r}}</strong> mentions within corpus.
        </p>
        <pre class="small">{{mention}}</pre>
      </div>

      <pre class="small">{{ entity}}</pre>
    </b-card>
    <b-card v-else>This entity does not contain wikidata</b-card>
  </i-layout-section>

</template>

<script>
import Entity from '@/models/Entity';
// import Mention from '@/models/Mention';

export default {
  data: () => ({
    entity: new Entity(),
    // mentions: new Mention(),
  }),
  computed: {
    activeLanguageCode() {
      return this.$store.state.settings.language_code;
    },
    mention() {
      return this.mentions.data.find(x => x.id === this.$route.params.entity_id);
    },
  },
  methods: {
    async getEntity() {
      return this.$store.dispatch('entities/LOAD_DETAIL', this.$route.params.entity_id);
    },
    async getMentions() {
      return this.$store.dispatch('mentions/LOAD_DETAIL', this.$route.params.entity_id);
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
        this.mentions = await this.getMentions();
      },
    },
  },
};
</script>

<style lang="css" scoped>
</style>
