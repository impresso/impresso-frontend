<template>
  <List
    :items="serviceResponse.data"
    class="ListOfFindResponseItems"
    :paginationList="paginationForList"
    @change-page="paginationChangePageHandler"
    :hidePagination="paginationForList.totalRows < paginationForList.perPage"
  >
    <template #header>
      <slot name="beforeHeader"></slot>
      <slot name="header" :total="serviceResponse.data.length">
        <div class="p-3 d-flex gap-2 justify-content-between align-items-center">
          <h5 class="m-0 font-size-inherit" v-html="props.title"></h5>
        </div>
      </slot>
      <slot name="afterHeader"></slot>
    </template>

    <template #default>
      <div class="p-2" style="min-height: 120px">
        <LoadingBlock v-if="serviceResponse.status === 'loading'" :height="100" />
        <div
          v-if="serviceResponse.status == 'success' && serviceResponse.data.length === 0"
          class="p-3"
        >
          <Alert
            type="info"
            class="border border-info"
            :closable="false"
            v-html="listIsEmptyMessage"
          />
        </div>
        <div v-if="serviceResponse.status === 'error'" class="p-3">
          <Alert type="warning" :closable="false">
            <span v-html="props.errorLoadingItemsMessage"></span>
          </Alert>
        </div>
        <slot :items="serviceResponse.data">
          <p
            v-if="serviceResponse.status == 'success'"
            v-html="
              $tc('numbers.itemsGeneric', serviceResponse.data.length, {
                n: $n(serviceResponse.data.length)
              })
            "
        /></slot>
      </div>
    </template>
  </List>
</template>
<script setup lang="ts">
import { computed, ref, toRaw, watch } from 'vue'
import type { FeathersError } from '@feathersjs/errors'
import List from './modules/lists/List.vue'
import LoadingBlock from './LoadingBlock.vue'
import Alert from 'impresso-ui-components/components/Alert.vue'
import { FeathersService } from '@feathersjs/feathers'
import { ServiceFindParams } from '@/services/types'

/**
 * Extended Feathers service interface that includes a name property
 * for debugging and logging purposes.
 */
interface FeathersServiceWithPath<T> extends FeathersService<T> {
  name?: string
  path?: string
}

export interface ListOfFindResponseItemsProps<T> {
  /**
   * Whether to automatically fetch items when the component becomes visible.
   * Useful for lazy-loading content in tabs or accordions.
   * @default true
   */
  fetchItemsWhenVisible?: boolean

  /**
   * Optional title displayed in the list header.
   * Supports HTML content via v-html.
   * @default ''
   */
  title?: string
  /**
   * Feathers service query parameters for filtering, pagination. Sorting can be added here,
   * but it's recommended to use the 'orderBy' prop for that, you'll get extra dropdown options.
   *
   * @default { query: { limit: 5, offset: 0 } }
   * @example
   * {
   *   query: {
   *     status: 'active',
   *     limit: 20,
   *     offset: 0,
   *   }
   * }
   */
  params?: ServiceFindParams
  /**
   * Default order by field for the list. Make sure this field is supported by the service.
   */
  orderBy?: string
  /**
   * Function returning available sort options for the list.
   * Each option should have 'label' and 'value' properties.
   */
  orderByOptions?: { label: string; value: string }[]
  /**
   * Custom messages for common cases
   */
  errorLoadingItemsMessage?: string
  listIsEmptyMessage?: string
  /**
   * The Feathers service to fetch data from.
   * Must include a 'name' property for logging.
   * @required
   */
  service: FeathersServiceWithPath<T>
}

const props = withDefaults(defineProps<ListOfFindResponseItemsProps<any>>(), {
  fetchItemsWhenVisible: true,
  // orderBy: 'dateCreated',
  // orderByOptions: () => [
  //   { label: 'Date Created', value: 'dateCreated' },
  //   { label: 'Date Last Modified', value: 'dateLastModified' }
  // ],
  title: '',
  errorLoadingItemsMessage: 'errorLoadingItems',
  listIsEmptyMessage: 'listIsEmpty',
  params: () => ({
    query: {
      limit: 5,
      offset: 0
    }
  })
})
/** Current sort order selection */
// const orderByModel = ref<string | undefined>(props.orderBy!)
const error = ref<FeathersError | null>(null)

const serviceResponse = ref<{
  data: any[]
  pagination: { total: number; offset: number; limit: number }
  status: 'idle' | 'loading' | 'success' | 'error'
}>({
  status: 'idle',
  pagination: {
    total: 0,
    offset: props.params?.query?.offset ?? 0,
    limit: props.params?.query?.limit ?? 5
  },
  data: []
})

const paginationForList = computed(() => {
  return {
    perPage: serviceResponse.value.pagination.limit,
    currentPage:
      Math.floor(serviceResponse.value.pagination.offset / serviceResponse.value.pagination.limit) +
      1,
    totalRows: serviceResponse.value.pagination.total
  }
})

const paginationChangePageHandler = (newPage: number) => {
  console.debug('[ListOfFindResponseItems] paginationChangePageHandler', newPage)
  const newOffset = (newPage - 1) * serviceResponse.value.pagination.limit
  serviceResponse.value.pagination = {
    ...serviceResponse.value.pagination,
    offset: newOffset
  }
  fetchFindMethod()
}

const fetchFindMethod = async () => {
  console.debug('[ListOfFindResponseItems] fetchFindMethod', props.service.path)

  serviceResponse.value = {
    data: [],
    status: 'loading',
    pagination: serviceResponse.value.pagination
  }
  const service = toRaw(props.service)
  // fetch user requests
  service
    .find({
      ...props.params,
      query: {
        ...props.params?.query,
        offset: serviceResponse.value.pagination.offset,
        limit: serviceResponse.value.pagination.limit
        // $sort: orderByModel.value ? { [orderByModel.value]: -1 } : undefined
      }
    })
    .then(({ data, pagination }) => {
      console.info('[ListOfFindResponseItems] @success', props.service.path)
      serviceResponse.value = { data, status: 'success', pagination }
    })
    .catch((err: FeathersError) => {
      console.error('[ListOfFindResponseItems] Error', err.message, err.data, err.code)
      error.value = err
      serviceResponse.value = {
        data: [],
        status: 'error',
        pagination: serviceResponse.value.pagination
      }
    })
}

/**
 * Watch for visibility changes to trigger lazy loading.
 * When fetchItemsWhenVisible becomes true and status is idle,
 * automatically fetch the data.
 */
watch(
  () => props.fetchItemsWhenVisible,
  v => {
    if (v && serviceResponse.value.status === 'idle') {
      error.value = null
      serviceResponse.value = {
        data: [],
        status: 'loading',
        pagination: serviceResponse.value.pagination
      }
      console.debug(
        '[ListOfFindResponseItems] @fetchItemsWhenVisible is true, fetching:',
        props.service.path
      )
      fetchFindMethod()
    }
  },
  { immediate: true }
)

watch(
  () => props.service.path || props.service.name,
  () => {
    console.debug(
      '[ListOfFindResponseItems] Service ID changed, refetching:',
      props.service.path || props.service.name
    )
    fetchFindMethod()
  }
)
</script>
