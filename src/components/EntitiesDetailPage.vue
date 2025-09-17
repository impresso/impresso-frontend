<template>
  <i-layout-section v-if="entity" main>
    <template v-slot:header>
      <div class="border-bottom bg-light">
        <b-navbar type="light" variant="light">
          <section>
            <h3 v-if="entity">
              <span v-html="entity.name" />
              <span class="badge small-caps ml-1 bg-medium badge-light">
                {{ $t(`types.${entity.type}`) }}
              </span>
            </h3>
          </section>
        </b-navbar>

        <b-tabs pills>
          <template v-slot:tabs-end>
            <b-nav-item
              v-for="(tabItem, i) in tabs"
              :key="i"
              class="pl-2"
              :class="{ active: tabItem.name === tab.name }"
              active-class="none"
              :to="{
                name: 'entity',
                params: { entity_id: entity.uid },
                query: { tab: tabItem.name }
              }"
            >
              <span v-html="tabItem.label" />
            </b-nav-item>
          </template>
        </b-tabs>
        <!-- navbars below the pills tabs -->
        <b-navbar>
          <b-navbar-nav class="pr-2 border-right">
            <li>
              <router-link class="btn btn-outline-primary btn-sm" :to="searchPageLink">
                {{ $t('actions.searchMore') }}
              </router-link>
            </li>
          </b-navbar-nav>
          <b-navbar v-if="tab.name === 'overview'">
            <div v-if="description">"<span v-html="description" />" (wikidata)</div>
          </b-navbar>
          <b-navbar-nav v-if="tab.name === 'content-items' || tab.name === 'mentions'" class="px-2">
            <li>
              <i-dropdown
                v-model="orderBy"
                v-bind:options="orderByOptions"
                size="sm"
                variant="outline-primary"
              ></i-dropdown>
            </li>
          </b-navbar-nav>
        </b-navbar>
      </div>
    </template>

    <!-- BODY ILayout-->
    <div class="items p-3">
      <div v-if="tab.name === 'content-items'">
        <div v-for="(item, index) in items" :key="index">
          <article-item
            :item="asArticle(item as ContentItem)"
            show-meta
            show-excerpt
            show-entities
            show-matches
            show-link
            class="mb-2 pb-2 border-bottom"
          />
        </div>
      </div>

      <div v-if="tab.name === 'overview'">
        <b-navbar class="wikibox border-bottom pb-3" v-if="entity.wikidata?.id">
          <section class="d-flex flex-row w-100">
            <div class="w-25" v-if="preferredImage">
              <!-- <iframe
                      v-if="entity.wikidata.coordinates"
                      width="300" height="250"
                      :src="`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&marker=${entity.wikidata.coordinates.latitude},${entity.wikidata.coordinates.longitude}`"
                      class="border mb-2">
                    </iframe> -->
              <div :style="preferredImageStyle"></div>
            </div>

            <div class="w-75 pl-2">
              <p v-if="entity.wikidata.descriptions">
                <span class="text-serif px-1 mr-1 bg-white border">W</span>
                <br />
                <strong>{{ entity.wikidata.labels[activeLanguageCode] }}</strong>
                <br />
                <em>{{ entity.wikidata.descriptions[activeLanguageCode] }}</em>
              </p>
              <p>
                <a
                  v-if="entity.wikidata.birthPlace"
                  :href="`https://www.wikidata.org/wiki/${entity.wikidata.birthPlace.id}`"
                  target="_blank"
                >
                  {{ entity.wikidata.birthPlace.labels[activeLanguageCode] }},</a
                >
                <span v-if="entity.wikidata.birthDate">
                  {{ parseWkDate(entity.wikidata.birthDate) }} -
                </span>
                <a
                  v-if="entity.wikidata.deathPlace"
                  :href="`https://www.wikidata.org/wiki/${entity.wikidata.deathPlace.id}`"
                  target="_blank"
                >
                  {{ entity.wikidata.deathPlace.labels[activeLanguageCode] }},</a
                >
                <span v-if="entity.wikidata.deathDate">
                  {{ parseWkDate(entity.wikidata.deathDate) }}
                </span>
              </p>
              <a
                class="btn btn-outline-primary btn-sm"
                target="_blank"
                v-if="entity.wikidata.coordinates"
                :href="`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&marker=${entity.wikidata.coordinates.latitude},${entity.wikidata.coordinates.longitude}`"
              >
                OpenStreetMaps
              </a>
              <a
                class="position-absolute border-top border-left px-2 small-caps bg-white"
                style="right: 0; bottom: 0"
                :href="`https://www.wikidata.org/wiki/${entity.wikidata.id}`"
                target="_blank"
              >
                Source: <span class="text-serif">W</span>/{{ entity.wikidata.id }}</a
              >
              <!-- <pre class="small">{{mention}}</pre> -->
            </div>

            <!-- <pre class="small">{{ entity}}</pre> -->
          </section>
        </b-navbar>
        <div class="position-relative mt-4">
          <timeline :domain="[startYear, endYear]" :contrast="false" :values="timevalues">
            <template v-slot="tooltipScope">
              <div v-if="tooltipScope.tooltip.item">
                {{ $d(tooltipScope.tooltip.item?.t ?? 0, 'year') }} &middot;
                <span
                  v-html="
                    $tc('numbers.contentItems', tooltipScope.tooltip.item?.w ?? 0, {
                      n: $n(tooltipScope.tooltip.item?.w ?? 0)
                    })
                  "
                ></span>
              </div>
            </template>
          </timeline>
        </div>
        <b-container fluid class="my-3">
          <!-- <h2>Facets – top ten buckets</h2> -->
          <b-row>
            <b-col sm="12" md="12" lg="6" xl="4" v-for="(facet, idx) in facets" v-bind:key="idx">
              <stacked-bars-panel
                class=""
                :label="facet.type"
                :buckets="facet.buckets"
                :facet-type="facet.type"
              />
            </b-col>
          </b-row>
        </b-container>
      </div>

      <div v-if="tab.name === 'mentions'">
        <div
          v-for="(item, index) in items as EntityMention[]"
          :key="index"
          class="border-bottom mb-3 pb-3"
        >
          <mention-item :item="item" class="ml-2" />
          <article-item
            :item="asArticle(item.contentItem)"
            show-meta
            show-excerpt
            show-link
            as-reference
            class="bg-light p-2"
          />
        </div>
      </div>
    </div>

    <template v-slot:footer v-if="tab.name === 'content-items' || tab.name === 'mentions'">
      <div class="fixed-pagination-footer p-1 m-0 mb-2">
        <pagination
          v-bind:perPage="paginationList.perPage"
          v-bind:currentPage="paginationList.currentPage"
          v-bind:totalRows="paginationList.totalRows"
          v-on:change="onInputPagination"
          class="float-left small-caps"
        />
      </div>
    </template>
  </i-layout-section>
</template>

<script lang="ts">
import Pagination from '@/components/modules/Pagination.vue'
import Timeline from '@/components/modules/Timeline.vue'
import ArticleItem from '@/components/modules/lists/ArticleItem.vue'
import MentionItem from '@/components/modules/lists/MentionItem.vue'
import StackedBarsPanel from '@/components/modules/vis/StackedBarsPanel.vue'
import Facet, { FacetType } from '@/models/Facet'
import { getImpressoMetadata } from '@/models/ImpressoMetadata'
import SearchQuery from '@/models/SearchQuery'
import { searchFacets as searchFacetsService } from '@/services'
import type { FindQuery as FindContentItemsQuery } from '@/services/types/contentItems'
import type { FindQuery as FindMentionsQuery } from '@/services/types/mentions'
import type { FindQuery as FindFacetsQuery } from '@/services/types/searchFacets'
import { useEntitiesStore } from '@/stores/entities'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'
import { mapStores } from 'pinia'
import { PropType } from 'vue'

import Article from '@/models/Article'
import Bucket from '@/models/Bucket'
import { EntityMention } from '@/models/generated/schemas'
import { ContentItem } from '@/models/generated/schemas/contentItem'
import { LocationQueryRaw, RouteLocationRaw } from 'vue-router'

type TabId = 'content-items' | 'mentions' | 'overview'

export type EntityFacetType = Exclude<FacetType, 'textReuseCluster' | 'textReusePassage' | 'year'>

export interface IData {
  entity: any
  mentions: any[]
  timevalues: any[]
  tab: { name?: TabId; label?: string }
  paginationList: {
    perPage: number
    currentPage: number
    totalRows: number
  }
  contentItemsOrderBy: FindContentItemsQuery['order_by']
  mentionsOrderBy?: FindMentionsQuery['order_by']
  items: ContentItem[] | EntityMention[]
  facets: Facet<EntityFacetType>[]
}

export default {
  props: {
    facetTypes: {
      type: Array as PropType<EntityFacetType[]>,
      default: () => [
        'country',
        'language',
        'type',
        'person',
        'location',
        'topic',
        'partner',
        'accessRight',
        'collection'
      ]
    }
  },
  data: (): IData =>
    ({
      entity: null,
      mentions: [],
      timevalues: [],
      tab: {},
      paginationList: {
        perPage: 10,
        currentPage: 1,
        totalRows: 0
      },
      contentItemsOrderBy: '-relevance',
      mentionsOrderBy: undefined,
      items: [],
      facets: []
    }) satisfies IData,
  components: {
    Timeline,
    Pagination,
    ArticleItem,
    MentionItem,
    StackedBarsPanel
  },
  computed: {
    ...mapStores(useEntitiesStore, useSettingsStore, useUserStore),
    startYear() {
      return getImpressoMetadata().impressoDocumentsYearSpan?.firstYear
    },
    endYear() {
      return getImpressoMetadata().impressoDocumentsYearSpan?.lastYear
    },
    preferredImageStyle() {
      return {
        backgroundColor: 'black',
        backgroundSize: 'cover',
        width: '120px',
        height: '120px',
        backgroundImage: `url('http://commons.wikimedia.org/wiki/Special:FilePath/${this.preferredImage.value}?height=120px')`
      }
    },
    searchPageLink() {
      if (!this.entity) {
        return { name: 'search' }
      }
      return {
        name: 'search',
        query: SearchQuery.serialize({
          filters: [{ type: this.entity.type, q: this.entity.uid }]
        }) as LocationQueryRaw
      } satisfies RouteLocationRaw
    },
    description() {
      if (!this.entity || !this.entity.wikidata || !this.entity.wikidata.descriptions) {
        return null
      }
      return this.entity.wikidata.descriptions.en
    },
    orderBy: {
      get() {
        if (this.tab.name === 'content-items') {
          return this.contentItemsOrderBy
        } else if (this.tab.name === 'mentions') {
          return this.mentionsOrderBy
        }
        return undefined
      },
      set(value) {
        if (this.tab.name === 'content-items') {
          this.contentItemsOrderBy = value
        } else if (this.tab.name === 'mentions') {
          this.mentionsOrderBy = value
        }
        this.loadItems()
      }
    },
    orderByOptions(): {
      value: FindContentItemsQuery['order_by'] | FindMentionsQuery['order_by']
      text: string
    }[] {
      if (this.tab.name === 'content-items') {
        return [
          {
            value: 'date',
            text: this.$t('sort.publicationDate.asc')
          },
          {
            value: '-date',
            text: this.$t('sort.publicationDate.desc')
          },
          {
            value: 'relevance',
            text: this.$t('sort.relevanceArticles.asc')
          },
          {
            value: '-relevance',
            text: this.$t('sort.relevanceArticles.desc')
          }
        ] satisfies {
          value: FindContentItemsQuery['order_by']
          text: string
        }[]
      }

      return [
        {
          value: undefined,
          text: this.$t('sort.relevanceArticles.asc')
        },
        {
          value: 'id',
          text: this.$t('sort.idMentions.asc')
        },
        {
          value: '-id',
          text: this.$t('sort.idMentions.desc')
        }
      ] satisfies {
        value: FindMentionsQuery['order_by']
        text: string
      }[]
    },
    tabs(): { name: TabId; label: string }[] {
      return [
        {
          label: this.$t('tabs.overview'),
          name: 'overview'
        },
        {
          label: this.$tc('tabs.contentItems', this.entity.countItems, {
            count: this.$n(this.entity.countItems)
          }),
          name: 'content-items'
        },
        {
          label: this.$tc('tabs.mentions', this.entity.countMentions, {
            count: this.$n(this.entity.countMentions)
          }),
          name: 'mentions'
        }
      ]
    },
    preferredImage() {
      if (this.entity.wikidata.images) {
        const el = this.entity.wikidata.images.find(im => im.rank === 'preferred')
        return el || this.entity.wikidata.images[0]
      }
      return null
    },
    activeLanguageCode() {
      return this.settingsStore.language_code
    },
    bbox() {
      if (!this.entity.wikidata) {
        return ''
      }
      const coords = this.entity.wikidata.coordinates
      const bbox = `${coords.longitude - 2},${coords.latitude - 1},${coords.longitude + 2},${coords.latitude + 1}`
      return bbox
    }
  },
  methods: {
    asArticle(item: ContentItem) {
      return Article.fromContentItem(item)
    },
    getEntity() {
      return this.entitiesStore.loadDetail(this.$route.params.entity_id as string)
    },
    async loadFacets() {
      this.entitiesStore.loadTimeline(this.$route.params.entity_id as string).then(values => {
        this.timevalues = values
      })
      this.facets = []
      const query = {
        facets: this.facetTypes as string[],
        filters: [
          {
            type: 'entity',
            q: [this.$route.params.entity_id as string]
          }
        ]
      } satisfies FindFacetsQuery

      this.facets = await searchFacetsService.find({ query }).then(response =>
        response.data.map(item => {
          return Facet.fromSearchFacet<EntityFacetType>(item)
        })
      )
    },
    loadItems(page = 1) {
      if (this.tab.name === 'content-items') {
        return this.loadContentItems(page)
      } else if (this.tab.name === 'mentions') {
        return this.loadMentions(page)
      }
      return this.loadFacets()
    },
    loadContentItems(page = 1) {
      return this.entitiesStore
        .loadEntityContentItems({
          offset: (page - 1) * this.paginationList.perPage,
          order_by: this.contentItemsOrderBy,
          filters: [
            {
              q: this.$route.params.entity_id,
              type: this.entity.type
            }
          ]
        })
        .then(res => {
          this.paginationList = {
            perPage: this.paginationList.perPage,
            currentPage: page,
            totalRows: res.total
          }
          this.items = res.data
        })
    },
    loadMentions(page = 1) {
      return this.entitiesStore
        .loadEntityMentions({
          offset: (page - 1) * this.paginationList.perPage,
          order_by: this.mentionsOrderBy,
          filters: [
            {
              q: this.$route.params.entity_id,
              type: 'entity'
            }
          ]
        })
        .then(res => {
          this.paginationList = {
            perPage: this.paginationList.perPage,
            currentPage: page,
            totalRows: this.entity.countMentions
          }
          console.info('RECEIVED', res)
          this.items = res.data
        })
    },
    onInputPagination(page = 1) {
      return this.loadItems(page)
    },
    parseWkDate(wkDate) {
      let numYear = parseInt(wkDate.split('-')[0], 10)
      // console.info(numYear);
      if (isNaN(numYear)) {
        numYear = parseInt(wkDate.split('-')[1], 10) * -1
        // console.info(numYear);
      }
      return numYear
    },
    isLoggedIn() {
      return this.userStore.userData
    }
  },
  watch: {
    $route: {
      immediate: true,
      async handler({ query }) {
        // always reload entity
        this.entity = await this.getEntity()
        // set active tab
        const tabIdx = this.tabs.findIndex(d => d.name === query.tab)
        this.tab = tabIdx !== -1 ? this.tabs[tabIdx] : this.tabs[0]

        if (this.tab.name === 'content-items') {
          this.contentItemsOrderBy = undefined
        } else if (this.tab.name === 'mentions') {
          this.mentionsOrderBy = 'id'
        }
        // reset item list
        this.items = []
        await this.loadItems()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/legacy/bootstrap-impresso-theme-variables.scss';
.wikibox {
  background: $clr-bg-secondary;
}
a:hover {
  text-decoration: none;
}
</style>

<i18n lang="json">
{
  "en": {
    "count": "Mentioned only once {n} | Mentioned {n} times",
    "view": "View in context",
    "confidence": {
      "l": "low"
    },
    "tabs": {
      "mentions": "... mentions | mentioned only once | mentioned {count} times",
      "cooccurrences": "Cooccurrences",
      "contentItems": "... related content items | 1 related content item | {count} related content items"
    }
  }
}
</i18n>
