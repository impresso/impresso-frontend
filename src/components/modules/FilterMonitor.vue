<template>
  <div class="FilterMonitor filter-monitor">
    <div v-if="filter.type === 'embedding'">
      <p class="small" v-html="$t('label.embedding.context.' + currentContext)"></p>
    </div>
    <div v-else-if="checkbox">
      <!--  context -->
      <b-form-group>
        <radio-group
          :modelValue="currentContext"
          @update:modelValue="currentContext = $event"
          :options="checkboxContexts"
          type="radio"
        />
      </b-form-group>
      <!--  operator -->
      <b-form-group v-if="currentContext === 'include' && availableItems.length > 1">
        <radio-group
          :modelValue="editedFilter.op"
          @update:modelValue="editedFilter.op = $event"
          :options="checkboxOperators"
          type="radio"
        />
      </b-form-group>
    </div>

    <div v-else class="d-flex flex-wrap">
      <!--  context -->
      <b-dropdown size="sm" variant="outline-primary" class="mr-1">
        <template v-slot:button-content>
          <span v-html="$t(`label.${type}.context.${currentContext}`)" />
        </template>
        <b-dropdown-item
          v-for="option in contexts"
          v-bind:active="currentContext === option"
          v-bind:key="option"
          v-on:click="currentContext = option"
          ><span v-html="$t(`label.${type}.context.${option}`)"></span
        ></b-dropdown-item>
      </b-dropdown>
      <!--  operator -->
      <b-dropdown v-if="operators.length > 1" size="sm" variant="outline-primary">
        <template v-slot:button-content>
          <span v-html="$t(`op.${editedFilter.op}.${currentContext}`)" />
        </template>
        <b-dropdown-item
          v-for="option in operators"
          v-bind:active="editedFilter.op === option"
          v-bind:key="option"
          v-on:click="editedFilter.op = option"
          ><span v-html="$t(`op.${option}.${currentContext}`)"></span
        ></b-dropdown-item>
      </b-dropdown>
      <b-button
        class="dripicons-cross ms-auto ml-auto rounded p-0 no-outline"
        size="sm"
        variant="transparent"
        @click="removeFilter"
        data-testid="remove-filter-button"
      ></b-button>
    </div>
    <div class="items" :class="{ reduced: tooManyItems }">
      <div v-for="(item, idx) in filterItems" :key="idx" class="mt-2">
        <div v-if="RangeFacets.includes(type)">
          <filter-number-range
            v-if="NumericRangeFacets.includes(type)"
            :start="asNumber(item.start)"
            :end="asNumber(item.end)"
            @changed="handleRangeChanged"
          />
          <div v-if="type === 'daterange'">
            <FilterDateRangeCalendar
              :show-calendar="!checkbox"
              :start-date="asDate(item.start)"
              :end-date="asDate(item.end)"
              :min-date="minDate"
              :max-date="maxDate"
              @changed="handleRangeChanged"
            />
          </div>
        </div>
        <div v-else-if="type === 'embedding'">
          <!-- Embedding filter item representation can go here -->

          <pre
            class="bg-light shadow-sm rounded-sm border p-1 very-small"
            style="word-break: break-all; white-space: normal; max-height: 100px; overflow: scroll"
            >{{ item.id }}</pre
          >
        </div>
        <b-form-checkbox
          v-else-if="isStringType(type)"
          v-model="checkedItems[item.id]"
          @update:modelValue="toggleFilterItem($event, item.id)"
        >
          <b-form-input
            size="sm"
            placeholder=""
            class="accepted"
            :value="item.id"
            @click.prevent.stop
            @update:modelValue="changeStringFilterItemAtIndex($event, idx)"
          >
          </b-form-input>
        </b-form-checkbox>
        <div v-else class="d-flex text-small">
          <b-form-checkbox
            v-model="checkedItems[item.id]"
            @update:modelValue="toggleFilterItem($event, item.id)"
          >
          </b-form-checkbox>
          <item-selector hide-icon :id="item.id || item.id" :item="item" :type="type">
            <item-label :item="item" :type="type" />
            <span v-if="!item.id">...</span>
            <span v-if="item.count"
              >&nbsp;(<span
                v-html="
                  $tc(
                    type === 'collection'
                      ? 'numbers.articlesMatchingSearchFilters'
                      : 'numbers.results',
                    item.count,
                    { n: $n(item.count) }
                  )
                "
              />)&nbsp;</span
            >
          </item-selector>
        </div>
      </div>
      <!-- bucket items -->
      <div class="items-to-add text-small m-2" v-if="itemsToAdd.length">
        <div v-for="(item, idx) in itemsToAdd" :key="idx">
          <span v-if="type === 'topic'" v-html="item.htmlExcerpt"></span>
          <span v-if="['person', 'location', 'newspaper'].indexOf(type) !== -1">{{
            item.name
          }}</span>
          <span v-if="['language', 'country'].indexOf(type) !== -1">{{
            $t(`buckets.${type}.${item.id}`)
          }}</span>
          <collection-item v-if="type === 'collection'" :item="item" />
          <span v-if="item.count"
            >(<span v-html="$tc('numbers.results', item.count, { n: $n(item.count) })" />)</span
          >
          <item-selector :id="item.id" :item="item" :type="type" />
          <b-button
            class="dripicons-cross ml-auto"
            variant="transparent"
            size="sm"
            style="padding: 0.25rem 0.5rem 0 0.5rem"
            @click.prevent.stop="removeItem(idx)"
          />
        </div>
      </div>
      <!-- string to add -->
      <div class="strings-to-add m-2 ml-4" v-if="stringsToAdd.length">
        <div v-for="(item, idx) in stringsToAdd" :key="idx" class="mb-2 d-flex">
          <b-form-input
            size="sm"
            placeholder="..."
            class="mr-1"
            v-model="item.id"
            @click.prevent.stop
          >
          </b-form-input>
          <b-button
            class="dripicons-cross"
            variant="transparent"
            size="sm"
            style="padding: 0.25rem 0.5rem 0 0.5rem"
            @click.prevent.stop="removeStringItem(idx)"
          />
        </div>
      </div>
    </div>
    <div v-if="EntityTypes.includes(type)">
      <b-button
        size="sm"
        variant="outline-primary"
        block
        v-on:click.prevent="showEntitySuggester = !showEntitySuggester"
      >
        {{ $t(`actions.${editedFilter.op}.addUsingSuggest`) }}
      </b-button>
    </div>
    <!-- @entity-selected="addEmbeddingSuggestion"/> -->
    <!-- add new string as an OR filter -->
    <div class="mt-3" v-else-if="isStringType(type)">
      <b-row no-gutters>
        <b-col cols="6">
          <div class="mr-1">
            <b-button
              size="sm"
              variant="outline-primary"
              block
              @click.prevent.stop="addStringItem"
              :disabled="hasEmptyStringItems"
            >
              {{ $t(`actions.${editedFilter.op}.addItem`) }}
            </b-button>
          </div>
        </b-col>
        <b-col cols="6">
          <div class="ml-1">
            <b-button
              size="sm"
              variant="outline-primary"
              block
              v-on:click.prevent="showEmbeddings = !showEmbeddings"
            >
              {{ $t(`actions.${editedFilter.op}.addUsingEmbeddings`) }}
            </b-button>
          </div>
        </b-col>
      </b-row>
      <embeddings-search
        v-if="showEmbeddings"
        :filters="[editedFilter]"
        @click.stop.prevent
        @embdding-selected="addEmbeddingSuggestion"
        reduced
        class="mb-2"
      />
    </div>
    <b-button
      class="mt-2"
      v-if="hasChanges"
      block
      size="sm"
      variant="outline-primary"
      @click="applyChanges()"
    >
      <span
        v-if="validStringsToAdd.length > 0 || itemsToAdd.length > 0 || excludedItemsIds.length > 0"
      >
        {{
          $t('actions.applyChangesDetailed', {
            added: validStringsToAdd.length || itemsToAdd.length,
            removed: excludedItemsIds.length
          })
        }}
      </span>
      <span v-else>{{ $t(`actions.applyChanges`) }}</span>
    </b-button>
  </div>
  <Teleport to="body">
    <entity-suggester
      :isVisible="showEntitySuggester"
      :filter="filter"
      :type="type"
      @filter-changed="handleFilterChanged"
      @dismiss="showEntitySuggester = false"
    />
  </Teleport>
</template>

<script lang="ts">
// import FilterDaterange from '@/components/modules/FilterDateRange'
import FilterDateRangeCalendar from '@/components/modules/FilterDateRangeCalendar.vue'
import FilterNumberRange from '@/components/modules/FilterNumberRange.vue'
import ItemSelector from '@/components/modules/ItemSelector.vue'
import ItemLabel from '@/components/modules/lists/ItemLabel.vue'
import CollectionItem from '@/components/modules/lists/CollectionItem.vue'
import EmbeddingsSearch from '@/components/modules/EmbeddingsSearch.vue'
import EntitySuggester from '@/components/modals/EntitySuggesterModal.vue'
import RadioGroup from '@/components/layout/RadioGroup.vue'
import {
  toCanonicalFilter,
  toSerializedFilter,
  RangeFacets,
  NumericRangeFacets
} from '@/logic/filters'
import { defineComponent, PropType } from 'vue'
import type { Entity, FilterWithItems } from '@/models'

const StringTypes = ['string', 'title'] as const
const EntityTypes = ['person', 'location', 'entity'] as const
type StringType = (typeof StringTypes)[number]
export type FilterMonitorFilter = FilterWithItems<FilterMonitorItem>
type FilterContext = NonNullable<FilterMonitorFilter['context']>
type FilterOperator = NonNullable<FilterMonitorFilter['op']>
type FilterPrecision = NonNullable<FilterMonitorFilter['precision']>

export interface FilterMonitorItem extends Entity {
  id: string
  uid?: string
  checked?: boolean
  count?: number
  start?: string | number | Date
  end?: string | number | Date
}

export interface StringToAddItem {
  id: string
  checked: boolean
}

export interface FilterMonitorProps {
  operators?: FilterOperator[]
  contexts?: FilterContext[]
  precisions?: FilterPrecision[]
  checkbox?: boolean
  filter: FilterMonitorFilter
  itemsToAdd?: FilterMonitorItem[]
  minDate?: Date
  maxDate?: Date
}

export interface IData {
  showEmbeddings: boolean
  showEntitySuggester: boolean
  editedFilter: FilterMonitorFilter
  excludedItemsIds: string[]
  stringsToAdd: StringToAddItem[]
  RangeFacets: string[]
  NumericRangeFacets: string[]
  StringTypes: readonly string[]
  EntityTypes: readonly string[]
}

export interface IRangeChangedPayload {
  item?: unknown
  q: string[] | string
}

const getInitialEditedFilter = (filter?: FilterMonitorFilter): FilterMonitorFilter => {
  const canonicalFilter = toCanonicalFilter(filter)
  if (canonicalFilter.type) {
    return canonicalFilter
  }
  return {
    type: 'string',
    q: []
  }
}

const getFilterQueryAsArray = (filter: FilterMonitorFilter): string[] => {
  const { q } = filter
  if (Array.isArray(q)) return q
  if (typeof q === 'string') return q.split(',').filter(Boolean)
  return []
}

const isStringType = (type: string): type is StringType =>
  (StringTypes as readonly string[]).includes(type)

interface WindowWithDocumentsYearSpan extends Window {
  impressoDocumentsYearSpan?: {
    firstYear?: number
    lastYear?: number
  }
}

const getDocumentsYearSpan = () => {
  return (window as WindowWithDocumentsYearSpan).impressoDocumentsYearSpan
}
/**
 * Changes filter after 'apply' button is clicked.
 * Use with `v-model`.
 */
export default defineComponent({
  emits: {
    changed: (filter: FilterMonitorFilter) => filter != null,
    removed: (filter: FilterMonitorFilter) => filter != null,
    'daterange-changed': (filter: FilterMonitorFilter) => filter != null
  },
  data(): IData {
    return {
      showEmbeddings: false,
      showEntitySuggester: false,
      editedFilter: getInitialEditedFilter(this.filter),
      excludedItemsIds: [],
      stringsToAdd: [],
      RangeFacets: RangeFacets as string[],
      NumericRangeFacets: NumericRangeFacets as string[],
      StringTypes,
      EntityTypes
    }
  },
  props: {
    operators: {
      type: Array as PropType<FilterOperator[]>,
      default: () => ['OR']
    },
    contexts: {
      type: Array as PropType<FilterContext[]>,
      default: () => ['include', 'exclude']
    },
    precisions: {
      type: Array as PropType<FilterPrecision[]>,
      default: () => ['fuzzy', 'exact', 'soft']
    },
    /* Render context, operators as checkboxes */
    checkbox: {
      type: Boolean,
      default: false
    },
    filter: {
      type: Object as PropType<FilterMonitorFilter>,
      required: true
    },
    /* filter items to be added to the filter when confirm button is clicked */
    itemsToAdd: {
      type: Array as PropType<FilterMonitorItem[]>,
      default: () => []
    },
    // ony required when type is daterange. This is implemented in FilterFacetDateRange component
    minDate: {
      type: Date,
      required: false,
      default: () => {
        const defaultFirstYear = getDocumentsYearSpan()?.firstYear ?? 1700
        const date = new Date(defaultFirstYear + '-01-01')
        date.setUTCHours(0, 0, 0, 0)
        return date
      }
    },
    maxDate: {
      type: Date,
      required: false,
      default: () => {
        const defaultLastYear = getDocumentsYearSpan()?.lastYear ?? new Date().getFullYear()
        const date = new Date(defaultLastYear + '-12-31')
        date.setUTCHours(23, 59, 59, 0)
        return date
      }
    }
  },
  computed: {
    tooManyItems(): boolean {
      const filterItems = this.filter.items || []
      return this.stringsToAdd.length + filterItems.length + this.itemsToAdd.length > 5
    },
    hasEmptyStringItems(): boolean {
      return (
        this.stringsToAdd.length > 0 && this.stringsToAdd.filter(d => d.id.length === 0).length > 0
      )
    },
    validStringsToAdd(): StringToAddItem[] {
      return this.stringsToAdd.filter(d => d.checked && d.id.length)
    },
    checkedItems(): Record<string, boolean> {
      return this.availableItems.reduce(
        (acc, item) => {
          acc[item.id] = !this.excludedItemsIds.includes(item.id)
          return acc
        },
        {} as Record<string, boolean>
      )
    },
    availableItems(): FilterMonitorItem[] {
      const filterItems = this.filter.items || []
      return filterItems.concat(this.itemsToAdd)
    },
    type(): string {
      return this.filter.type || ''
    },
    checkboxPrecisions(): { text: string; value: FilterPrecision }[] {
      return this.precisions.map(value => ({
        text: String(this.$t(`label.${this.type}.precision.${value}`)),
        value
      }))
    },
    checkboxContexts(): { text: string; value: FilterContext }[] {
      return this.contexts.map(value => ({
        text: String(this.$t(`label.${this.type}.context.${value}`)),
        value
      }))
    },
    checkboxOperators(): { text: string; value: FilterOperator }[] {
      return this.operators.map(value => ({
        text: String(this.$t(`op.${value}.${this.currentContext}`)),
        value
      }))
    },
    serializedFilters(): unknown[] {
      return [
        this.hasChanges,
        this.excludedItemsIds.length,
        this.validStringsToAdd.length,
        this.itemsToAdd.length,
        toSerializedFilter(this.filter),
        toSerializedFilter(this.editedFilter),
        toSerializedFilter(this.filter) !== toSerializedFilter(this.editedFilter)
      ]
    },
    filterItems(): FilterMonitorItem[] {
      return this.filter && Array.isArray(this.filter.items) ? [...this.filter.items] : []
    },
    hasChanges(): boolean {
      return (
        this.itemsToAdd.length > 0 ||
        this.validStringsToAdd.length > 0 ||
        this.excludedItemsIds.length > 0 ||
        toSerializedFilter(this.filter) !== toSerializedFilter(this.editedFilter)
      )
    },
    currentContext: {
      get(): FilterContext {
        return this.editedFilter.context ? this.editedFilter.context : 'include'
      },
      set(context: FilterContext) {
        this.editedFilter = { ...this.editedFilter, context }
      }
    }
  },
  methods: {
    isStringType,
    asDate(value: FilterMonitorItem['start']): Date {
      if (value instanceof Date) {
        return value
      }
      if (typeof value === 'string' || typeof value === 'number') {
        return new Date(value)
      }
      return new Date(0)
    },
    asNumber(value: FilterMonitorItem['start']): number {
      if (typeof value === 'number') {
        return value
      }
      if (value instanceof Date) {
        return value.getFullYear()
      }
      if (typeof value === 'string') {
        const parsed = Number.parseInt(value, 10)
        return Number.isNaN(parsed) ? 0 : parsed
      }
      return 0
    },
    removeFilter(e?: Event): void {
      e?.preventDefault()
      console.info('[FilterMonitor] @removed')
      this.$emit('removed', this.filter)
    },
    applyChanges(): void {
      const { type } = this.editedFilter

      if (!isStringType(type) && !RangeFacets.includes(type)) {
        const combinedItems = this.filterItems.concat(this.itemsToAdd)
        const allItemsDictionary = combinedItems.reduce<Record<string, FilterMonitorItem>>(
          (acc, item) => {
            const itemKey = item.uid || item.id
            if (itemKey) {
              acc[itemKey] = item
            }
            return acc
          },
          {}
        )
        const availableItemsIds = [
          ...new Set(
            combinedItems
              .map(({ uid, id }) => uid || id)
              .filter((id): id is string => typeof id === 'string' && id.length > 0)
          )
        ]
        const selectedItemsIds = availableItemsIds.filter(id => !this.excludedItemsIds.includes(id))
        const selectedItems = selectedItemsIds
          .map(id => allItemsDictionary[id])
          .filter((item): item is FilterMonitorItem => item != null)

        this.$emit('changed', {
          ...this.editedFilter,
          items: selectedItems,
          q: selectedItemsIds
        })
      } else if (isStringType(type)) {
        const editedFilterQ = getFilterQueryAsArray(this.editedFilter)
        const newFilter = {
          ...this.editedFilter,
          q: editedFilterQ
            .filter(d => !this.excludedItemsIds.includes(d))
            .concat(this.validStringsToAdd.map(d => d.id))
        }
        this.$emit('changed', newFilter)
        this.stringsToAdd = []
      } else {
        this.$emit('changed', this.editedFilter)
      }
    },
    addStringItem(): void {
      this.stringsToAdd.push({
        id: '',
        checked: true
      })
    },
    removeStringItem(idx: number): void {
      this.stringsToAdd.splice(idx, 1)
    },
    removeItem(idx: number): void {
      this.itemsToAdd.splice(idx, 1) // eslint-disable-line
    },
    changeStringFilterItemAtIndex(value: string, idx: number): void {
      const q = this.filterItems
        .map((d, i) => {
          if (i === idx) {
            return value
          }
          return d.id || ''
        })
        .filter((d): d is string => d.length > 0)
      this.editedFilter = { ...this.editedFilter, q }
    },
    toggleFilterItem(selected: boolean, uid: string): void {
      console.info('[FilterMonitor] @toggleFilterItem', selected, uid)
      if (selected) {
        this.excludedItemsIds = this.excludedItemsIds.filter(id => id !== uid)
      } else {
        this.excludedItemsIds = this.excludedItemsIds.concat(uid)
      }
    },
    addEmbeddingSuggestion(embedding: string): void {
      this.stringsToAdd.push({
        id: embedding,
        checked: true
      })
      // this.editedFilter.q = `${this.editedFilter.q} ${embedding}`
      // this.editedFilter.precisions = 'soft'
    },
    handleRangeChanged({ item, q }: IRangeChangedPayload): void {
      console.info('[FilterMonitor] @handleRangeChanged', item, q)
      this.editedFilter = {
        ...this.editedFilter,
        // items: [item],
        q
      }
      if (!NumericRangeFacets.includes(this.editedFilter.type))
        this.$emit('daterange-changed', this.editedFilter)
    },
    handleFilterChanged(newFilter: FilterMonitorFilter): void {
      this.$emit('changed', newFilter)
    }
  },
  components: {
    // FilterDaterange,
    FilterDateRangeCalendar,
    CollectionItem,
    EmbeddingsSearch,
    ItemLabel,
    ItemSelector,
    FilterNumberRange,
    EntitySuggester,
    RadioGroup
  },
  watch: {
    /**
     * When filter changes, make a copy in `editedFilter`.
     * This is the filter we will be changing until the `apply` button is clicked.
     */
    filter: {
      handler() {
        if (toSerializedFilter(this.editedFilter) === toSerializedFilter(this.filter)) return

        const canonicalFilter: FilterMonitorFilter = toCanonicalFilter(this.filter)
        if (this.itemsToAdd.length) {
          const canonicalFilterQ = getFilterQueryAsArray(canonicalFilter)
          this.editedFilter = {
            ...canonicalFilter,
            q: canonicalFilterQ.concat(
              this.itemsToAdd
                .map(({ uid, id }) => uid || id)
                .filter((id): id is string => typeof id === 'string' && id.length > 0)
            )
          }
        } else {
          this.editedFilter = canonicalFilter
        }
        this.excludedItemsIds = []
      },
      immediate: true,
      deep: true
    }
  }
})
</script>

<style>
.FilterMonitor .items .form-control.accepted {
  color: #343a40;
}

.FilterMonitor label.custom-control-label {
  font-variant: none;
}

.FilterMonitor .reduced {
  max-height: 200px;
  overflow: scroll;
}

.FilterMonitor .no-outline:focus {
  box-shadow: none;
}
</style>
<i18n lang="json">
{
  "en": {
    "op": {
      "OR": {
        "include": "at least <b>one</b> of the following",
        "exclude": "<b>any</b> of the following"
      },
      "AND": {
        "include": "<b>all</b> of the following",
        "exclude": "<b>all</b> of the following"
      }
    },
    "actions": {
      "addUsingEmbeddings": "add using semantic embeddings",
      "AND": {
        "addItem": "'AND' ...",
        "addUsingEmbeddings": "'AND' similar ...",
        "addUsingSuggest": "'AND' suggest..."
      },
      "OR": {
        "addItem": "'OR' ...",
        "addUsingEmbeddings": "'OR' similar ...",
        "addUsingSuggest": "'OR' suggest..."
      }
    },
    "label": {
      "embedding": {
        "title": "semantic embedding",
        "context": {
          "include": "similar to",
          "exclude": "<b>NOT</b> similar to"
        }
      },
      "nag": {
        "context": {
          "include": "reported by",
          "exclude": "<b>NOT</b> reported by"
        }
      },
      "title": {
        "context": {
          "include": "Contains",
          "exclude": "<b>NOT</b> contains"
        },
        "precision": {
          "exact": "exactly all words",
          "fuzzy": "fuzzy match",
          "soft": "at least one of the words"
        },
        "value": "value",
        "apply": "apply changes"
      },
      "country": {
        "title": "country of publication",
        "context": {
          "include": "newspapers published in",
          "exclude": "newspapers <b>NOT</b> published in"
        }
      },
      "string": {
        "title": "article text",
        "context": {
          "include": "Contains",
          "exclude": "<b>NOT</b> contains"
        },
        "precision": {
          "exact": "exactly all words",
          "fuzzy": "fuzzy match",
          "soft": "at least one of the words"
        },
        "value": "value",
        "apply": "apply changes"
      },
      "topic": {
        "title": "topic",
        "selected": "filter results if <b>one of {count} selected</b> topic applies",
        "filtered": "filter results if <b>one of {count} selected</b> topic applies",
        "description": "check one or more topics to filter results",
        "update": "apply changes (added: {added}, removed: {removed})",
        "clear": "reset",
        "apply": "apply changes",
        "context": {
          "include": "Containing",
          "exclude": "<b>NOT</b> containing"
        }
      },
      "person": {
        "context": {
          "include": "Mentioning",
          "exclude": "<b>NOT</b> mentioning"
        }
      },
      "location": {
        "context": {
          "include": "Mentioning",
          "exclude": "<b>NOT</b> mentioning"
        }
      },
      "entity": {
        "context": {
          "include": "Mentioning",
          "exclude": "<b>NOT</b> mentioning"
        }
      },
      "collection": {
        "title": "collection",
        "selected": "filter results if they appear in <b>one of {count} selected</b> newspapers",
        "description": "check one or more newspaper to filter results",
        "clear": "reset",
        "apply": "apply changes",
        "update": "apply changes (added: {added}, removed: {removed})",
        "context": {
          "include": "Saved in",
          "exclude": "<b>NOT</b> saved in"
        }
      },
      "newspaper": {
        "title": "media sources",
        "selected": "filter results if they appear in <b>one of {count} selected</b> media sources",
        "description": "check one or more media sources to filter results",
        "clear": "reset",
        "apply": "apply changes",
        "update": "apply changes (added: {added}, removed: {removed})",
        "context": {
          "include": "Published in",
          "exclude": "<b>NOT</b> published in"
        }
      },
      "partner": {
        "title": "data provider",
        "selected": "filter results if they are provided by <b>one of {count} selected</b> data providers",
        "description": "check one or more data provider to filter results",
        "clear": "reset",
        "apply": "apply changes",
        "update": "apply changes (added: {added}, removed: {removed})",
        "context": {
          "include": "Provided by",
          "exclude": "<b>NOT</b> provided by"
        }
      },
      "language": {
        "title": "language of articles",
        "selected": "filter results if they are written in <b>one of {count} selected</b> languages",
        "description": "check one or more language to filter results",
        "apply": "apply changes",
        "clear": "reset",
        "context": {
          "include": "Written in",
          "exclude": "<b>NOT</b> written in"
        }
      },
      "daterange": {
        "title": "date of publication",
        "selected": "filter results if they are published between <b>one of {count} selected</b> languages",
        "description": "check one or more language to filter results",
        "apply": "apply changes",
        "clear": "reset",
        "context": {
          "include": "Published between",
          "exclude": "<b>NOT</b> published between"
        }
      },
      "textReuseClusterSize": {
        "title": "text reuse cluster size",
        "apply": "apply changes",
        "clear": "reset",
        "context": {
          "include": "cluster size between",
          "exclude": "cluster size <b>NOT</b> between"
        }
      },
      "textReuseClusterLexicalOverlap": {
        "title": "text reuse cluster lexical overlap",
        "apply": "apply changes",
        "clear": "reset",
        "context": {
          "include": "lexical overlap between",
          "exclude": "lexical overlap <b>NOT</b> between"
        }
      },
      "textReuseClusterDayDelta": {
        "title": "text reuse cluster time span (days)",
        "apply": "apply changes",
        "clear": "reset",
        "context": {
          "include": "time span between",
          "exclude": "time span <b>NOT</b> between"
        }
      },
      "contentLength": {
        "title": "content length span",
        "apply": "apply changes",
        "clear": "reset",
        "context": {
          "include": "content length between",
          "exclude": "content length <b>NOT</b> between"
        }
      }
    }
  },
  "nl": {
    "label": {
      "newspaper": "Krant",
      "language": "Taal"
    }
  }
}
</i18n>
