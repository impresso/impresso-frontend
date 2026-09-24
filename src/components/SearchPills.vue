<template>
  <div class="search-pills d-flex" :class="{ empty: isEmpty }" data-testid="search-pills">
    <div
      v-if="isFrontFilterEnabled"
      class="btn btn-sm btn-outline-primary py-0 pr-1 mr-1 mb-1 d-flex align-items-center"
    >
      <div class="label">{{ $t('label.isFront') }}</div>
      <button
        @click="handleFrontpageFilterRemoved"
        class="btn btn-sm btn-transparent p-0 m-0"
        data-testid="remove-frontpage-filter-button"
      >
        <Icon name="cross" />
      </button>
    </div>

    <div v-for="{ filter, filterIndex } in pills" :key="filterIndex">
      <b-dropdown
        :right="rightAligned"
        size="sm"
        variant="outline-primary"
        class="mr-1 mb-1 search-pill"
        :data-testid="`search-pill-${filter.type}`"
      >
        <template #button-content>
          <span class="position-relative mx-1" style="padding-left: 20px">
            <Icon
              class="m-0 position-absolute left-0"
              style="top: -3px"
              :height="20"
              :width="20"
              :stroke-width="1.5"
              :name="filter.type"
            />
          </span>

          <template v-for="itemLabel in [getItemLabel(filter)]" :key="`item-label-${filterIndex}`">
            <SearchPillsItemLabel
              v-if="itemLabel"
              :label="itemLabel"
              :context-class="filter.context"
              :precision="filter.precision"
            />
          </template>

          <template v-for="qLabel in [getQLabel(filter)]" :key="`q-label-${filterIndex}`">
            <span v-if="qLabel" class="label" :class="[...qLabel.classNames, filter.context]">
              <template v-if="qLabel.translationKey">
                {{ $t(qLabel.translationKey, qLabel.params, qLabel.plural) }}
              </template>
              <template v-else>{{ qLabel.values }}</template>

              <span v-if="qLabel.hiddenCount > 0"
                >&nbsp;{{ $t('items.hidden', { count: qLabel.hiddenCount }) }}</span
              >
            </span>
          </template>

          <span
            class="label sp-collection"
            v-if="numericTypes.includes(filter.type)"
            :class="filter.context"
          >
            <template
              v-for="numeric in [labelForNumeric({ items: filter.items, type: filter.type })]"
              :key="`numeric-${filterIndex}`"
            >
              {{
                $t(numeric.translationKey, {
                  label: $t(numeric.labelTranslationKey),
                  start: $n(numeric.params.start),
                  end: $n(numeric.params.end)
                })
              }}
            </template>
          </span>

          <span
            class="label sp-daterange"
            v-if="filter.type === 'daterange'"
            :class="filter.context"
          >
            <template
              v-for="dateLabel in [labelByDaterangeItems({ items: filter.items, max: 2 })]"
              :key="`daterange-${filterIndex}`"
            >
              <template v-for="(item, index) in dateLabel.items" :key="`daterange-item-${index}`">
                {{
                  $t(dateLabel.itemTranslationKey, {
                    start: $d(item.startDate, 'compactUtc'),
                    end: $d(item.endDate, 'compactUtc')
                  })
                }}
                <span v-if="index < dateLabel.items.length - 1" class="op or px-1">{{
                  $t(dateLabel.operatorKey)
                }}</span>
              </template>
              <span v-if="dateLabel.hiddenCount > 0">{{
                $t('items.hidden', { count: dateLabel.hiddenCount })
              }}</span>
            </template>
          </span>
        </template>

        <div class="p-2 pb-1 sp-contents">
          <div class="description">
            {{ $t(`label.${filter.type}.title`, filter.items ? filter.items.length : 0) }}
          </div>
          <FilterMonitorPermission
            v-if="
              filter.type == 'permissionExplore' ||
              filter.type == 'permissionGetTranscript' ||
              filter.type == 'permissionGetImage'
            "
            checkbox
            :filter="filter"
            :operators="['AND', 'OR']"
            @changed="updatedFilter => handleFilterUpdated(filterIndex, updatedFilter)"
          />
          <FilterMonitor
            v-else
            checkbox
            :filter="filter"
            :operators="['AND', 'OR']"
            @changed="updatedFilter => handleFilterUpdated(filterIndex, updatedFilter)"
          />
        </div>

        <div class="px-2 mt-1 mb-2">
          <b-button
            block
            size="sm"
            variant="outline-primary"
            @click="handleFilterRemoved(filterIndex)"
          >
            {{ $t('actions.remove') }}
          </b-button>
        </div>
      </b-dropdown>
    </div>

    <b-button
      v-if="enableAddFilter"
      class="mb-1"
      variant="outline-primary"
      size="sm"
      data-testid="add-filter-button"
      @click="showFilterExplorer"
    >
      {{ $t('actions.addContextualFilter') }}
    </b-button>

    <b-button
      v-if="isResettable"
      class="mb-1 px-2 ml-auto border-radius"
      variant="outline-danger"
      :title="$t('actions.resetFilters')"
      data-testid="reset-filters-button"
      @click="handleReset"
    >
      <div class="d-flex dripicons-cross"></div>
    </b-button>

    <Explorer
      v-model="explorerFilters"
      :is-visible="explorerVisible"
      :searching-enabled="false"
      :included-types="explorerIncludedTypes"
      :index="index"
      @onHide="handleExplorerHide"
    />
  </div>
</template>

<script setup lang="ts">
import FilterMonitor from '@/components/modules/FilterMonitor.vue'
import Explorer from '@/components/Explorer.vue'
import SearchPillsItemLabel from '@/components/SearchPillsItemLabel.vue'
import { NumericRangeFacets, RangeFacets } from '@/logic/facets'
import { labelByItems, labelByQs } from '@/components/SearchPills.logic'
import type { LabelByItemsResult, LabelByQsResult } from '@/components/SearchPills.logic'
import FilterFactory from '@/models/FilterFactory'
import type { Entity, FilterWithItems, FacetType } from '@/models'
import { computed, ref, toRefs } from 'vue'
import Icon from './base/Icon.vue'
import type { SearchPillsItemLabelData } from '@/components/SearchPillsItemLabel.vue'
import { includes } from '@/util/fn.js'
import FilterMonitorPermission from './modules/FilterMonitorPermission.vue'

export type PillItem = Entity & {
  name?: string
  htmlExcerpt?: string
  start?: string | number | Date
  end?: string | number | Date
}

type Pill = {
  filter: FilterWithItems<PillItem>
  filterIndex: number
}

type LabelByDaterangeItemsOptions = {
  items?: Array<{ start?: string | number | Date; end?: string | number | Date }>
  max?: number
}

type LabelForNumericOptions = {
  items?: Array<{ start?: number | Date | string; end?: number | Date | string }>
  type: string
}

type ItemLabelResult = LabelByItemsResult & SearchPillsItemLabelData

type LabelByDaterangeItemsResult = {
  itemTranslationKey: string
  operatorKey: string
  hiddenCount: number
  items: Array<{ startDate: Date; endDate: Date }>
}

type QFilterLabelResult = LabelByQsResult & {
  classNames: string[]
}

type LabelForNumericResult = {
  translationKey: string
  labelTranslationKey: string
  params: {
    start: number
    end: number
  }
}

export interface SearchPillsProps {
  excludedTypes?: string[]
  includedFilterTypes?: string[]
  enableAddFilter?: boolean
  filters?: FilterWithItems<PillItem>[]
  index?: string
  disableReset?: boolean
  rightAligned?: boolean
}

const props = withDefaults(defineProps<SearchPillsProps>(), {
  excludedTypes: () => ['hasTextContents', 'isFront'],
  includedFilterTypes: undefined,
  enableAddFilter: false,
  filters: (): FilterWithItems<PillItem>[] => [],
  index: 'search',
  disableReset: false,
  rightAligned: false
})

const emit = defineEmits<{
  (e: 'changed', filters: FilterWithItems<PillItem>[]): void
}>()

const {
  excludedTypes,
  includedFilterTypes,
  enableAddFilter,
  filters,
  index,
  disableReset,
  rightAligned
} = toRefs(props)

const explorerVisible = ref(false)

const pills = computed<Pill[]>(() => {
  const filterFn =
    includedFilterTypes.value != null
      ? ({ filter }: Pill) => (includedFilterTypes.value || []).includes(filter.type)
      : ({ filter }: Pill) => !excludedTypes.value.includes(filter.type)

  return filters.value
    .map(
      (filter, filterIndex): Pill => ({
        filter: FilterFactory.create(filter) as FilterWithItems<PillItem>,
        filterIndex
      })
    )
    .filter(filterFn)
})

const isFrontFilterEnabled = computed<boolean>(() => {
  return filters.value.some(({ type }) => type === 'isFront')
})

const isEmpty = computed<boolean>(() => {
  return !isFrontFilterEnabled.value && pills.value.length === 0
})

const explorerFilters = computed<FilterWithItems<PillItem>[]>({
  get() {
    return filters.value
  },
  set(nextFilters: FilterWithItems<PillItem>[]) {
    emit('changed', nextFilters)
  }
})

const explorerIncludedTypes = computed<FacetType[] | undefined>(() => {
  return includedFilterTypes.value as FacetType[] | undefined
})

const numericTypes = computed<string[]>(() => {
  return NumericRangeFacets
})

const isResettable = computed<boolean>(() => {
  if (disableReset.value) return false
  return !!filters.value.filter(d => d.type !== 'hasTextContents').length
})

const handleFilterUpdated = (index: number, filter: FilterWithItems<PillItem>): void => {
  if (!includes(RangeFacets, filter.type) && Array.isArray(filter.q) && filter.q.length === 0) {
    return handleFilterRemoved(index)
  }

  const newFilters = [...filters.value]
  newFilters[index] = filter
  emit('changed', newFilters)
}

const handleFilterRemoved = (index: number): void => {
  const newFilters = filters.value.filter((f, idx) => idx !== index)
  emit('changed', newFilters)
}

const handleFrontpageFilterRemoved = (): void => {
  const newFilters = filters.value.filter(d => d.type !== 'isFront')
  emit('changed', newFilters)
}

const handleReset = (): void => {
  emit('changed', [])
}

const getItemLabel = (filter: FilterWithItems<PillItem>): ItemLabelResult | null => {
  if (['string', 'title'].includes(filter.type)) {
    return {
      ...labelByItems({ items: filter.items, max: 2, prop: 'id', op: filter.op }),
      classNames: ['sp-string', 'sp-title'],
      includePrecision: true
    }
  }

  if (filter.type === 'topic') {
    return {
      ...labelByItems({ items: filter.items, max: 2, prop: 'htmlExcerpt', op: filter.op }),
      classNames: ['sp-topic']
    }
  }

  if (
    [
      'person',
      'location',
      'newspaper',
      'mediaSource',
      'entity',
      'nag',
      'organisation',
      'mention'
    ].includes(filter.type)
  ) {
    return {
      ...labelByItems({ items: filter.items, max: 2, op: filter.op }),
      classNames: ['sp-labelled']
    }
  }

  if (
    [
      'language',
      'country',
      'type',
      'copyright',
      'copyright',
      'dataDomain',
      'partner',
      'sourceType',
      'sourceMedium'
    ].includes(filter.type)
  ) {
    return {
      ...labelByItems({
        items: filter.items,
        max: 2,
        prop: 'id',
        translate: true,
        type: filter.type,
        op: filter.op
      }),
      classNames: []
    }
  }
  if (
    ['permissionExplore', 'permissionGetTranscript', 'permissionGetImage'].includes(filter.type)
  ) {
    return {
      ...labelByItems({
        items: filter.items,
        max: 2,
        prop: 'title',
        translate: true,
        type: filter.type,
        op: filter.op
      }),
      classNames: []
    }
  }
  if (
    ['imageVisualContent', 'imageTechnique', 'imageCommunicationGoal', 'imageContentType'].includes(
      filter.type
    )
  ) {
    return {
      ...labelByItems({
        items: filter.items,
        max: 2,
        prop: 'label',
        translate: true,
        type: filter.type,
        op: filter.op
      }),
      classNames: []
    }
  }

  if (filter.type === 'collection') {
    return {
      ...labelByItems({ items: filter.items, max: 2, op: filter.op }),
      classNames: ['sp-collection']
    }
  }

  if (filter.type === 'embedding') {
    return {
      ...labelByItems({
        items: filter.items,
        max: 2,
        prop: 'id',
        op: filter.op,
        maxLength: 20
      }),
      classNames: ['sp-embedding']
    }
  }

  return null
}

const labelByDaterangeItems = ({
  items = [],
  max = 1
}: LabelByDaterangeItemsOptions = {}): LabelByDaterangeItemsResult => {
  return {
    itemTranslationKey: 'label.daterange.item',
    operatorKey: 'op.or',
    hiddenCount: items.slice(max).length,
    items: items.slice(0, max).map(item => ({
      startDate: new Date(item.start ?? 0),
      endDate: new Date(item.end ?? 0)
    }))
  }
}

const getQLabel = (filter: FilterWithItems<PillItem>): QFilterLabelResult | null => {
  if (filter.type === 'page') {
    return {
      ...labelByQs({
        q: filter.q,
        max: 3,
        translationKey: 'pps',
        valuesParamKey: 'pages',
        keepTailOnTruncate: true
      }),
      classNames: []
    }
  }

  if (filter.type === 'year') {
    return {
      ...labelByQs({ q: filter.q, max: 3, keepTailOnTruncate: true }),
      classNames: []
    }
  }

  if (filter.type === 'textReuseCluster') {
    return {
      ...labelByQs({ q: filter.q, max: 3, keepTailOnTruncate: true }),
      classNames: []
    }
  }

  return null
}

const labelForNumeric = ({ items = [], type }: LabelForNumericOptions): LabelForNumericResult => {
  const { start, end } = items[0] || {}

  const toNumber = (value: number | Date | string | undefined): number => {
    if (typeof value === 'number') return value
    if (value instanceof Date) return value.getTime()
    if (typeof value === 'string') {
      const parsed = Number(value)
      return Number.isFinite(parsed) ? parsed : 0
    }
    return 0
  }

  return {
    translationKey: 'label.range.item',
    labelTranslationKey: `label.${type}.item`,
    params: {
      start: toNumber(start),
      end: toNumber(end)
    }
  }
}

const showFilterExplorer = (): void => {
  explorerVisible.value = true
}

const handleExplorerHide = (): void => {
  explorerVisible.value = false
}
</script>

<style lang="scss">
@use '@/styles/variables.sass' as *;

.bg-dark .search-pills {
  .search-pill button {
    border-color: #caccce;
    color: #caccce;
  }
  .btn-outline-primary {
    color: white !important;
    svg path {
      stroke: white;
    }
  }
  .btn-outline-primary:hover {
    background-color: transparent !important;
    color: #caccce !important;
    svg path {
      stroke: #caccce;
    }
  }
}

.bg-dark button.dropdown-toggle {
  color: #caccce;
}

.search-box .search-pills {
  background: white;
  padding: 0.25rem;

  &.empty {
    padding: 0;
  }
}

.search-pills {
  display: flex;
  flex-flow: wrap;
  .btn-outline-primary:hover {
    background-color: transparent !important;
    color: var(--impresso-color-black) !important;
  }
  .search-pill {
    span.label {
      font-variant: normal;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: inline-flex;

      &.sp-string,
      & > .sp-string {
        background-color: #ffeb78;
      }

      &.sp-string.exact::before,
      &.sp-string.exact::after,
      & > .sp-string.exact::before,
      & > .sp-string.exact::after {
        content: '"';
        font-weight: bold;
      }

      &.sp-string.fuzzy::after,
      & > .sp-string.fuzzy::after {
        content: '~';
        font-weight: bold;
      }

      &.sp-string.soft::before,
      & > .sp-string.soft::before {
        content: '[';
        font-weight: bold;
      }

      &.sp-string.soft::after,
      & > .sp-string.soft::after {
        content: ']';
        font-weight: bold;
      }
    }

    span.label.exclude {
      text-decoration: line-through;
    }

    &.show button.dropdown-toggle {
      border-top-left-radius: 3px;
      border-top-right-radius: 3px;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }

    button.dropdown-toggle {
      padding-left: 0.15em;
      border-radius: 3px;

      .filter-icon {
        font-size: 1em;
        float: left;
        width: 1.6em;
        height: 1.6em;
        padding-top: 0.2em;
        margin-right: 0.2em;
        opacity: 0.8;
        // background: red;
      }

      .filter-remove {
        float: right;
        padding-right: 0;
        margin-right: -0.5em;

        &:hover {
          color: rgba(200, 0, 0, 0.9);
        }
      }
    }
  }

  .sp-contents {
    width: 300px;
  }

  .sp-contents ul {
    margin: 0;
    padding: 0;
  }

  .sp-contents ul > li {
    margin: 0;
    list-style: none;
    background: #f0f0f0;
  }

  .op.or {
    font-variant: small-caps;
    font-weight: bold;
  }
}
</style>
<i18n lang="json">
{
  "en": {
    "items": {
      "hidden": "({count} more)"
    },
    "type": {
      "string": "str",
      "newspaper": "new",
      "language": "lng",
      "topic": "top"
    },
    "language": {
      "de": "German (DE)",
      "fr": "French (FR)",
      "en": "Unclassified"
    }
  }
}
</i18n>
