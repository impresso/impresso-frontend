<template lang="html">
  <i-layout-section>
    <b-navbar type="light" variant="light" class="border-bottom">
      <section>
        <div class="label small-caps" v-if="entity.wikidata">
          {{ entity.wikidata.type }}
        </div>
        <h3>{{ entity.name }}
          <span class="text-tertiary"> {{ entity.countItems }} | {{ entity.countMentions }}</span>
        </h3>
      </section>
    </b-navbar>
    <div class="m-3" v-if="entity.wikidata">

            <div class="float-right ml-4">
              <iframe
                v-if="entity.wikidata.coordinates"
                width="300" height="250"
                :src="`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&marker=${entity.wikidata.coordinates.latitude},${entity.wikidata.coordinates.longitude}`"
                class="border mb-2">
              </iframe>
              <div class="border mb-2" v-for="(im, index) in entity.wikidata.images">
                <img :src="`http://commons.wikimedia.org/wiki/Special:FilePath/${im.value}?width=600px`" width="300">
              </div>
              <div class="small small-caps text-right">
                <a :href="`https://www.wikidata.org/wiki/${this.entity.wikidata.id}`"
                  target="_blank">Source: wikiData/{{entity.wikidata.id}}</a>
              </div>
            </div>

            <div>
              <p v-if="entity.wikidata.descriptions">
                <strong>{{ entity.wikidata.labels[activeLanguageCode] }}</strong>
                <em>{{ entity.wikidata.descriptions[activeLanguageCode] }}</em>
              </p>
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
              <p>
                <strong>{{mention.l}}</strong> Occurrences (1902 - 1989), <br>
                <strong>{{mention.r}}</strong> mentions within corpus.
              </p>
              <!-- <pre class="small">{{mention}}</pre> -->
            </div>

            <!-- <pre class="small">{{ entity}}</pre> -->

    </div>
    <div class="m-3" v-else>This entity does not contain wikidata</div>


  </i-layout-section>

</template>

<script>
import Entity from '@/models/Entity';
import Mention from '@/models/Mention';

export default {
  data: () => ({
    entity: new Entity(),
    mentions: {},
    // mention: new Mention(),
  }),
  computed: {
    activeLanguageCode() {
      return this.$store.state.settings.language_code;
    },
    mention() {
      if (!this.mentions.data) {
        return new Mention();
      }
      return this.mentions.data.find(x => x.id === this.$route.params.entity_id);
    },
    bbox() {
      if (!this.entity.wikidata) {
        return '';
      }
      const coords = this.entity.wikidata.coordinates;
      const bbox = `${coords.longitude - 2},${coords.latitude - 1},${coords.longitude + 2},${coords.latitude + 1}`;
      return bbox;
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
        // console.log(numYear);
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
