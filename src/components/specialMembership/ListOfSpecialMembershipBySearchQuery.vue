<template>
  <ListOfFindResponseItems
    :service="searchFacetService"
    :params="listParams"
    :list-is-empty-message="$t('labels.noSpecialMembershipPlansFound')"
    :error-loading-items-message="$t('error_loading')"
    :data-accessor="dataAccessor"
    :pagination-accessor="paginationAccessor"
  >
    <template #header="{ total }">
      <div class="p-2">
        <div class="container-fluid">
          <div class="row">
            <div class="col-12 border-bottom pb-2 d-flex gap-3 align-items-center">
              <div
                v-html="$t('numbers.itemsGeneric', { n: $n(total) }, total)"
                class="small text-muted"
              ></div>
              <BFormCheckbox
                switch
                v-model="applyCurrentSearchFilters"
                :disabled="currentSearchFilters.length === 0"
              >
                <span v-html="$t('labels.applyCurrentSearchFilters')" />
              </BFormCheckbox>
            </div>
          </div>
          <div class="row mt-1">
            <div class="col-5 small text-muted">{{ $t('labels.title') }}</div>
            <div class="col-2 small text-muted">{{ $t('labels.numberOfUsers') }}</div>
            <div class="col-5 small text-muted">{{ $t('labels.access') }}</div>
          </div>
        </div>
      </div>
    </template>
    <template #default="{ items }">
      <div class="p-2 bg-light">
        <div class="container-fluid">
          <template
            v-for="(item, i) in items
              .filter(d => d.bitmapPosition > MaxPlanBitPosition)
              .sort((a, b) => a.bitmapPosition - b.bitmapPosition)"
            :key="i"
          >
            <div class="row border-bottom py-2">
              <div class="col-5">
                <SpecialMembershipAccessItem
                  :asContainer="false"
                  :item="item"
                  @request-access="viewStore.openSpecialMembershipModal($event)"
                />
              </div>
              <div class="col-2 small text-muted">{{ $n(item.count) }}</div>
              <div class="col-5">
                <ContentItemAccessDimensions
                  :explore-granted="hasMembershipAccess(item)"
                  :transcript-granted="hasMembershipAccess(item)"
                  :facsimile-granted="hasMembershipAccess(item)"
                />
                <ContentItemAccessButton
                  v-if="!hasMembershipAccess(item)"
                  :specialMembershipAccessBitPositions="[item.bitmapPosition]"
                >
                </ContentItemAccessButton>
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>
  </ListOfFindResponseItems>
</template>

<script setup lang="ts">
import { SupportedFiltersByIndex } from '@/logic/filters'
import { Filter } from '@/models'
import { toCanonicalFilter } from '@/logic/filters'
import { computed, ref } from 'vue'
import { searchFacets as searchFacetService } from '@/services'
import ListOfFindResponseItems from '../ListOfFindResponseItems.vue'
import SpecialMembershipAccessItem from '../modules/lists/SpecialMembershipAccessItem.vue'
import { useViewsStore } from '@/stores/views.js'
import ContentItemAccessDimensions from '@/components/ContentItemAccessDimensions.vue'
import type { SpecialMembershipAccess } from '@/services/types'
import ContentItemAccessButton from '../ContentItemAccessButton.vue'
import { MaxPlanBitPosition } from '@/constants'
export type ListOfSpecialMembershipBySearchQueryProps = {
  filters: Filter[]
  userBitmapAsBitmapPositions?: number[]
}

interface MergedBucketSpecialMembershipAccess extends SpecialMembershipAccess {
  permissionExplore: number
  permissionGetTranscript: number
  permissionGetImage: number
}

const props = withDefaults(defineProps<ListOfSpecialMembershipBySearchQueryProps>(), {
  filters: () => [],
  userBitmapAsBitmapPositions: () => []
})

const hasMembershipAccess = (item: MergedBucketSpecialMembershipAccess) =>
  props.userBitmapAsBitmapPositions.includes(item.bitmapPosition)

const viewStore = useViewsStore()
const applyCurrentSearchFilters = ref(true)

const AvailableFacets = ['permissionExplore', 'permissionGetTranscript', 'permissionGetImage']

const dataAccessor = (data: any[]) => {
  if (Array.isArray(data) && data.length !== AvailableFacets.length) {
    return []
  }
  const itemMap = new Map<number, MergedBucketSpecialMembershipAccess>()
  for (const facet of data) {
    for (const bucket of facet.buckets) {
      const { item, count } = bucket
      if (!itemMap.has(item.id)) {
        itemMap.set(item.id, {
          ...item,
          permissionExplore: 0,
          permissionGetTranscript: 0,
          permissionGetImage: 0,
          count
        })
      }
      const existingItem = itemMap.get(item.id)!
      existingItem[facet.facet] = count
    }
  }
  return Array.from(itemMap.values())
}

const paginationAccessor = (data: any[], _pagination: any) => {
  if (Array.isArray(data) && data.length !== AvailableFacets.length) {
    return { total: data.length, offset: 0, limit: 100 }
  }
  return { total: 0, offset: 0, limit: 100 }
}

const currentSearchFilters = computed<Filter[]>(() => {
  const availableFilterTypes = SupportedFiltersByIndex.search
  return props.filters.filter(filter => availableFilterTypes.includes(filter.type as any))
})

const listParams = computed(() => {
  if (applyCurrentSearchFilters.value) {
    return {
      query: {
        facets: AvailableFacets,
        limit: 100,
        filters: currentSearchFilters.value.map(toCanonicalFilter)
      }
    }
  }
  return {
    query: {
      facets: AvailableFacets,
      limit: 100
    }
  }
})
</script>

<i18n lang="json">
{
  "en": {
    "labels": {
      "applyCurrentSearchFilters": "Apply current search filters",
      "noSpecialMembershipPlansFound": "No special membership plans found.",
      "title": "Title",
      "numberOfUsers": "Number of content items",
      "access": "Access"
    }
  }
}
</i18n>
