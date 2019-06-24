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
      <timeline
            :contrast="false"
            :values="timevalues"
            :domain="[start, end]"
            v-on:highlight="onHighlight($event, 'A')">
        <div slot-scope="tooltipScope">
          <div v-if="tooltipScope.tooltip.item">
            {{tooltipScope}}
            {{ $d(tooltipScope.tooltip.item.t, 'year') }} &middot;
            <b>{{ tooltipScope.tooltip.item.w }}</b>
          </div>
        </div>
      </timeline>
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
              <p v-if="mention">
                <div
                  v-if="paginationList.totalRows > paginationList.perPage"
                  slot="footer"
                  class="p-2 border-top">
                  <pagination
                    v-bind:perPage="paginationList.perPage"
                    v-bind:currentPage="paginationList.currentPage"
                    v-bind:totalRows="paginationList.totalRows"
                    v-on:change="onInputPaginationList"
                    class="small-caps"
                    v-bind:showDescription="false" />
                </div>
                <strong>{{mention[this.$route.params.entity_id].l}}</strong> Occurrences (1902 - 1989), <br>
                <strong>{{mention[this.$route.params.entity_id].r}}</strong> mentions within corpus.
                <pre>{{mention}}</pre>
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
import Timeline from './modules/Timeline';
import Pagination from './modules/Pagination';


export default {
  data: () => ({
    entity: new Entity(),
    mentions: {},
    timevalues: [],
    // mention: new Mention(),
    start: 1800,
    end: 2000,
    highlights: ['A'],
    highlightA: null,
  }),
  components: {
    Timeline,
    Pagination,
  },
  computed: {
    activeLanguageCode() {
      return this.$store.state.settings.language_code;
    },
    mention() {
      if (!this.mentions) {
        return new Mention();
      }
      // return whole object for testing
      return this.mentions;
      // return this.mentions.data.find(x => x.id === this.$route.params.entity_id);
    },
    paginationList() {
      return this.$store.state.mentions.pagination;
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
    // async getMentions() {
    //   return this.$store.dispatch('mentions/LOAD_DETAIL', this.$route.params.entity_id);
    // },
    async getTimeline() {
      return this.$store.dispatch('entities/LOAD_TIMELINE', this.$route.params.entity_id);
    },
    loadMentions(page) {
      if (page !== undefined) {
        this.$store.commit('mentions/UPDATE_PAGINATION_CURRENT_PAGE', parseInt(page, 10));
      }
      return this.$store.dispatch('mentions/LOAD_DETAIL', this.$route.params.entity_id);
    },
    onInputPaginationList(page = 1) {
      console.log(page);
      this.loadMentions(page);
    },
    onHighlight(event, origin) {
      // console.log(event, origin);
      this.highlights.forEach((vis) => {
        if (vis !== origin) {
          this[`highlight${vis}`] = event.datum;
        }
      });
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
        this.mentions = await this.loadMentions(1);
        this.timevalues = await this.getTimeline();
      },
    },
  },
};
</script>

<style lang="css" scoped>
</style>
