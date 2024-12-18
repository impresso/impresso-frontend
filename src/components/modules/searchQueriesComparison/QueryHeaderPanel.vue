<template>
  <div class="query-header-panel">
    <div
      class="inner"
      :class="{
        left,
        right: !left && !containsComparison,
        middle: containsComparison
      }"
    >
      <div class="p-2 container">
        <b-tabs
          pills
          content-class="mt-3"
          :class="`justify-content-${alignment}`"
          v-if="comparable.type !== 'intersection'"
        >
          <template v-slot:tabs-end>
            <!-- A -->
            <li v-if="left" class="nav-item">
              <div class="nav-link no-hover">
                <div class="side left">A</div>
              </div>
            </li>
            <li class="nav-item">
              <div class="nav-link active">
                <span>{{ getTabLabel('query') }}</span>
              </div>
            </li>
            <!-- B -->
            <li v-if="!left" class="nav-item">
              <div class="nav-link no-hover">
                <div class="side right">B</div>
              </div>
            </li>
          </template>

          <template v-slot:default>
            <div class="px-1 pb-2">
              <search-pills
                :enable-add-filter="filters.length > 0"
                :includedFilterTypes="supportedFilterTypes"
                :filters="filters"
                @changed="handleFiltersChanged"
              />
              <InfoIgnoredFilters :ignoredFilters="ignoredFilters" />
              <autocomplete v-on:submit="onSuggestion" />
            </div>
          </template>
        </b-tabs>

        <!-- intersection -->
        <div class="row justify-content-between" v-if="containsComparison">
          <div class="col-auto w-100">
            <b-tabs pills content-class="mt-3" class="justify-content-center">
              <template v-slot:tabs-end>
                <li v-for="(option, i) in modeOptions" :key="i" class="nav-item">
                  <a
                    class="nav-link"
                    :class="{ active: option === mode }"
                    @click="$emit('mode-changed', option)"
                  >
                    <div v-html="$t(`comparison.labels.${option}`)"></div>
                  </a>
                </li>
              </template>

              <template v-slot:default>
                <section class="px-1 text-center">
                  <h3>
                    <span
                      class="textbox-fancy"
                      v-if="!isNaN(total)"
                      v-html="
                        $tc(`comparison.titles.${comparable.type}`, this.total, {
                          n: $n(total)
                        })
                      "
                    />
                    <span v-else>{{ $t(`comparison.titles.${mode}`) }}</span>
                    <info-button class="ml-2" name="what-compare-and-inspect" />
                  </h3>
                  <div
                    v-if="mode === 'inspect'"
                    v-html="$t(`comparison.descriptions.${comparable.type}.inspect`)"
                  />
                  <div
                    v-else-if="mode === 'compare'"
                    v-html="$t(`comparison.descriptions.${comparable.type}.compare`)"
                  />
                </section>
              </template>
            </b-tabs>
          </div>
        </div>
      </div>
      <div class="search-button-wrapper">
        <router-link
          v-if="comparable && searchPageLink(comparable) !== undefined"
          class="btn btn-outline-primary btn-sm"
          :to="searchPageLink(comparable)"
        >
          {{ $t('actions.searchMore') }}
          {{
            $tc('numbers.resultsParenthesis', total ?? 0, {
              n: $n(total ?? 0)
            })
          }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
// import SearchQueryModel from '@/models/SearchQuery';
import SearchPills from '../../SearchPills.vue'
import InfoButton from '@/components/base/InfoButton.vue'
import Autocomplete from '../../Autocomplete.vue'
// import CollectionPicker from '../../base/CollectionPicker';
import InfoIgnoredFilters from '../../base/InfoIgnoredFilters.vue'
import { ComparableTypes, comparableToQuery } from '@/logic/queryComparison'
import { serializeFilters } from '@/logic/filters'

const SupportedFilterTypes = [
  'string',
  'title',
  'accessRight',
  'type',
  'location',
  'country',
  'person',
  'language',
  'topic',
  'newspaper',
  'collection',
  'daterange',
  'isFront'
]

/**
 * @typedef {import('@/models').Filter} Filter
 * @typedef {import('@/models').SearchQuery} SearchQuery
 * @typedef {import('@/logic/queryComparison').Comparable} Comparable
 */
export default {
  data: () => ({
    supportedFilterTypes: SupportedFilterTypes
  }),
  props: {
    /** @type {import('vue').PropOptions<Comparable>} */
    comparable: {
      type: Object,
      required: true
    },
    title: {
      type: String
    },
    left: {
      type: Boolean
    },
    mode: {
      type: String
    },
    total: Number, // total items in selected collection.
    /**
     * list of available collections
     * @type {import('vue').PropOptions<{ title: string, id: string }[]>}
     */
    collections: {
      type: Array,
      default() {
        return []
      }
    },
    /**
     * @type {import('vue').PropOptions<string[]>}
     */
    comparisonOptions: {
      type: Array,
      default() {
        return ['intersection', 'diffA', 'diffB']
      }
    },
    /**
     * @type {import('vue').PropOptions<string[]>}
     */
    modeOptions: {
      type: Array,
      default() {
        return ['inspect', 'compare']
      }
    }
  },
  components: {
    SearchPills,
    Autocomplete,
    // CollectionPicker,
    InfoButton,
    InfoIgnoredFilters
  },
  methods: {
    /** @param {Filter[]} filters */
    handleFiltersChanged(filters) {
      const comparable = {
        ...this.comparable,
        query: { filters },
        type: ComparableTypes.Query,
        id: undefined
      }
      this.$emit('comparable-changed', comparable)
    },
    /** @param {string} id */
    onCollectionSelected(id) {
      const comparable = {
        ...this.comparable,
        type: ComparableTypes.Collection,
        id,
        query: undefined
      }
      this.$emit('comparable-changed', comparable)
    },
    /** @param {string} type */
    getTabLabel(type) {
      if (type === this.comparable.type) {
        return this.$tc(`tabs.${type}.active`, this.total ?? 0, {
          count: this.$n(this.total ?? 0)
        })
      }
      return this.$t(`tabs.${type}.pick`)
    },
    /** @param {Filter} filter */
    onSuggestion(filter) {
      const filters = this.comparable?.query?.filters ?? []
      const comparable = {
        ...this.comparable,
        query: { filters: filters.concat(filter) },
        type: 'query',
        id: undefined
      }
      this.$emit('comparable-changed', comparable)
    },
    /** @param {Comparable} c */
    searchPageLink(comparable) {
      const searchQuery = comparableToQuery(comparable)
      if (searchQuery == null) return searchQuery
      return {
        name: 'search',
        query: {
          ...this.$route.query,
          sq: serializeFilters(searchQuery.filters)
        }
      }
    }
  },
  computed: {
    /** @returns {string} */
    alignment() {
      if (this.comparable.type === 'intersection') {
        return 'center'
      }
      return this.left ? 'start' : 'end'
    },
    /** @returns {boolean} */
    containsComparison() {
      return this.comparisonOptions.includes(this.comparable.type)
    },
    /** @returns {Filter[]} */
    filters() {
      return this.comparable?.query?.filters?.filter(d => d.type !== 'hasTextContents') ?? []
    },
    ignoredFilters() {
      return this.filters.filter(d => !SupportedFilterTypes.includes(d.type))
    }
  }
}
</script>

<style lang="scss">
@import 'src/assets/legacy/bootstrap-impresso-theme-variables.scss';
@import '@/styles/variables.sass';
// multiply A + B
// $inspect-compare-middle-panel-color: #fdafdb;// dodge A B

.query-header-panel {
  position: relative;
  width: 100%;
  height: 100%;
  margin-bottom: 2rem;
  .type {
    .small-caps {
      height: 17px;
      vertical-align: top;
    }
  }
  .inner {
    position: relative;
    margin-bottom: 2rem;
    height: 100%;
  }
  & > .left {
    border-bottom: 1px solid $inspect-compare-left-panel-color;
    ul.nav.nav-pills {
      border-bottom-color: $inspect-compare-left-panel-color;
      .nav-item .nav-link.active {
        color: $inspect-compare-left-panel-color;
        border-top-color: $inspect-compare-left-panel-color;
        border-left-color: $inspect-compare-left-panel-color;
        border-right-color: $inspect-compare-left-panel-color;
      }
      .nav-item:hover .nav-link.no-hover {
        box-shadow: none;
      }
    }
    .viz-bar {
      background-color: $inspect-compare-left-panel-color;
    }
  }

  & > .right {
    border-bottom: 1px solid $inspect-compare-right-panel-color;
    ul.nav.nav-pills {
      border-bottom-color: $inspect-compare-right-panel-color;
      .nav-item .nav-link.active {
        color: $inspect-compare-right-panel-color;
        border-top-color: $inspect-compare-right-panel-color;
        border-left-color: $inspect-compare-right-panel-color;
        border-right-color: $inspect-compare-right-panel-color;
      }
      .nav-item:hover .nav-link.no-hover {
        box-shadow: none;
      }
    }
  }

  & > .middle {
    border: 1px solid $inspect-compare-middle-panel-color;
    border-top: 0px;
    border-bottom-width: 2px;
    ul.nav.nav-pills {
      border-bottom-color: $inspect-compare-middle-panel-color;
      .nav-item .nav-link.active {
        color: $inspect-compare-middle-panel-color;
        border-top-color: $inspect-compare-middle-panel-color;
        border-left-color: $inspect-compare-middle-panel-color;
        border-right-color: $inspect-compare-middle-panel-color;
      }
    }
  }

  span.number {
    font-weight: bold;
  }

  div.side {
    text-transform: lowercase;
    font-variant: small-caps;
    width: 1.25em;
    height: 1.25em;
    line-height: 1em;
    text-align: center;
    border-radius: 1.25em;
    border: 1px solid;
    display: inline-block;

    &.left {
      color: $inspect-compare-left-panel-color;
    }

    &.right {
      color: $inspect-compare-right-panel-color;
    }
  }
  div.search-button-wrapper {
    position: absolute;
    bottom: 0.5rem;
    text-align: center;
    width: 100%;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "comparison": {
      "labels": {
        "intersection": "inspect <div class='side left'>A</div> &amp; <div class='side right'>B</div>",
        "diffA": "<div class='side left'>A</div> not in <div class='side right'>B</div>",
        "diffB": "<div class='side right'>B</div> not in <div class='side left'>A</div>",
        "inspect": "inspect <div class='side left'>A</div> + <div class='side right'>B</div>",
        "compare": "compare <div class='side left'>A</div> &amp; <div class='side right'>B</div>"
      },
      "titles": {
        "intersection": "no results in common | Only 1 result in common | <span class='number'>{n}</span> results in common",
        "inspect": "Inspect search queries",
        "compare": "Compare search queries"
      },
      "descriptions": {
        "intersection": {
          "inspect": "Lists of newspapers, named entities and topics for results for <div class='side left'>A</div>, <div class='side right'>B</div> and in both <div class='side left'>A</div> and <div class='side right'>B</div>",
          "compare": "Distribution of newspapers, named entities and topics for articles which appear both in <div class='side left'>A</div> and <div class='side right'>B</div>."
        }
      }
    },
    "tabs": {
      "collection": {
        "active": "collection *",
        "pick": "collection"
      },
      "query": {
        "active": "query *",
        "pick": "query"
      }
    }
  }
}
</i18n>
