<template>
  <div class="CollectionDetailPageOverviewTab container ml-0">
    <div class="row">
      <div class="col-12">
        <div class="tb-title label small-caps font-weight-bold">
          {{ $t('label.year.optionsTitle') }}
        </div>
        <div class="small">{{ $t('label.year.optionsDescription') }}</div>
        <Timeline
          v-if="timelineValues.length"
          :class="{ loading: isTimelineLoading }"
          :domain="[timelineStartYear, timelineEndYear]"
          :values="timelineValues"
        >
          <template v-slot="tooltipScope">
            <div v-if="tooltipScope.tooltip.item">
              {{ $d(tooltipScope.tooltip.item.t ?? 0, 'year') }} &middot;
              <b>{{ tooltipScope.tooltip.item.w ?? 0 }}</b>
            </div>
          </template>
        </Timeline>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Timeline from './modules/Timeline.vue'
import { searchFacets as searchFacetsService } from '@/services'
import Helpers from '@/plugins/Helpers'

const props = defineProps<{
  collection: any
  isLoading: boolean
}>()
const isTimelineLoading = ref(false)
const timelineValues = ref([])
const timelineStartYear = computed(() => {
  return (window as any).impressoDocumentsYearSpan.firstYear
})
const timelineEndYear = computed(() => {
  return (window as any).impressoDocumentsYearSpan.lastYear
})
const collectionUid = computed(() => {
  return props.collection?.uid
})

const loadTimeline = async (uid: string) => {
  // Simulate loading timeline data
  console.debug('[CollectionDetailPageOverviewTab] loadTimeline, collection UID:', uid)

  isTimelineLoading.value = true
  // Here you would typically fetch the timeline data based on the collection UID
  const values = await searchFacetsService
    .get('year', {
      query: {
        filters: [
          {
            type: 'collection',
            q: [uid]
          }
        ],
        limit: 100000
      }
    })
    .then(res => Helpers.timeline.fromBuckets(res.buckets))
    .catch(err => {
      console.error('Error loading timeline data:', err)
      return []
    })
  console.debug('[CollectionDetailPageOverviewTab] Timeline values:', values)
  timelineValues.value = values
  isTimelineLoading.value = false
}

watch(
  collectionUid,
  newUid => {
    if (newUid) {
      // Perform any action when the collection UID changes
      console.debug('[CollectionDetailPageOverviewTab] UID changed:', newUid)
      loadTimeline(newUid)
    }
  },
  { immediate: true }
)
</script>
