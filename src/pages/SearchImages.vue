<template>
  <i-layout class="search-images">
    <search-sidebar
      width="400px"
      :filters="availableFiltersWithItems"
      :ignored-filter-types="ignoredFilterTypes"
      :facets="facets"
      contextTag="images"
      @changed="handleFiltersChanged"
    >
      <template v-slot:header>
        <div
          v-if="similarToImage"
          class="ImageItemSimilar p-1 mb-3 bg-white rounded drop-shadow d-flex gap-3"
        >
          <div class="flex-shrink-1">
            <auth-img
              class="h-100"
              v-if="similarToImage.previewUrl"
              :src="similarToImage.previewUrl"
            />
          </div>
          <div class="align-self-between">
            <span class="very-small-caps">{{ $t('similar_to_image') }}</span>
            <media-source-label
              :item="{
                id: similarToImage.mediaSourceRef?.id || '',
                name: similarToImage.mediaSourceRef?.name || '',
                type: 'newspaper'
              }"
            ></media-source-label>

            <p v-if="similarToImage.date" class="small m-0">
              {{ $d(similarToImage.date, 'long') }}
              <span class="text-nowrap">
                &mdash;
                {{
                  similarToImage.pageNumbers
                    ? $t('pageNumber', { n: similarToImage.pageNumbers.join(', ') })
                    : ''
                }}
              </span>
            </p>
          </div>
          <div class="flex-shrink-1 ml-auto">
            <button
              class="ImageItemSimilar__remove btn btn-transparent"
              @click.prevent="onRemoveSimilarTo"
            >
              <icon name="cross" />
            </button>
          </div>
        </div>
        <filter-image-upload v-if="enableUpload" />
        <search-input @submit="onSearchQuery" />
      </template>
      <b-form-group class="mx-3">
        <b-form-checkbox v-model="isFront" switch>
          {{ $t('label.isFront') }}
        </b-form-checkbox>
      </b-form-group>
    </search-sidebar>

    <i-layout-section main>
      <template v-slot:header>
        <b-navbar type="light" variant="light" class="border-bottom px-0 py-0">
          <b-navbar-nav class="p-2 border-right">
            <li class="form-inline">
              <form class="form-inline">
                <b-button size="sm" variant="outline-primary" @click="loadRandomPage">
                  {{ $t('actions.loadRandomPage') }}
                </b-button>
              </form>
            </li>
          </b-navbar-nav>
        </b-navbar>
        <b-navbar type="light" variant="light" class="border-bottom py-0 px-3">
          <b-navbar-nav class="border-right flex-grow-1 py-2">
            <ellipsis v-if="!isLoading" :initialHeight="60">
              <search-results-summary
                group-by="images"
                :searchQuery="{ filters: availableFiltersWithItems }"
                :totalRows="paginationTotalRows"
              />
            </ellipsis>
            <span v-else>{{ $t('actions.loading') }}</span>
          </b-navbar-nav>
          <b-navbar-nav class="ml-auto pl-2 align-items-center" v-if="!similarToImage">
            <label class="mr-1 mb-0 text-nowrap">{{ $t('label_order') }}</label>
            <i-dropdown
              v-model="orderBy"
              :options="translatedOrderByOptions"
              size="sm"
              variant="outline-primary"
              class="pl-1"
            />
          </b-navbar-nav>
          <b-navbar-nav class="ml-auto pl-2 align-items-center" v-else>
            <label class="mr-1 mb-0 text-nowrap">{{ $t('label_order') }}</label>
            <b class="small-caps font-weight-bold">{{ $t('sort_by_similarity') }}</b>
          </b-navbar-nav>
        </b-navbar>
      </template>

      <div class="p-1 my-2">
        <div class="card-group row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4">
          <div class="mb-3" v-for="searchResult in searchResults" :key="searchResult.id">
            <search-results-image-item
              class="mx-1"
              :item="searchResult"
              :enable-checkbox="false"
              :enable-similar-to="enableSimilarTo"
              :isChecked="isChecked(searchResult)"
              :userPlan="userPlan"
              @toggleSelected="toggleSelected"
              @click:search="onClickSearch"
            />
          </div>
        </div>
        <div
          v-if="paginationTotalRows && paginationCurrentPage > 0"
          class="fixed-pagination-footer p-1 m-0"
        >
          <pagination
            :perPage="paginationPerPage"
            :current-page="paginationCurrentPage"
            :totalRows="paginationTotalRows"
            class="float-left small-caps"
            @change="(p: number) => (paginationCurrentPage = p)"
          />
        </div>
      </div>
    </i-layout-section>
  </i-layout>
</template>

<i18n lang="json">
{
  "en": {
    "similar_to_image": "Similar to this image",
    "label_order": "Order By",
    "sort_by_similarity": "Similarity",
    "sort_date": "Date",
    "sort_asc": "ascending",
    "sort_desc": "descending"
  }
}
</i18n>

<script setup lang="ts">
import { computed, nextTick, ref, watch, getCurrentInstance } from 'vue'
import type { ComponentCustomProperties } from 'vue'
import { useRoute } from 'vue-router'

import AuthImg from '@/components/AuthImg.vue'
import FilterImageUpload from '@/components/modules/FilterImageUpload.vue'
import SearchResultsImageItem from '@/components/modules/SearchResultsImageItem.vue'
import Pagination from '@/components/modules/Pagination.vue'
import SearchSidebar from '@/components/modules/SearchSidebar.vue'
import SearchResultsSummary from '@/components/modules/SearchResultsSummary.vue'
import Ellipsis from '@/components/modules/Ellipsis.vue'
import SearchInput from '@/components/modules/SearchInput.vue'

import { searchQueryGetter, searchQuerySetter } from '@/logic/queryParams'
import { FacetsByContext, serializeFilters, SupportedFiltersByContext } from '@/logic/filters'
import { buildEmptyFacets } from '@/logic/facets'
import {
  images as imagesService,
  searchFacetsImages as searchFacetsImagesService
} from '@/services'
import FilterFactory from '@/models/FilterFactory'
import SearchQuery from '@/models/SearchQuery'
import FacetModel from '@/models/Facet'
import { useUserStore } from '@/stores/user'
import { Navigation } from '@/plugins/Navigation'
import type { IImage, Filter, FilterType, FacetType } from '@/models'
import { includes } from '@/util/fn'
import Icon from '@/components/base/Icon.vue'
import MediaSourceLabel from '@/components/modules/lists/MediaSourceLabel.vue'

const AllowedFilterTypes = SupportedFiltersByContext.images
const AllowedFacetTypes = FacetsByContext.images

const MIN_LIMIT = 12
const MAX_LIMIT = 50
const DEFAULT_LIMIT = 12
const DEFAULT_ORDER_BY = '-date'

export interface SearchImagesProps {
  enableUpload?: boolean
  enableSimilarTo?: boolean
  filtersWithItems?: Filter[]
}

const props = withDefaults(defineProps<SearchImagesProps>(), {
  enableUpload: false,
  enableSimilarTo: true,
  filtersWithItems: () => []
})

const proxy = getCurrentInstance()!.proxy as ComponentCustomProperties
const route = useRoute()
const userStore = useUserStore()
const emit = defineEmits<{
  (e: 'filters-changed', newFilters: Filter[]): void
}>()
/**
 * `searchQueryGetter` / `searchQuerySetter` in `@/logic/queryParams` are
 * legacy Options-API helpers that expect `this.$route`, `this.$navigation`
 * and `this.$nextTick`. `queryParamsCtx` adapts the current instance so those
 * functions can still be called via `.call(queryParamsCtx, …)`.
 * When the legacy module is later migrated to a proper composable this
 * adapter can be removed.
 */
const queryParamsCtx: Record<string, unknown> = {}
Object.defineProperties(queryParamsCtx, {
  $route: { get: () => proxy.$route, enumerable: true },
  $router: { get: () => proxy.$router, enumerable: true },
  $navigation: { get: () => new Navigation(proxy), enumerable: true },
  $nextTick: { value: nextTick, enumerable: true }
})

const isLoading = ref(false)
const selectedItems = ref<IImage[]>([])
const similarToImage = ref<IImage | null>(null)
const searchResults = ref<IImage[]>([])
const paginationTotalRows = ref(0)
const facets = ref<FacetModel[]>(buildEmptyFacets(AllowedFacetTypes) as FacetModel[])

const userPlan = computed(() => userStore.userPlan)

const sqGet = searchQueryGetter().get as (this: unknown) => SearchQuery
const sqSet = searchQuerySetter({
  additionalQueryParams: { p: 1 as unknown as string }
}).set as (this: unknown, sq: SearchQuery) => void

const searchQuery = computed<SearchQuery>({
  get: () => sqGet.call(queryParamsCtx),
  set: (value: SearchQuery) => sqSet.call(queryParamsCtx, value)
})

const seed = computed(() => route.query.seed ?? 0)

const ignoredFilters = computed<Filter[]>(() =>
  props.filtersWithItems.filter(({ type }) => !includes(AllowedFilterTypes, type))
)

const ignoredFilterTypes = computed<FilterType[]>(() =>
  ignoredFilters.value.map(({ type }) => type)
)

const availableFiltersWithItems = computed<Filter[]>(() =>
  props.filtersWithItems.filter(({ type }) => includes(AllowedFilterTypes, type))
)

function firstQueryValue(value: unknown, fallback: string): string {
  if (Array.isArray(value)) return (value[0] as string | undefined) ?? fallback
  if (typeof value === 'string') return value
  return fallback
}

const similarToImageId = computed<string>({
  get() {
    return firstQueryValue(route.query.similarTo, '')
  },
  set(similarTo) {
    const qp: Record<string, unknown> = { p: 1, similarTo: null }
    if (similarTo && similarTo.length) qp.similarTo = similarTo
    new Navigation(proxy).updateQueryParametersWithHistory(qp)
  }
})

const isFront = computed<boolean>({
  get() {
    return availableFiltersWithItems.value.some(({ type }) => type === 'isFront')
  },
  set(value) {
    handleFiltersChanged(
      availableFiltersWithItems.value
        .filter(d => d.type !== 'isFront')
        .concat(value ? [FilterFactory.create({ type: 'isFront' })] : [])
    )
  }
})

interface OrderByOptionSpec {
  value: string
  textKey: string
  suffixKey: string
}

const orderByOptions: OrderByOptionSpec[] = [
  { value: '-date', textKey: 'sort_date', suffixKey: 'sort_desc' },
  { value: 'date', textKey: 'sort_date', suffixKey: 'sort_asc' }
]

/**
 * `i-dropdown` accepts `{ value, text }[]`, so the labels have to be
 * resolved eagerly. `proxy.$t` is used here (rather than `useI18n`) to keep
 * setup free of the `useI18n` hook per project conventions.
 */
const translatedOrderByOptions = computed(() =>
  orderByOptions.map(o => ({
    value: o.value,
    text: `${proxy.$t(o.textKey)} ${proxy.$t(o.suffixKey)}`
  }))
)

const orderBy = computed<string>({
  get() {
    return firstQueryValue(route.query.orderBy, DEFAULT_ORDER_BY)
  },
  set(value) {
    new Navigation(proxy).updateQueryParametersWithHistory({ orderBy: value })
  }
})

const paginationCurrentPage = computed<number>({
  get() {
    const parsed = parseInt(String(route.query.p ?? 0), 10)
    return isNaN(parsed) ? 0 : parsed
  },
  set(page) {
    new Navigation(proxy).updateQueryParametersWithHistory({
      p: isNaN(page) ? 1 : page
    })
  }
})

const paginationPerPage = computed<number>({
  get() {
    const parsed = parseInt(String(route.query.limit ?? DEFAULT_LIMIT), 10)
    const value = isNaN(parsed) ? DEFAULT_LIMIT : parsed
    return Math.min(MAX_LIMIT, Math.max(value, MIN_LIMIT))
  },
  set(limit) {
    new Navigation(proxy).updateQueryParametersWithHistory({ limit })
  }
})

/**
 * The aggregated inputs used to fetch results. Watching this triggers a
 * single request whenever any of the inputs change.
 */
const serviceQuery = computed(() => ({
  seed: seed.value,
  similarTo: similarToImageId.value,
  filters: availableFiltersWithItems.value,
  orderBy: orderBy.value,
  limit: paginationPerPage.value,
  page: paginationCurrentPage.value
}))

function handleFiltersChanged(newFilters: Filter[]) {
  emit('filters-changed', newFilters)
  // searchQuery.value = new SearchQuery({
  //   filters: newFilters.concat(ignoredFilters.value)
  // })
}

function toggleSelected(item: IImage) {
  const idx = selectedItems.value.findIndex(c => c.id === item.id)
  if (idx === -1) selectedItems.value.push(item)
  else selectedItems.value.splice(idx, 1)
}

function isChecked(item: IImage): boolean {
  return selectedItems.value.some(c => c.id === item.id)
}

function onClickSearch(image: IImage) {
  similarToImageId.value = image.id
}

function onRemoveSimilarTo() {
  similarToImageId.value = ''
}

function onSearchQuery({ q = '' }: { q?: string }) {
  handleFiltersChanged(
    availableFiltersWithItems.value.concat(
      q.trim().length ? [FilterFactory.create({ type: 'title', q })] : []
    )
  )
}

function loadRandomPage() {
  new Navigation(proxy).updateQueryParametersWithHistory({ p: 0 })
}

async function fetchSearchResults() {
  isLoading.value = true
  try {
    const q = serviceQuery.value
    const serializedFilters = serializeFilters(q.filters)
    const query: Record<string, unknown> = {
      filters: serializedFilters,
      order_by: q.orderBy,
      limit: q.limit
    }
    if (q.page > 0) query.offset = (q.page - 1) * q.limit
    if (q.similarTo) query.similar_to_image_id = q.similarTo

    const [imagesRes, facetsRes] = await Promise.all([
      imagesService.find({ query }),
      searchFacetsImagesService.find({
        query: {
          filters: serializedFilters,
          facets: AllowedFacetTypes
        }
      })
    ])

    paginationTotalRows.value = imagesRes.pagination.total
    searchResults.value = imagesRes.data
    paginationCurrentPage.value =
      Math.round(imagesRes.pagination.offset / imagesRes.pagination.limit) + 1
    facets.value = (facetsRes.data as unknown[]).map(f => new FacetModel(f as never))
  } finally {
    isLoading.value = false
  }
}

async function fetchSimilarToImage(id: string) {
  if (!id) {
    similarToImage.value = null
    return
  }
  const res = await imagesService.get(id)
  similarToImage.value = res as IImage
}

watch(similarToImageId, id => fetchSimilarToImage(id), { immediate: true })
watch(serviceQuery, fetchSearchResults, { immediate: true })
</script>

<style>
button.ImageItemSimilar__remove {
  height: 2rem;
  width: 2rem;
  padding: 0;
  line-height: 2rem;
}
.ImageItemSimilar img {
  height: 100%;
  min-height: 100px;
  max-height: 200px;
  width: 100px;
  overflow: hidden;
  object-fit: cover;
  border-top-left-radius: 0.35rem;
  border-bottom-left-radius: 0.35rem;
  border-top-right-radius: 0.15rem;
  border-bottom-right-radius: 0.15rem;
}
</style>
