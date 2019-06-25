<template lang="html">
  <i-layout-section>
    <b-navbar type="light" slot="header" variant="light" class="border-bottom">
      <section>
        <div class="label small-caps">
          {{ entity.type }}
        </div>
        <h3>{{ entity.name }}
        </h3>
        <div>{{ $tc('found_articles', entity.countItems) }} {{$tc('found_entities', entity.countMentions)}}</div>
      </section>
    </b-navbar>
    <b-navbar type="light" variant="light" class="border-bottom">
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
    <b-navbar class="wikibox border-bottom py-3">
      <section class="d-flex flex-row w-100" v-if="entity.wikidata">
              <div class="w-25">
                <!-- <iframe
                  v-if="entity.wikidata.coordinates"
                  width="300" height="250"
                  :src="`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&marker=${entity.wikidata.coordinates.latitude},${entity.wikidata.coordinates.longitude}`"
                  class="border mb-2">
                </iframe> -->
                <img
                  :title="preferredImage.value"
                  :src="`http://commons.wikimedia.org/wiki/Special:FilePath/${preferredImage.value}?width=300px`" width="98%">
              </div>

              <div class="w-75 pl-2">
                <p v-if="entity.wikidata.descriptions">
                  <span class="text-serif px-1 mr-1 bg-white border">W</span>
                  <br>
                  <strong>{{ entity.wikidata.labels[activeLanguageCode] }}</strong>
                  <br>
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
                <b-button
                  v-if="entity.wikidata.coordinates"
                  variant="outline-primary" size="sm" target="_blank"
                  :href="`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&marker=${entity.wikidata.coordinates.latitude},${entity.wikidata.coordinates.longitude}`">
                  OpenStreetMaps
                </b-button>
                <a class="position-absolute border-top border-left px-2 small-caps bg-white"
                  style="right:0; bottom:0"
                    :href="`https://www.wikidata.org/wiki/${this.entity.wikidata.id}`"
                    target="_blank">
                    Source: <span class="text-serif">W</span>/{{entity.wikidata.id}}</a>
                <!-- <pre class="small">{{mention}}</pre> -->
              </div>


              <!-- <pre class="small">{{ entity}}</pre> -->

      </section>
      </div>

    </b-navbar>
    <!-- {{mentions}} -->

    <base-tabs v-model="tab" class="pl-3 bg-light" v-bind:tabs="tabs"></base-tabs>
    <div v-if="tab.name === 'cooccurrences'" class="p-3">
      Cooccurrences
    </div>
    <div v-if="tab.name === 'articles' && mentions">
      <a v-for="mention in mentions" class="p-3 border-bottom d-flex" href="#">
        <div class="w-25">
          <p>
            <strong>Journal officiel de la Ville de Vevey</strong><br>
            <span class="small-caps">Saturday, December 30, 2000 <br>(p. 6)</span>
          </p>
        </div>
        <div class="w-50 px-2">
          <p>
            <strong>Bush-Gore Un suspense à couper le souffle</strong>
          </p>
          <p class="small">Les armes de destruction massive doivent

être bannies de la planète à l'aube de ce

nouveau millénaire. <mark>S'exprimant</mark> hier à la tribune

du Conseil national, Mikhaïl Gorbatchev

(photo Keystone) a lancé un appel pour une

pide élimination des ...</p>

        </div>
        <div class="w-25">
          <div v-if="mention.t">
            <div class="small-caps">Context</div>
            …{{mention.t}}…
          </div>
          <div v-if="mention.fn == null">
            <div class="small-caps">Function</div>
            {{mention.fn}}
          </div>
          <!-- {{mention}} -->
        </div>
      </a>
      <div
        v-if="paginationList.totalRows > paginationList.perPage"
        class="fixed-pagination-footer p-1 m-0">
        <pagination
          v-bind:perPage="paginationList.perPage"
          v-bind:currentPage="paginationList.currentPage"
          v-bind:totalRows="paginationList.totalRows"
          v-on:change="onInputPaginationList"
          class="small-caps"
          v-bind:showDescription="false" />
      </div>
      <!-- <pre>{{mention}}</pre> -->
    </div>


  </i-layout-section>

</template>

<script>
import Entity from '@/models/Entity';
// import Mention from '@/models/Mention';
import Timeline from './modules/Timeline';
import Pagination from './modules/Pagination';
import BaseTabs from './base/BaseTabs';

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
    tab: {},
  }),
  components: {
    Timeline,
    Pagination,
    BaseTabs,
  },
  computed: {
    tabs() {
      return [
        {
          label: this.$t('tabs.articles'),
          name: 'articles',
          active: true,
        },
        {
          label: this.$t('tabs.cooccurrences'),
          name: 'cooccurrences',
          // disabled: true,
        },
      ];
    },
    preferredImage() {
      if (this.entity.wikidata.images) {
        const el = this.entity.wikidata.images.find(im => im.rank === 'preferred');
        return el || this.entity.wikidata.images[0];
      }
      return null;
    },
    activeLanguageCode() {
      return this.$store.state.settings.language_code;
    },
    // mention() {
    //   if (!this.mentions) {
    //     return new Mention();
    //   }
    //   // return whole object for testing
    //   return this.mentions;
    //   // return this.mentions.data.find(x => x.id === this.$route.params.entity_id);
    // },
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
      console.log('page => ', page);
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

<style lang="scss" scoped>
@import "impresso-theme/src/scss/variables.sass";
.wikibox {
  background: $clr-bg-secondary;
}
a:hover {
  text-decoration: none;
}
</style>

<i18n>
{
  "en": {
    "found_articles": "Found in {n} article | Found in {n} articles",
    "found_entities": "and {n} mention within corpus | and {n} mentions within corpus",
    "tabs": {
        "articles": "Articles",
        "cooccurrences": "Cooccurrences"
    }
  }
}
</i18n>
