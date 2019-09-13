<template lang="html">
  <i-layout-section>
    <b-navbar type="light" slot="header" variant="light" class="border-bottom">
      <section style="min-height: 80px;">
        <div class="label small-caps">
          {{ entity.type }}
        </div>
        <h3>{{ entity.name }}
        </h3>
        <div>{{ $tc('count', countMentions) }}</div>
        <b-navbar-nav style='position: absolute; left: 250px; right: 20px; top: 20px'>
            <timeline
                  :contrast="false"
                  :values="timevalues"
                  :domain="[start, end]">
              <div slot-scope="tooltipScope">
                <div v-if="tooltipScope.tooltip.item">
                  {{ $d(tooltipScope.tooltip.item.t, 'year') }} &middot;
                  <b>{{ tooltipScope.tooltip.item.w }}</b>
                </div>
              </div>
            </timeline>
        </b-navbar-nav>
      </section>
    </b-navbar>

    <b-navbar class="wikibox border-bottom py-3">
      <section class="d-flex flex-row w-100" v-if="entity.wikidata">
              <div class="w-25" v-if="preferredImage">
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

    <base-tabs v-model="tab" class="pl-3 bg-light" v-bind:tabs="tabs"></base-tabs>
    <div v-if="tab.name === 'cooccurrences'" class="p-3">
      Cooccurrences
    </div>

    <div v-if="tab.name === 'mentions'">
      <div v-for="(mention, index) in mentions" :key="index" class="p-3 border-bottom d-flex">
        <div v-if="mention.article">
          <b-row>
            <!-- <pre>{{mention.article}}</pre> -->

            <b-col>
              <div v-if="mention.t">
                …{{mention.t}}…
              </div>
              <div v-if="mention.fn == null">
                <span class="small-caps">Function</span>
                <span>{{mention.fn}}</span>
              </div>
              <div v-if="mention.confidence == null">
                <span class="small-caps">Confidence</span> <span>o{{$t(`confidence.${mention.confidence}`)}}</span>
              </div>
              <div v-if="mention.demonym == null">
                <div class="small-caps">demonym</div>
                {{mention.demonym}}
              </div>
            </b-col>

            <b-col cols="6">
              <div v-if="mention.article.excerpt.length > 0" class="article-excerpt mb-2">
                {{mention.article.excerpt}}
              </div>

                <router-link :to="{ name: 'article', params: {
                  issue_uid: mention.article.issue.uid,
                  page_uid: mention.article.pages[0].uid,
                  article_uid: mention.article.uid,
                } }" class="btn btn-sm btn-outline-primary">
                  {{$t('view')}}
                </router-link>
            </b-col>

            <b-col>
              <div class="article-meta mb-2">
                <strong v-if="mention.article.title" class="mb-1">
                  {{mention.article.title}}
                </strong>
                <router-link :to="{ name: 'newspaper', params: { newspaper_uid: mention.article.newspaper.uid }}">
                <div class="link">{{mention.article.newspaper.name}}</div>
                </router-link>
                <p class="small-caps">{{$d(new Date(mention.article.date), "compact")}}
                  (p. <span>{{mention.article.pages.map(page => page.num).join('; ')}}</span>)
                </p>
              </div>
            </b-col>

          </b-row>

          <div class="w-25">

          </div>
          <div class="w-50 px-2">



          </div>
          <div class="w-25">

            <!-- {{mention}} -->
          </div>
        </div>
        <div v-else>
          <div v-if="mention.t">
            …{{mention.t}}…
          </div>
          <div v-if="mention.fn">
            <span class="small-caps">Function</span>
            <span>{{mention.fn}}</span>
          </div>
          <div v-if="mention.confidence">
            <span class="small-caps">Confidence</span> <span>{{$t(`confidence.${mention.confidence}`)}}</span>
          </div>
          <div v-if="mention.demonym">
            <div class="small-caps">demonym</div>
            {{mention.demonym}}
          </div>
        </div>
      </div>
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
    mentions: [],
    timevalues: [],
    // mention: new Mention(),
    start: 1840,
    end: 2020,
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
    countMentions() {
      return this.$store.state.mentions.pagination.totalRows;
    },
    tabs() {
      return [
        {
          label: this.$t('tabs.mentions'),
          name: 'mentions',
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
      return this.$store.dispatch('mentions/LOAD_ENTITY_MENTIONS', {
        filters: [
          {
            q: this.$route.params.entity_id,
            type: 'entity',
          },
        ],
      });
    },
    async onInputPaginationList(page = 1) {
      this.mentions = await this.loadMentions(page);
    },
    onHighlight(event, origin) {
      // console.info(event, origin);
      this.highlights.forEach((vis) => {
        if (vis !== origin) {
          this[`highlight${vis}`] = event.datum;
        }
      });
    },
    parseWkDate(wkDate) {
      let numYear = parseInt(wkDate.split('-')[0], 10);
      // console.info(numYear);
      if (isNaN(numYear)) {
        numYear = parseInt(wkDate.split('-')[1], 10) * -1;
        // console.info(numYear);
      }
      return numYear;
    },
    isLoggedIn() {
      return this.$store.state.user.userData;
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
    "count": "Mentioned only once {n} | Mentioned {n} times",
    "view": "View in context",
    "confidence": {
      "l": "low"
    },
    "tabs": {
        "mentions": "Mentions",
        "cooccurrences": "Cooccurrences"
    }
  }
}
</i18n>
