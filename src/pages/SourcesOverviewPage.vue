<script setup lang="ts">
import Ellipsis from '@/components/modules/Ellipsis.vue'
import SearchSidebar from '@/components/modules/SearchSidebar.vue'
import PageNavbarHeading from '@/components/PageNavbarHeading.vue'
import SourcesOverviewTimeline, {
  TooltipPosition
} from '@/components/sourcesOverview/SourcesOverviewTimeline.vue'
import { buildEmptyFacets } from '@/logic/facets'
import { serializeFilters, SupportedFiltersByContext } from '@/logic/filters'
import FacetModel, { FacetType } from '@/models/Facet'
import { searchFacets as searchFacetsService, stats as statsService } from '@/services'
import { watch } from 'vue'
import { computed, onMounted, ref } from 'vue'
import type { DataValue } from '@/components/sourcesOverview/SourcesOverviewDateValueItem.vue'
import InfoButton from '@/components/base/InfoButton.vue'
import SourceOverviewNavigator from '@/components/sourcesOverview/SourceOverviewNavigator.vue'
import SourcesOverviewModal from '@/components/sourcesOverview/SourcesOverviewModal.vue'
import SourceOverviewMiniTimeline from '@/components/sourcesOverview/SourceOverviewMiniTimeline.vue'

interface Props {
  filtersWithItems?: Array<any>
  filters?: Array<any>
  onFiltersChanged?: (newFilters: Array<any>) => void
}

const FacetTypes = [
  'language',
  'newspaper',
  'type',
  'country',
  'partner',
  // 'year',
  'contentLength',
  'copyright',
  'sourceType',
  'sourceMedium',
  // DPFS facets
  'person',
  'location',
  'nag',
  'organisation',
  'topic'
] satisfies FacetType[]

const props = withDefaults(defineProps<Props>(), {
  filters: () => [],
  filtersWithItems: () => [],
  onFiltersChanged: () => {}
})

const allowedFiltersWithItems = computed(() => {
  return props.filtersWithItems.filter(({ type }) =>
    SupportedFiltersByContext.search.includes(type)
  )
})
const dateRangeBounds = computed<{ min: Date; max: Date }>(() => {
  const allDates: Date[] = dataValues.value.flatMap((dv: DataValue) => dv.dateRange)
  return allDates.reduce(
    (bounds: { min: Date; max: Date }, date: Date) => ({
      min: date < bounds.min ? date : bounds.min,
      max: date > bounds.max ? date : bounds.max
    }),
    { min: new Date('2030-12-31'), max: new Date('1700-01-01') }
  )
})

const minStartDate = computed(() => dateRangeBounds.value.min)
const maxEndDate = computed(() => dateRangeBounds.value.max)

const totalContentItems = computed(() => dataValues.value.reduce((sum, dv) => sum + dv.value, 0))
const facets = ref([])
const dataValues = ref<DataValue[]>([])
const isLoading = ref(true)
const totalResults = ref(0)
const isHelperModalVisible = ref(true)

const normalize = ref(false)
const fitToContainerWidth = ref(false)
const minimumGap = ref<number>(10)
const minimumVerticalGap = ref<number>(50)
const minimumVerticalHeight = ref<number>(4)
const withPowerScale = ref(true)
const tooltipPosition = ref<TooltipPosition | null>(null)
const timelineRef = ref<InstanceType<typeof SourcesOverviewTimeline>>()

const handleTooltipMove = (pos: TooltipPosition) => {
  tooltipPosition.value = pos
}

const handleScrollUpdate = (updated: TooltipPosition) => {
  tooltipPosition.value = updated
  timelineRef.value?.scrollTo(updated.scrollLeft, updated.scrollTop)
}

const toggleOpenHelperModal = (isOpen: boolean) => {
  isHelperModalVisible.value = isOpen
}
watch(
  () => props.filters,
  async newVal => {
    isLoading.value = true
    totalResults.value = 0
    const facetsItems = await searchFacetsService
      .find({
        query: {
          facets: FacetTypes,
          filters: newVal
        }
      })
      .then(response => response.data.map(f => new FacetModel(f as any)))

    const timelineFacets = await searchFacetsService
      .find({
        query: {
          facets: ['year'],
          filters: newVal,
          limit: 300 // get all values
        }
      })
      .then(response => response.data.map(f => new FacetModel(f as any)))
    facets.value = [...timelineFacets, ...facetsItems]
    const statsItems = await statsService.find({
      query: {
        facet: 'newspaper',
        domain: 'time',
        index: 'search',
        filters: serializeFilters(newVal)
      }
    })

    const dataValuesByMediaSourceId: Record<string, DataValue[]> = statsItems.items.reduce(
      (
        acc: Record<string, DataValue[]>,
        d: {
          domain: string
          value: {
            count: number
            items: {
              term: string
              count: number
            }[]
          }
        }
      ) => {
        d.value.items.forEach(item => {
          if (!acc[item.term]) {
            acc[item.term] = []
          }
          const date = new Date(d.domain)
          let startDate = new Date(date.getFullYear(), 0, 1)
          let endDate = new Date(date.getFullYear(), 11, 31)
          if (statsItems.meta.resolution === 'month') {
            startDate = new Date(date.getFullYear(), date.getMonth(), 1)
            endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
          } else if (statsItems.meta.resolution === 'day') {
            startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
            endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
          }
          acc[item.term].push({
            date: startDate,
            dateRange: [startDate, endDate],
            value: item.count,
            label: item.term
          } as DataValue)
        })
        return acc
      },
      {} as Record<string, DataValue[]>
    )

    dataValues.value = Object.entries(dataValuesByMediaSourceId).map(([mediaSourceId, values]) => {
      const allDates = values.flatMap(v => [v.dateRange[0], v.dateRange[1]])
      const minDate = new Date(Math.min(...allDates.map(d => d.getTime())))
      const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())))
      const totalValue = values.reduce((sum, v) => sum + v.value, 0)
      const label = statsItems.itemsDictionary[mediaSourceId] ?? mediaSourceId
      return {
        id: mediaSourceId,
        date: minDate,
        dateRange: [minDate, maxDate],
        value: totalValue,
        label,
        dataValues: values
      } as DataValue
    })
    totalResults.value = dataValues.value.length
    isLoading.value = false
  },
  { immediate: true }
)

onMounted(() => {
  facets.value = buildEmptyFacets(FacetTypes)
})
</script>

<template>
  <i-layout class="SearchOverviewPage">
    <SearchSidebar
      width="350px"
      :filters="allowedFiltersWithItems"
      :facets="facets"
      contextTag="search"
      @changed="props.onFiltersChanged"
    >
      <template #tabs>
        <b-tabs pills class="mx-2 pt-2">
          <template v-slot:tabs-end>
            <b-nav-item :to="{ name: 'sources' }" class="active" active-class="none">
              <span v-html="$t('pageLabel' + (isLoading ? '-loading' : ''))" />
            </b-nav-item>
          </template>
        </b-tabs>
      </template>
    </SearchSidebar>
    <i-layout-section main>
      <template v-slot:header>
        <PageNavbarHeading
          :label="$t('pageLabel' + (isLoading ? '-loading' : ''))"
          :title="$t('pageTitle' + (isLoading ? '-loading' : ''))"
        >
          <template #summaryActions>
            <b-dropdown size="sm" variant="outline-secondary" right containsForm initialIsOpen>
              <template #button-content> {{ $t('visualisationSettings') }}</template>
              <section class="py-2">
                <div
                  class="d-flex align-items-center justify-content-between mx-3 py-2 gap-2 border-bottom"
                >
                  <b-form-checkbox v-model="normalize" switch>
                    <span class="no-small-caps">{{ $t('normalizeLocally') }}</span>
                  </b-form-checkbox>
                  <InfoButton
                    :name="$t('normalizeLocallyInfoTitle')"
                    :defaultContent="$t('normalizeLocallyInfoDescription')"
                  >
                  </InfoButton>
                </div>

                <div class="d-flex align-items-center justify-content-between px-3 py-2 gap-2">
                  <b-form-checkbox v-model="fitToContainerWidth" switch>
                    <span class="no-small-caps">{{ $t('fitToContainerWidth') }}</span>
                  </b-form-checkbox>
                  <InfoButton
                    :name="$t('fitToContainerWidthInfoTitle')"
                    :defaultContent="$t('fitToContainerWidthInfoDescription')"
                  >
                  </InfoButton>
                </div>

                <div class="mx-3 my-2 pb-3 border-bottom">
                  <span class="text-muted small">{{ $t('minimumGap') }}</span>
                  <b-form-input
                    type="number"
                    v-model.number="minimumGap"
                    min="10"
                    step="1"
                    :disabled="fitToContainerWidth"
                    class="rounded-sm form-control-sm"
                  ></b-form-input>
                </div>
                <div class="mx-3 my-2">
                  <span class="text-muted small">{{ $t('minimumVerticalGap') }}</span>
                  <b-form-input
                    type="number"
                    v-model.number="minimumVerticalGap"
                    min="15"
                    step="1"
                    class="rounded-sm form-control-sm"
                  ></b-form-input>
                </div>
                <div class="mx-3 my-2">
                  <span class="text-muted small">{{ $t('minimumVerticalHeight') }}</span>
                  <b-form-input
                    type="number"
                    v-model.number="minimumVerticalHeight"
                    :min="1"
                    :max="minimumVerticalGap"
                    step="1"
                    class="rounded-sm form-control-sm"
                  ></b-form-input>
                </div>
                <div class="d-flex align-items-center justify-content-between mx-3 py-2 gap-2">
                  <b-form-checkbox v-model="withPowerScale" switch>
                    <span class="no-small-caps">{{ $t('withPowerScale') }}</span>
                  </b-form-checkbox>
                  <InfoButton
                    :name="$t('withPowerScaleInfoTitle')"
                    :defaultContent="$t('withPowerScaleInfoDescription')"
                  >
                  </InfoButton>
                </div>
              </section>
            </b-dropdown>
          </template>
          <template #summary>
            <Ellipsis v-bind:initialHeight="60">
              <div v-if="isLoading">Loading...</div>
              <div v-else>
                <span
                  v-html="
                    $tc('numbers.contentItems', totalContentItems, { n: $n(totalContentItems) })
                  "
                ></span>
                {{ $tc('sources_overview_page_summary', totalResults, { total: totalResults }) }}
                <span
                  v-html="
                    $t('dates.fromTo', {
                      from: $d(minStartDate, 'short'),
                      to: $d(maxEndDate, 'short')
                    })
                  "
                ></span>
              </div>
            </Ellipsis>
          </template>
        </PageNavbarHeading>
      </template>
      <SourcesOverviewTimeline
        ref="timelineRef"
        :normalizeLocally="normalize"
        class="h-100"
        :fitToContainerWidth="fitToContainerWidth"
        :startDate="minStartDate"
        :endDate="maxEndDate"
        :dataValues="dataValues"
        :minimumGap="minimumGap"
        :minimumVerticalGap="minimumVerticalGap"
        :minimumVerticalHeight="minimumVerticalHeight"
        :scaleExponent="withPowerScale ? 4 : 1"
        @tooltip-move="handleTooltipMove"
      />
      <div class="position-absolute top-0 end-0 p-2">
        <SourceOverviewNavigator
          :initialX="20"
          :initialY="120"
          @update:tooltipPosition="handleScrollUpdate"
          :tooltip-position="tooltipPosition"
          :startDate="minStartDate"
          :endDate="maxEndDate"
          :dataValues="dataValues"
          :z-index="1038"
        >
          <footer class="m-2">
            <button
              class="btn btn-sm border border-dark btn-outline-secondary"
              v-on:click="toggleOpenHelperModal(true)"
              style="pointer-events: all"
            >
              {{ $t('gettingStarted') }}
            </button>
          </footer>
          <template #minimap>
            <SourceOverviewMiniTimeline
              :startDate="minStartDate"
              :endDate="maxEndDate"
              :dataValues="dataValues"
              :containerWidth="250"
              :height="200"
            />
          </template>
        </SourceOverviewNavigator>
      </div>

      <SourcesOverviewModal
        :isVisible="isHelperModalVisible"
        :filters="filtersWithItems"
        @dismiss="toggleOpenHelperModal(false)"
      ></SourcesOverviewModal>
    </i-layout-section>
  </i-layout>
</template>

<i18n lang="json">
{
  "en": {
    "pageLabel": "Sources Overview",
    "pageTitle": "Explore the sources in the archive",
    "pageLabel-loading": "Loading...",
    "pageTitle-loading": "Loading...",
    "sources_overview_page_summary": "0 media sources | in 1 media source | in {total} media sources",
    "visualisationSettings": "Visualisation Settings",
    "normalizeLocally": "Normalize Data per source",
    "normalizeLocallyInfoTitle": "Normalize Data per Source",
    "normalizeLocallyInfoDescription": "When enabled, the data for each media source is normalized individually, allowing for better comparison between sources with varying content volumes.",
    "fitToContainerWidth": "Fit to Container Width",
    "fitToContainerWidthInfoTitle": "Fit to Container Width",
    "fitToContainerWidthInfoDescription": "When enabled, the timeline will adjust its width to fit the container, providing an optimal viewing experience across different screen sizes.",
    "minimumVerticalGap": "Vertical bar height (px)",
    "minimumGap": "Horizontal bar width (px)",
    "minimumVerticalHeight": "Minimum height for lower values (px)",
    "withPowerScale": "With Power Scale",
    "withPowerScaleInfoTitle": "With Power Scale",
    "withPowerScaleInfoDescription": "When enabled, the vertical scaling of the bars will use a power scale, enhancing the visibility of sources with lower content volumes.",
    "gettingStarted": "Getting Started Guide"
  }
}
</i18n>
