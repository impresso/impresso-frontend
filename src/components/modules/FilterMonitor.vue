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
          :options="
            checkboxContextOptionKeys.map(({ value, textKey }) => ({
              value,
              text: String($t(textKey))
            }))
          "
          type="radio"
        />
      </b-form-group>
      <!--  operator -->
      <b-form-group v-if="showOperatorToggle">
        <radio-group
          :modelValue="normalizedEditedOperator"
          @update:modelValue="editedFilter.op = $event"
          :options="
            checkboxOperatorOptionKeys.map(({ value, textKey }) => ({
              value,
              text: String($t(textKey))
            }))
          "
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
      <b-dropdown v-if="allowedOperators.length > 1" size="sm" variant="outline-primary">
        <template v-slot:button-content>
          <span v-html="$t(`op.${normalizedEditedOperator}.${currentContext}`)" />
        </template>
        <b-dropdown-item
          v-for="option in allowedOperators"
          v-bind:active="normalizedEditedOperator === option"
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
        <div v-if="includes(RangeFacets, type)">
          <FilterNumericRange
            v-if="isNumericRangeFacet(type)"
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
          v-else-if="isStringType(type) || isIntegerType(type)"
          v-model="checkedItems[String(item.id)]"
          @update:modelValue="toggleFilterItem($event, String(item.id))"
        >
          <b-form-input
            size="sm"
            placeholder=""
            class="accepted"
            :value="String(item.id)"
            :type="isIntegerType(type) ? 'number' : 'text'"
            @click.prevent.stop
            @update:modelValue="changeFilterItemAtIndex($event, idx)"
          >
          </b-form-input>
        </b-form-checkbox>
        <div v-else class="d-flex text-small">
          <b-form-checkbox
            v-model="checkedItems[String(item.id)]"
            @update:modelValue="toggleFilterItem($event, String(item.id))"
          >
          </b-form-checkbox>
          <item-selector hide-icon :id="String(item.id)" :item="item" :type="type">
            <item-label :item="item" :type="type" />
            <span v-if="!item.id">...</span>
            <span v-if="item.count"
              >&nbsp;(<span
                v-html="
                  $t(
                    type === 'collection'
                      ? 'numbers.articlesMatchingSearchFilters'
                      : 'numbers.results',
                    { n: $n(item.count) },
                    item.count
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
            >(<span v-html="$t('numbers.results', { n: $n(item.count) }, item.count)" />)</span
          >
          <item-selector :id="String(item.id)" :item="item" :type="type" />
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
            :type="isIntegerType(type) ? 'number' : 'text'"
            v-model="item.id"
            @click.prevent.stop
          >
          </b-form-input>
          <button class="btn btn-transparent btn-sm" @click.prevent.stop="removeStringItem(idx)">
            <Icon name="cross" />
          </button>
        </div>
      </div>
    </div>
    <div v-if="isEntityType(type)">
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
    <div class="mt-3" v-else-if="isStringType(type) || isIntegerType(type)">
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
        <b-col cols="6" v-if="isStringType(type)">
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

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Entity, FilterWithItems, FacetType } from '@/models'
// import FilterDaterange from '@/components/modules/FilterDateRange'
import FilterDateRangeCalendar from '@/components/modules/FilterDateRangeCalendar.vue'
import FilterNumericRange from '@/components/modules/FilterNumericRange.vue'
import ItemSelector from '@/components/modules/ItemSelector.vue'
import ItemLabel from '@/components/modules/lists/ItemLabel.vue'
import CollectionItem from '@/components/modules/lists/CollectionItem.vue'
import EmbeddingsSearch from '@/components/modules/EmbeddingsSearch.vue'
import EntitySuggester from '@/components/modals/EntitySuggesterModal.vue'
import RadioGroup from '@/components/layout/RadioGroup.vue'
import Icon from '@/components/base/Icon.vue'
import { toCanonicalFilter, toSerializedFilter } from '@/logic/filters'
import { NumericRangeFacets, RangeFacets } from '@/logic/facets'
import { includes } from '@/util/fn'

const StringTypes = ['string', 'title'] as const
const EntityTypes = ['person', 'location', 'entity'] as const
const IntegerTypes = ['year', 'page'] as const

type StringType = (typeof StringTypes)[number]
type IntegerType = (typeof IntegerTypes)[number]
export type FilterMonitorFilter = FilterWithItems<FilterMonitorItem>
type FilterContext = NonNullable<FilterMonitorFilter['context']>
type FilterOperator = NonNullable<FilterMonitorFilter['op']>
type FilterPrecision = NonNullable<FilterMonitorFilter['precision']>

const ExclusiveOperatorTypes: FacetType[] = ['year', 'page', 'daterange']

interface OptionKey<T extends string> {
  value: T
  textKey: string
}

export interface FilterMonitorItem extends Entity {
  id: string
  name?: string
  htmlExcerpt?: string
  uid?: string
  checked?: boolean
  count?: number
  start?: string | number | Date
  end?: string | number | Date
  y?: number
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

interface WindowWithDocumentsYearSpan extends Window {
  impressoDocumentsYearSpan?: {
    firstYear?: number
    lastYear?: number
  }
}

const getDocumentsYearSpan = () => (window as WindowWithDocumentsYearSpan).impressoDocumentsYearSpan

const props = withDefaults(defineProps<FilterMonitorProps>(), {
  operators: () => ['OR'],
  contexts: () => ['include', 'exclude'],
  precisions: () => ['fuzzy', 'exact', 'soft'],
  checkbox: false,
  itemsToAdd: () => []
})

const emit = defineEmits<{
  (e: 'changed', filter: FilterMonitorFilter): void
  (e: 'removed', filter: FilterMonitorFilter): void
  (e: 'daterange-changed', filter: FilterMonitorFilter): void
}>()

interface IRangeChangedPayload {
  item?: unknown
  q: string[] | string
}

interface FilterOptionTextKey<T extends string> {
  value: T
  textKey: string
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

const isIntegerType = (type: string): type is IntegerType =>
  (IntegerTypes as readonly string[]).includes(type)

const isEntityType = (value: unknown): value is (typeof EntityTypes)[number] =>
  typeof value === 'string' && (EntityTypes as readonly string[]).includes(value)

const isNumericRangeFacet = (value: unknown): boolean =>
  typeof value === 'string' && (NumericRangeFacets as readonly string[]).includes(value)

const showEmbeddings = ref(false)
const showEntitySuggester = ref(false)
const editedFilter = ref<FilterMonitorFilter>(getInitialEditedFilter(props.filter))
const excludedItemsIds = ref<string[]>([])
const stringsToAdd = ref<StringToAddItem[]>([])
const itemsToAdd = ref<FilterMonitorItem[]>([...props.itemsToAdd])

const filter = computed(() => props.filter)
const operators = computed(() => props.operators)
const contexts = computed(() => props.contexts)
const precisions = computed(() => props.precisions)
const checkbox = computed(() => props.checkbox)
const minDate = computed<Date>(() => {
  if (props.minDate) return props.minDate
  const firstYear = getDocumentsYearSpan()?.firstYear ?? 1700
  const date = new Date(firstYear + '-01-01')
  date.setUTCHours(0, 0, 0, 0)
  return date
})
const maxDate = computed<Date>(() => {
  if (props.maxDate) return props.maxDate
  const lastYear = getDocumentsYearSpan()?.lastYear ?? new Date().getFullYear()
  const date = new Date(lastYear + '-12-31')
  date.setUTCHours(23, 59, 59, 0)
  return date
})

const type = computed(() => filter.value.type || '')

const filterItems = computed<FilterMonitorItem[]>(() => {
  return filter.value && Array.isArray(filter.value.items) ? [...filter.value.items] : []
})

const availableItems = computed<FilterMonitorItem[]>(() => {
  const filterItemsValue = filter.value.items || []
  return filterItemsValue.concat(itemsToAdd.value)
})

const allowedOperators = computed<FilterOperator[]>(() => {
  if (ExclusiveOperatorTypes.includes(type.value as FacetType)) {
    return operators.value.includes('OR') ? ['OR'] : operators.value.slice(0, 1)
  }
  return operators.value
})

const currentContext = computed<FilterContext>({
  get() {
    return editedFilter.value.context ? editedFilter.value.context : 'include'
  },
  set(context: FilterContext) {
    editedFilter.value = { ...editedFilter.value, context }
  }
})

const normalizedEditedOperator = computed<FilterOperator>(() => {
  return getNormalizedOperator(editedFilter.value.op)
})

const checkboxPrecisionOptionKeys = computed<FilterOptionTextKey<FilterPrecision>[]>(() => {
  return precisions.value.map(value => ({
    textKey: `label.${type.value}.precision.${value}`,
    value
  }))
})

const checkboxContextOptionKeys = computed<FilterOptionTextKey<FilterContext>[]>(() => {
  return contexts.value.map(value => ({
    textKey: `label.${type.value}.context.${value}`,
    value
  }))
})

const checkboxOperatorOptionKeys = computed<FilterOptionTextKey<FilterOperator>[]>(() => {
  return allowedOperators.value.map(value => ({
    textKey: `op.${value}.${currentContext.value}`,
    value
  }))
})

const validStringsToAdd = computed(() => {
  return stringsToAdd.value.filter(d => d.checked && d.id.length)
})

const checkedItems = computed<Record<string, boolean>>(() => {
  return availableItems.value.reduce(
    (acc, item) => {
      acc[item.id] = !excludedItemsIds.value.includes(item.id)
      return acc
    },
    {} as Record<string, boolean>
  )
})

const tooManyItems = computed(() => {
  const filterItemsValue = filter.value.items || []
  return stringsToAdd.value.length + filterItemsValue.length + itemsToAdd.value.length > 5
})

const hasEmptyStringItems = computed(() => {
  return (
    stringsToAdd.value.length > 0 && stringsToAdd.value.filter(d => d.id.length === 0).length > 0
  )
})

const hasChanges = computed(() => {
  return (
    itemsToAdd.value.length > 0 ||
    validStringsToAdd.value.length > 0 ||
    excludedItemsIds.value.length > 0 ||
    toSerializedFilter(filter.value) !== toSerializedFilter(editedFilter.value)
  )
})

const serializedFilters = computed(() => {
  return [
    hasChanges.value,
    excludedItemsIds.value.length,
    validStringsToAdd.value.length,
    itemsToAdd.value.length,
    toSerializedFilter(filter.value),
    toSerializedFilter(editedFilter.value),
    toSerializedFilter(filter.value) !== toSerializedFilter(editedFilter.value)
  ]
})

const showOperatorToggle = computed(() => {
  return (
    checkbox.value &&
    currentContext.value === 'include' &&
    availableItems.value.length > 1 &&
    allowedOperators.value.length > 1
  )
})

function getNormalizedOperator(operator?: FilterOperator): FilterOperator {
  if (operator && allowedOperators.value.includes(operator)) {
    return operator
  }
  return allowedOperators.value[0] || 'OR'
}

function asDate(value: FilterMonitorItem['start']): Date {
  if (value instanceof Date) {
    return value
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return new Date(value)
  }
  return new Date(0)
}

function asNumber(value: FilterMonitorItem['start']): number {
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
}

function removeFilter(e?: Event): void {
  e?.preventDefault()
  console.info('[FilterMonitor] @removed')
  emit('removed', filter.value)
}

function applyChanges(): void {
  const normalizedFilter: FilterMonitorFilter = {
    ...editedFilter.value,
    op: getNormalizedOperator(editedFilter.value.op)
  }
  const { type: normalizedType } = normalizedFilter
  if (isStringType(normalizedType) || isIntegerType(normalizedType)) {
    const editedFilterQ = getFilterQueryAsArray(normalizedFilter)
    const newFilter = {
      ...normalizedFilter,
      q: editedFilterQ
        .filter(d => !excludedItemsIds.value.includes(d))
        .concat(validStringsToAdd.value.map(d => d.id))
    }
    emit('changed', newFilter)
    stringsToAdd.value = []
  } else if (!includes(RangeFacets, normalizedType)) {
    const combinedItems = filterItems.value.concat(itemsToAdd.value)
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
          .filter(
            (id): id is string =>
              (typeof id === 'string' || typeof id === 'number') && String(id).length > 0
          )
      )
    ]
    const selectedItemsIds = availableItemsIds.filter(id => !excludedItemsIds.value.includes(id))
    const selectedItems = selectedItemsIds
      .map(id => allItemsDictionary[id])
      .filter((item): item is FilterMonitorItem => item != null)

    emit('changed', {
      ...normalizedFilter,
      items: selectedItems,
      q: selectedItemsIds
    })
  } else {
    emit('changed', normalizedFilter)
  }
}

function addStringItem(): void {
  stringsToAdd.value.push({
    id: '',
    checked: true
  })
}

function removeStringItem(idx: number): void {
  stringsToAdd.value.splice(idx, 1)
}

function removeItem(idx: number): void {
  itemsToAdd.value.splice(idx, 1)
}

function changeFilterItemAtIndex(value: string | number, idx: number): void {
  if (!filterItems.value[idx]) return

  const changedQ: string[] = filterItems.value
    .map((d: FilterMonitorItem, i) => {
      if (i === idx) {
        return String(value).trim()
      }
      return String(d.id).trim() || ''
    })
    .filter((d: string) => {
      if (isIntegerType(type.value)) {
        return !Number.isInteger(Number(d))
      }
      return d.length > 0
    })
  editedFilter.value = { ...editedFilter.value, q: changedQ }
}

function toggleFilterItem(selected: boolean, uid: string): void {
  console.info('[FilterMonitor] @toggleFilterItem', selected, uid)
  if (selected) {
    excludedItemsIds.value = excludedItemsIds.value.filter(id => id !== uid)
  } else {
    excludedItemsIds.value = excludedItemsIds.value.concat(uid)
  }
}

function addEmbeddingSuggestion(embedding: string): void {
  stringsToAdd.value.push({
    id: embedding,
    checked: true
  })
}

function handleRangeChanged({ item, q }: IRangeChangedPayload): void {
  console.info('[FilterMonitor] @handleRangeChanged', item, q)
  editedFilter.value = {
    ...editedFilter.value,
    q
  }
  if (!includes(NumericRangeFacets, editedFilter.value.type)) {
    emit('daterange-changed', editedFilter.value)
  }
}

function handleFilterChanged(newFilter: FilterMonitorFilter): void {
  emit('changed', newFilter)
}

watch(
  [() => props.filter, () => props.itemsToAdd],
  ([incomingFilter, incomingItemsToAdd]) => {
    itemsToAdd.value = [...incomingItemsToAdd]

    const canonicalFilter: FilterMonitorFilter = toCanonicalFilter(incomingFilter)
    const normalizedCanonicalFilter: FilterMonitorFilter = {
      ...canonicalFilter,
      op: getNormalizedOperator(canonicalFilter.op)
    }

    if (itemsToAdd.value.length) {
      const canonicalFilterQ = getFilterQueryAsArray(normalizedCanonicalFilter)
      editedFilter.value = {
        ...normalizedCanonicalFilter,
        q: canonicalFilterQ.concat(
          itemsToAdd.value
            .map(({ uid, id }) => uid || id)
            .filter((id): id is string => typeof id === 'string' && id.length > 0)
        )
      }
    } else {
      editedFilter.value = normalizedCanonicalFilter
    }
    excludedItemsIds.value = []
  },
  {
    immediate: true,
    deep: true
  }
)
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
