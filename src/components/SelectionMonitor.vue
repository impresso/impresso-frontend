<template>
  <div
    class="pointer-events-none"
    style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden"
    v-if="isActive"
  >
    <ModalDraggable
      center-on-mount
      respect-boundaries
      class="SelectionMonitor bg-light border border-dark rounded shadow pointer-events-auto"
      :title="$t('selectionMonitorTitle', { type: $t(`tabs_${monitor.type}_${monitor.scope}`) })"
      handle-class="pl-3 d-flex justify-content-between align-items-center gap-2"
    >
      <template #header-actions>
        <Icon name="dots" :scale="0.3" :stroke-width="8" class="m-1" color="black" />
        <button
          class="btn btn-transparent text-dark"
          type="button"
          aria-label="Close"
          @click.stop="hide"
        >
          <Icon name="cross" color />
        </button>
      </template>

      <div :class="monitor.type" @click.stop>
        <div class="d-flex flex-column h-100">
          <!-- top -->
          <section>
            <!-- title -->
            <!-- if this is a range filter, allow to modify it with input text fields -->
            <SelectionMonitorFilterRange
              v-if="isRangeMonitorType"
              :filter="monitorItemAsFilter"
              @changeFilter="handleChangeFilter"
              class="border border-dark p-2 rounded"
              :step="monitor.itemFilterRangeStep"
              :min="monitor.itemFilterRangeMin"
              :max="monitor.itemFilterRangeMax"
            />
            <h2 class="mx-3 my-2" v-if="monitor.item">
              <ItemLabel :item="monitor.item" :type="monitor.type" />
            </h2>
            <!-- item previews -->
            <MediaSourcePreview
              v-if="monitor.type === 'newspaper'"
              :item="monitor.item"
              :itemType="monitor.type"
              class="mx-3 mb-2 text-muted"
            >
            </MediaSourcePreview>

            <EntityPreview
              class="mx-3 mb-2 text-muted"
              v-else-if="['person', 'location', 'organisation', 'nag'].includes(monitor.type)"
              :item="monitor.item"
              @more="hide"
            />
            <TopicPreview
              class="mx-3 mb-2 text-muted"
              v-else-if="monitor.type === 'topic'"
              :item="monitor.item"
              @more="hide"
            />
            <!-- timeline -->
            <div v-if="monitor.displayTimeline" class="mx-2">
              <div
                class="mx-3 very-small"
                v-html="
                  $t('timelineLabel', {
                    count: $n(total),
                    searchIndex: $t('searchIndexes.' + monitor.searchIndex)
                  })
                "
              />
              <SearchFacetTimeline
                facet-type="year"
                :search-index="monitor.searchIndex"
                :filters="monitorFilters"
                :domain="timelineDomain"
                items-class="p-0"
                @update:state="handleTimelineStateChange"
                :errorLoadingItemsMessage="$t('error.loadingTimelineItems')"
                :listIsEmptyMessage="$t('timelineNoItems')"
              >
                <template #tooltip="{ tooltip }">
                  <div v-if="tooltip.item">
                    {{ $d(tooltip.item?.t ?? 0, 'year') }} &middot;
                    <div
                      class="d-inline"
                      v-if="tooltip.item?.w"
                      v-html="$t('numbers.contentItems', { n: $n(tooltip.item.w) }, tooltip.item.w)"
                    />
                  </div>
                </template>
              </SearchFacetTimeline>
            </div>
            <!-- end timeline -->
            <!-- filters -->
            <div class="mx-3" v-if="monitor.displayCurrentSearchFilters">
              <BFormCheckbox
                switch
                v-model="applyCurrentSearchTimespan"
                :disabled="!(monitor.displayTimeline && total)"
              >
                <span
                  v-html="
                    $t('reduceTimelineToCurrentSearchTimespan', {
                      from: minDate.getFullYear(),
                      to: maxDate.getFullYear()
                    })
                  "
              /></BFormCheckbox>
              <BFormCheckbox
                switch
                v-model="applyCurrentSearchFilters"
                :disabled="!(monitor.displayTimeline && total)"
              >
                <span
                  v-html="
                    $t('labels.applyCurrentSearchFilters', {
                      count: currentSearchFilters.length
                    })
                  "
                />
              </BFormCheckbox>
              <section class="border-top pt-2 my-2">
                <Ellipsis :initialHeight="100">
                  <div>
                    <span
                      class="small"
                      v-html="
                        $t(statsLabelKey, {
                          count: $n(total),
                          searchIndex: $t('searchIndexes.' + monitor.searchIndex)
                        })
                      "
                    />{{ ' ' }}
                    <SearchQuerySummary class="d-inline small" :search-query="searchQuery" />
                  </div>
                </Ellipsis>
              </section>
            </div>
            <!-- end filters -->
          </section>
          <!-- end top -->
          <!-- bottom -->
          <TextReuseClusterMonitor
            :filters="monitorFilters"
            :item="monitor.item"
            v-if="monitor.type === 'textReuseCluster'"
            class="flex-grow-1"
          />
          <!-- range closeup view-->
          <template
            v-if="
              [
                'textReuseClusterLexicalOverlap',
                'textReuseClusterDayDelta',
                'textReuseClusterSize'
              ].includes(monitor.type)
            "
          >
            <div
              class="mx-3 very-small border-top pt-2"
              v-html="
                $t('closeUpViewLabel', {
                  searchIndex: $t('searchIndexes.' + monitor.searchIndex)
                })
              "
            />
            <ListOfItems
              :params="{ addons: { newspaper: 'text' } }"
              :filters="monitorFilters"
              :searchIndex="monitor.searchIndex"
            >
              <template v-slot:default="props">
                <div class="d-flex justify-content-center">
                  <TextReusePassageItem
                    v-for="match in props.items"
                    :key="match.id"
                    :item="match"
                  />
                </div>
              </template>
            </ListOfItems>
          </template>
          <!-- actions -->
          <div class="p-3 d-flex justify-content-between" v-if="monitor.displayActionButtons">
            <button
              @click.prevent.stop="applyFilter"
              :disabled="shouldUpdateCurrentSearchFilters"
              class="btn btn-sm btn-outline-primary"
            >
              {{ $t('actions.addToCurrentFilters') }}
            </button>
            <button @click.prevent.stop="hide" class="btn btn-sm btn-outline-primary">
              {{ $t('actions.close') }}
            </button>
          </div>
          <!-- end actions -->
          <pre v-if="monitor.debug">{{ JSON.stringify(monitor, null, 2) }}</pre>
        </div>
      </div>
    </ModalDraggable>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Filter } from '@/models'
import { SupportedFiltersByIndex, joinFiltersWithItems, serializeFilters } from '@/logic/filters'
import { filtersItems as filterItemsService } from '@/services'
import FilterFactory from '@/models/FilterFactory'
import { useSelectionMonitorStore } from '@/stores/selectionMonitor'
import EntityPreview from '@/components/entity/EntityPreview.vue'
import ItemLabel from '@/components/modules/lists/ItemLabel.vue'
import ListOfItems from '@/components/ListOfItems.vue'
import ModalDraggable from '@/components/ModalDraggable.vue'
import SearchFacetTimeline from '@/components/SearchFacetTimeline.vue'
import type { SearchFacetTimelineState } from '@/components/SearchFacetTimeline.vue'
import SearchQuerySummary from '@/components/modules/SearchQuerySummary.vue'
import SelectionMonitorFilterRange from '@/components/SelectionMonitorFilterRange.vue'
import TextReuseClusterMonitor from '@/components/TextReuseClusterMonitor.vue'
import TextReusePassageItem from '@/components/modules/lists/TextReusePassageItem.vue'
import type { TimelineValue } from '@/logic/facets'
import BFormCheckbox from './legacy/bootstrap/BFormCheckbox.vue'
import Ellipsis from './modules/Ellipsis.vue'
import Icon from './base/Icon.vue'
import MediaSourcePreview from './mediaSource/MediaSourcePreview.vue'
import TopicPreview from './topics/TopicPreview.vue'

interface SelectionMonitorProps {
  /* This list of filters represent the current search filters */
  filters?: Filter[]
  startYear?: number
  endYear?: number
}

const props = withDefaults(defineProps<SelectionMonitorProps>(), {
  filters: () => []
})

const emit = defineEmits<{
  (e: 'change', filters: Filter[]): void
}>()

const rangeMonitorTypes = [
  'ocrQuality',
  'contentLength',
  'textReuseClusterLexicalOverlap',
  'textReuseClusterDayDelta',
  'textReuseClusterSize'
]

const selectionMonitorStore = useSelectionMonitorStore()
const monitor = selectionMonitorStore

const total = ref(0)
const timelineValues = ref<TimelineValue[]>([])
const timelineStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const applyCurrentSearchFilters = ref(false)
const applyCurrentSearchTimespan = ref(false) // separate ref to avoid unnecessary timeline re-fetch when toggling the checkbox (since the timeline only depends on monitorFilters, not on applyCurrentSearchFilters directly)

const isLoadingFilterItems = ref(false)
const filterItemsRequestId = ref(0)

const isActive = computed(() => selectionMonitorStore.isActive)
const isRangeMonitorType = computed(() => rangeMonitorTypes.includes(monitor.type ?? ''))

// Memoized independently so everything downstream doesn't re-run on unrelated changes.
// Previously this was inlined inside monitorFilter, causing FilterFactory.create() to
// be called on every computed that touched monitorFilter (monitorFilters, timelineFilters,
// summaryFilters, displayFilters) — even when monitor.item hadn't changed.
const monitorType = computed(() => monitor.type)
const monitorItem = computed(() => monitor.item as { id?: string; q?: string | string[] } | null)

const editedMonitorItemAsFilter = ref<Filter | null>(null)
const monitorItemAsFilter = computed<Filter | null>(() => {
  if (!monitorItem.value) {
    return null
  }
  if (editedMonitorItemAsFilter.value) {
    return editedMonitorItemAsFilter.value
  }
  const item = monitorItem.value
  const query = Array.isArray(item?.q)
    ? item.q.map(value => String(value))
    : [String(item?.q ?? item?.id ?? '')]

  return FilterFactory.create({
    type: monitorType.value,
    q: query,
    items: item ? [item] : []
  }) as Filter
})

const shouldUpdateCurrentSearchFilters = computed(() => {
  if (!monitorItemAsFilter.value) {
    return false
  }
  const currentMatchingFilter = props.filters?.find(
    filter =>
      filter.type === monitorItemAsFilter.value.type &&
      FilterFactory.filtersAreEqual(filter, monitorItemAsFilter.value)
  )
  if (!currentMatchingFilter) {
    return false
  }

  // update (replace) the existing filter of the same type if there is one, instead of adding a new one
  return FilterFactory.filtersAreEqual(monitorItemAsFilter.value, currentMatchingFilter)
})
const initialSearchFilters = computed<Filter[]>(() => {
  return monitor.initialSearchFilters || []
})

const currentSearchFilters = computed<Filter[]>(() => {
  const availableFilterTypes = SupportedFiltersByIndex[monitor.searchIndex] ?? []
  return props.filters.filter(filter => availableFilterTypes.includes(filter.type))
})

/**
 * The filters to apply to the timeline and display in the summary, which are a combination of:
 * - the current search filters (if `monitor.displayCurrentSearchFilters` is true and there are any)
 * - the initialSearchFilters provided by the monitor (if any)
 * - the monitor item as a filter (if it can be represented as a filter and isn't already included in the above)
 */
const monitorFilters = computed<Filter[]>(() => {
  const availableFilterTypes = SupportedFiltersByIndex[monitor.searchIndex] ?? []
  let baseFilters: Filter[] = []
  if (monitor.displayCurrentSearchFilters && applyCurrentSearchFilters.value) {
    baseFilters = [...currentSearchFilters.value]
  }
  if (initialSearchFilters.value.length) {
    baseFilters = baseFilters.concat(initialSearchFilters.value)
  }
  if (editedMonitorItemAsFilter.value) {
    baseFilters = baseFilters.concat([editedMonitorItemAsFilter.value])
  } else if (monitorItemAsFilter.value) {
    baseFilters = baseFilters.concat([monitorItemAsFilter.value])
  }
  return baseFilters.filter(
    (filter: Filter) => !!filter && availableFilterTypes.includes(filter.type)
  )
})
const monitorFiltersWithItems = ref<Filter[]>([])

// summaryFiltersWithFallback had a single consumer (searchQuery). Inlining it removes
// one reactive node from the dependency graph and makes the data flow easier to follow.
const searchQuery = computed(() => ({
  filters: monitorFiltersWithItems.value.length
    ? monitorFiltersWithItems.value
    : monitorFilters.value
}))

const statsLabelKey = computed(() => {
  if (timelineStatus.value === 'loading' || isLoadingFilterItems.value) {
    return 'actions.loading'
  }
  return applyCurrentSearchFilters.value && props.filters.length ? 'itemStatsFiltered' : 'itemStats'
})

const fallbackStartYear = computed(() => props.startYear ?? new Date().getFullYear())
const fallbackEndYear = computed(() => props.endYear ?? new Date().getFullYear())

const minDate = computed(() => {
  if (timelineValues.value.length) {
    const year = timelineValues.value.reduce(
      (min, item) => (item.t < min ? item.t : min),
      timelineValues.value[0].t
    )
    return new Date(`${year}-01-01`)
  }
  return new Date(`${fallbackStartYear.value}-01-01`)
})

const maxDate = computed(() => {
  if (timelineValues.value.length) {
    const year = timelineValues.value.reduce(
      (max, item) => (item.t > max ? item.t : max),
      timelineValues.value[0].t
    )
    return new Date(`${year}-12-31`)
  }
  return new Date(`${fallbackEndYear.value}-12-31`)
})

const timelineDomain = computed<number[] | undefined>(() => {
  if (props.startYear == null || props.endYear == null) {
    return undefined
  }
  if (!applyCurrentSearchTimespan.value) {
    return [props.startYear, props.endYear]
  }
  return undefined
})

const resetTimelineState = () => {
  total.value = 0
  timelineValues.value = []
  timelineStatus.value = 'idle'
}

const handleTimelineStateChange = (state: SearchFacetTimelineState) => {
  timelineStatus.value = state.status
  timelineValues.value = state.values
  total.value = state.total
}

const handleChangeFilter = (newFilter: Filter) => {
  console.debug('[SelectionMonitor] handleChangeFilter', newFilter)
  editedMonitorItemAsFilter.value = newFilter
}

const hide = (event?: MouseEvent) => {
  console.debug('[SelectionMonitor] hide')
  selectionMonitorStore.hide()
  event?.stopImmediatePropagation()
}

const applyFilter = () => {
  if (!shouldUpdateCurrentSearchFilters.value) {
    emit('change', monitorFilters.value)
    return
  }

  const baseFilters = props.filters.filter(filter => filter.type !== monitorType.value)

  if (initialSearchFilters.value.length) {
    emit('change', baseFilters.concat(initialSearchFilters.value))
    return
  }

  emit('change', baseFilters.concat(monitorItemAsFilter.value))
}

watch(
  () => selectionMonitorStore.applyCurrentSearchFilters,
  value => {
    applyCurrentSearchFilters.value = value
  },
  { immediate: true }
)

watch(
  () => monitor.type,
  () => {
    editedMonitorItemAsFilter.value = null
    monitorFiltersWithItems.value = []
    resetTimelineState()
  }
)

// Watch gated on isActive + monitorFilters so the async fetch only fires when the
// monitor is actually open and has something to display. Previously it ran
// immediately on mount (even with isActive=false) because immediate:true was set
// and there was no isActive guard — this could trigger a network request before
// the panel was ever shown.
watch(
  [isActive, monitorFilters],
  async ([active], _old, onCleanup) => {
    if (!active || !monitorItem.value) {
      monitorFiltersWithItems.value = []
      return
    }

    const requestId = ++filterItemsRequestId.value
    let cancelled = false
    onCleanup(() => {
      cancelled = true
    })

    isLoadingFilterItems.value = true
    try {
      const nextFiltersWithItems = await filterItemsService
        .find({ query: { filters: serializeFilters(monitorFilters.value) } })
        .then(joinFiltersWithItems)

      if (!cancelled && requestId === filterItemsRequestId.value) {
        monitorFiltersWithItems.value = nextFiltersWithItems
      }
    } catch (e) {
      console.error('[SelectionMonitor] Failed to load filter items', e)
      if (!cancelled && requestId === filterItemsRequestId.value) {
        monitorFiltersWithItems.value = monitorFilters.value
      }
    } finally {
      if (!cancelled && requestId === filterItemsRequestId.value) {
        isLoadingFilterItems.value = false
      }
    }
  },
  { immediate: false }
)
</script>

<style lang="css">
.SelectionMonitor {
  border: 1px solid #343a40;
  position: absolute;

  width: 400px;
  pointer-events: auto;
}

.SelectionMonitor_body {
  max-height: 300px;
  overflow-y: scroll;
}
.SelectionMonitor_close {
  cursor: pointer;
}
.SelectionMonitor_close:hover {
  color: var(--primary);
}
.SelectionMonitor h2 {
  font-size: inherit;
}

.SelectionMonitor_summary .date {
  font-weight: bold;
  text-transform: lowercase;
  font-variant: small-caps;
}

@media (min-width: 992px) {
  .SelectionMonitor.textReuseCluster,
  .SelectionMonitor.textReuseCluster {
    width: 800px;
    margin-left: -400px;
  }
  .SelectionMonitor.textReuseClusterSize,
  .SelectionMonitor.textReuseClusterDayDelta,
  .SelectionMonitor.textReuseClusterLexicalOverlap {
    width: 600px;
    margin-left: -300px;
  }
  .SelectionMonitor .TextReusePassageItem {
    max-width: initial;
    margin: 0 var(--spacing-3);
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "labels": {
      "applyCurrentSearchFilters": "Show within current search"
    },
    "searchIndexes": {
      "search": "content items",
      "tr_passages": "text reuse passages",
      "textReuse": "Text Reuse"
    },
    "types_country": "country of publication",
    "types_language": "language",
    "types_copyright": "copyright status",
    "types_partner": "archive / partner institution",
    "types_topic": "topic",
    "types_collection": "collection",
    "types_newspaper": "newspaper",
    "types_person": "person",
    "types_location": "location",
    "types_type": "article type",
    "types_textReuseCluster": "cluster of text reuse",
    "types_textReuseClusterSize": "cluster size",
    "types_textReuseClusterDayDelta": "time span in days",
    "types_textReuseClusterLexicalOverlap": "lexical overlap",
    "tabs_collection_overview": "collection",
    "tabs_mediaSource_overview": "media source",
    "tabs_string_overview": "Text search",
    "tabs_textReuseCluster_overview": "cluster of text reuse",
    "tabs_textReuseCluster_comparePassages": "compare text reuse passages in this cluster",
    "tabs_textReuseClusterSize_closeUp": "text reuse cluster size",
    "tabs_textReuseClusterLexicalOverlap_closeUp": "lexical overlap",
    "tabs_textReuseClusterDayDelta_closeUp": "Time span in days",
    "tabs_ocrQuality_closeUp": "OCR quality",
    "tabs_contentLength_closeUp": "Content length",
    "tabs_newspaper_overview": "media source",
    "tabs_topic_overview": "topic",
    "tabs_partner_overview": "provider",
    "tabs_copyright_overview": "copyright status",
    "tabs_language_overview": "language",
    "tabs_type_overview": "item type",
    "tabs_sourceType_overview": "source type",
    "tabs_sourceMedium_overview": "source medium",
    "tabs_country_overview": "country of publication",
    "tabs_person_overview": "person",
    "tabs_persons_overview": "person",
    "tabs_location_overview": "location",
    "tabs_locations_overview": "location",
    "tabs_organisation_overview": "organisation",
    "tabs_organisations_overview": "organisation",
    "tabs_newsagencies_overview": "news agency",
    "tabs_nag_overview": "news agency",
    "actions.loading": "Loading…",
    "itemStatsEmpty": "No results apparently",
    "itemStats": "<b class='number'>{count}</b> {searchIndex}",
    "itemStatsFiltered": "<b class='number'>{count}</b> {searchIndex} using current search filters",
    "timelineLabel": "Number of {searchIndex} per year",
    "closeUpViewLabel": "Close-up view of {searchIndex}",
    "reduceTimelineToCurrentSearchTimespan": "Zoom to search results range ({from} - {to})",
    "error": {
      "loadingTimelineItems": "Failed to load timeline items"
    },
    "selectionMonitorTitle": "Previewing: {type}",
    "timelineNoItems": "No timeline items to display"
  }
}
</i18n>
