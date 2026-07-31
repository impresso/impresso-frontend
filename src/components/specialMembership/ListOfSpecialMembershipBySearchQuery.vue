<template>
  <ListOfFindResponseItems
    :service="searchFacetService"
    :params="listParams"
    :list-is-empty-message="$t('no_media_sources')"
    :error-loading-items-message="$t('error_loading')"
    :data-accessor="dataAccessor"
    :pagination-accessor="paginationAccessor"
  >
    <template #header="{ total }">
      <div class="container-fluid">
        <div class="row">
          <div class="col-12 d-flex gap-3 align-items-center py-2">
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
      </div>
    </template>
    <template #default="{ items }">
      {{ userBitmapAsBitmapPositions }}
      <div class="container-fluid">
        <div v-for="(item, i) in items" :key="i" class="row border-bottom py-2">
          <div class="col-1 small text-muted">{{ i + 1 }}</div>
          <div class="col-5">
            <SpecialMembershipAccessItem
              :asContainer="false"
              :item="item"
              @request-access="viewStore.openSpecialMembershipModal($event)"
            />
          </div>
          <div class="col-6">
            <ContentItemAccessBadge
              label="label"
              description="description"
              :granted="userBitmapAsBitmapPositions.includes(item.bitmapPosition)"
            ></ContentItemAccessBadge>
            <ContentItemAccessButton
              v-if="!userBitmapAsBitmapPositions.includes(item.bitmapPosition)"
              :specialMembershipAccessBitPositions="[item.bitmapPosition]"
            >
            </ContentItemAccessButton>
          </div>
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
import ContentItemAccessBadge from '../ContentItemAccessBadge.vue'
import type { SpecialMembershipAccess } from '@/services/types'
import ContentItemAccessButton from '../ContentItemAccessButton.vue'

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
          permissionGetImage: 0
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
      "applyCurrentSearchFilters": "Apply current search filters"
    }
  }
}
</i18n>
