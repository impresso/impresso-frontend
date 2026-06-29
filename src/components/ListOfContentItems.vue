<template>
  <ListOfFindResponseItems
    ref="listOfFindResponseItemsRef"
    :service="contentItemService"
    :params="listParams"
    :fetch-items-when-visible="props.fetchItemsWhenVisible"
    :title="props.title"
    :error-loading-items-message="props.errorLoadingItemsMessage"
    :list-is-empty-message="props.listIsEmptyMessage"
    :items-class="props.itemsClass"
    @items-rendered="handleItemsRendered"
  >
    <template v-slot:header="{ total }">
      <div class="container-xxl d-flex align-items-center justify-content-between gap-3 py-2">
        <div v-html="$t('numbers.contentItems', { n: $n(total) }, total)"></div>
        <div class="d-flex align-items-center gap-2">
          <div class="small-caps">{{ $t('sortBy') }}</div>
          <i-dropdown
            v-model="orderBy"
            :options="
              orderByOptions.map(value => ({
                value,
                text: $t(`label_sort_${value}`)
              }))
            "
            class="mr-auto"
            size="sm"
            variant="outline-tertiary"
          ></i-dropdown>
        </div>
      </div>
    </template>
    <template #loading="{ isLoading }">
      <div class="container-xxl" v-if="isLoading">
        <div ref="itemsContainerRef" class="row my-4">
          <div :class="props.eachItemClass" v-for="n in 12" :key="n" class="mb-4">
            <LoadingBlock :height="200" :animation-delay="n * 0.1" />
          </div>
        </div>
      </div>
    </template>
    <template #default="{ items, isSuccess }">
      <slot v-bind="{ items, isSuccess }">
        <div class="container-xxl">
          <div ref="itemsContainerRef" class="row my-4">
            <div class="col-12" v-if="items.length === 0 && isSuccess">
              <Alert type="info" class="border border-info" :closable="false">
                <span v-html="props.listIsEmptyMessage"></span>
              </Alert>
            </div>
            <div v-for="item in items" :key="item.id" :class="props.eachItemClass">
              <ContentItem
                :contentItem="item"
                class="p-2 rounded-md border shadow-sm mb-4"
                showDate
                showMediaSource
                showLink
                showIcon
                showMeta
                showSnippet
                showSemanticEnrichments
                showProvider
                showType
                showOcrQuality
              />
            </div>
          </div>
        </div>
      </slot>
    </template>
  </ListOfFindResponseItems>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Filter } from '@/models'
import { contentItems as contentItemService } from '@/services'
import type { ServiceFindParams } from '@/services/types'
import ListOfFindResponseItems from '@/components/ListOfFindResponseItems.vue'
import type { ListOfFindResponseItemsExposed } from '@/components/ListOfFindResponseItems.vue'
import ContentItem from './modules/lists/ContentItem.vue'
import Alert from './Alert.vue'
import LoadingBlock from './LoadingBlock.vue'

export interface ListOfContentItemsProps {
  listFilters: Filter[]
  fetchItemsWhenVisible?: boolean
  title?: string
  errorLoadingItemsMessage?: string
  listIsEmptyMessage?: string
  itemsClass?: string
  eachItemClass?: string
}

const props = withDefaults(defineProps<ListOfContentItemsProps>(), {
  fetchItemsWhenVisible: true,
  title: 'zzz',
  errorLoadingItemsMessage: 'errorLoadingItems',
  listIsEmptyMessage: 'listIsEmpty',
  itemsClass: 'p2',
  eachItemClass: 'col-md-6 col-lg-4 ',
  listFilters: () => []
})

const emit = defineEmits<{
  'items-rendered': [items: any[]]
}>()

const orderBy = ref('-date')
const orderByOptions = ['date', '-date', 'ocrQuality', '-ocrQuality']

const listOfFindResponseItemsRef = ref<ListOfFindResponseItemsExposed | null>(null)

const listParams = computed<ServiceFindParams>(() => ({
  query: {
    limit: 12,
    filters: [...props.listFilters],
    order_by: orderBy.value
  }
}))

const handleItemsRendered = (items: any[]) => {
  emit('items-rendered', items)
}

const refresh = async () => {
  await listOfFindResponseItemsRef.value?.refresh()
}

const refreshFromFirstPage = async () => {
  await listOfFindResponseItemsRef.value?.refreshFromFirstPage()
}

defineExpose({
  refresh,
  refreshFromFirstPage
})
</script>
