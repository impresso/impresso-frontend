<template>
  <div class="TextReuseClusterMonitor position-relative">
    <List
      :paginationList="pagination"
      @change-page="changePage"
      :items="items"
      class="position-absolute h-100 w-100"
    >
      <template v-slot:header>
        <div class="d-flex p-2 align-items-center mt-2">
          <h4
            class="font-size-inherit sans m-0 px-2"
            v-html="
              isLoading
                ? $t('loading')
                : $t('numbers.passages', {
                    n: totalItems
                  })
            "
          ></h4>
          <i-dropdown
            v-model="orderBy"
            :options="
              orderByOptions.map(value => ({
                value,
                text: $t(`sort_${value}`)
              }))
            "
            class="mr-auto"
            size="sm"
            variant="outline-primary"
          ></i-dropdown>
        </div>
      </template>
      <template v-slot:default>
        <div class="container-fluid">
          <div class="row">
            <div class="col-6" v-for="passage in items" :key="passage.id">
              <TextReusePassageItem
                hideCompareButton
                :item="passage"
                class="m-0 mb-3 pb-3 border-bottom"
              />
            </div>
          </div>
        </div>
      </template>
    </List>
  </div>
</template>
<script setup lang="ts">
import type { Filter, FilterInterface, TextReuseCluster } from '@/models'
import { computed, defineProps, onMounted, ref, watch, withDefaults } from 'vue'
import { textReusePassages as textReusePassageService } from '@/services'
import TextReusePassage from '@/models/TextReusePassage'
import List from './modules/lists/List.vue'
import TextReusePassageItem from './modules/lists/TextReusePassageItem.vue'
/**
 * @name TextReuseClusterMonitor
 * @component
 * @description
 * <TextReuseClusterMonitor
 *   :filters="applyCurrentSearchFilters ? monitorFilters : []"
 *   :item="monitor.item"
 *   v-if="monitor.type === 'textReuseCluster'"
 *   class="flex-grow-1 bg-dark"
 * />
 */
export interface Props {
  item: TextReuseCluster
  filters: Filter[] | FilterInterface[]
  orderByOptions: string[]
}

const props = withDefaults(defineProps<Props>(), {
  item: null,
  filters: () => [],
  orderByOptions: () => ['date', '-date', 'size', '-size']
})

const totalItems = ref<number>(-1)
const items = ref<TextReusePassage[]>([])
const orderBy = ref<string>('-date')
const limit = ref<number>(10)
const offset = ref<number>(0)
const isLoading = ref<boolean>(false)

const shouldUseSearchFilters = ref<boolean>(false)

const pagination = computed(() => ({
  totalRows: totalItems.value,
  currentPage: offset.value / limit.value + 1,
  perPage: limit.value
}))

const changePage = (page: number) => {
  offset.value = (page - 1) * limit.value
  loadPassages()
}

const query = computed(() => {
  return {
    filters: shouldUseSearchFilters.value ? props.filters : [],
    offset: offset.value,
    limit: limit.value,
    order_by: orderBy.value
  }
})

watch(orderBy, () => loadPassages())
watch(
  () => props.item?.id,
  () => loadPassages()
)
watch(
  () => props.filters,
  () => loadPassages(),
  { deep: true }
)

const loadPassages = async () => {
  const filters = shouldUseSearchFilters.value ? props.filters : []
  isLoading.value = true
  const { data, total } = await textReusePassageService.find({
    query: {
      filters: filters.concat([{ type: 'textReuseCluster', q: props.item.id }]),
      offset: offset.value,
      limit: limit.value,
      order_by: orderBy.value
    }
  })
  totalItems.value = total
  items.value = data
  isLoading.value = false
}

onMounted(async () => {
  await loadPassages()
})
</script>

<style lang="css"></style>
<i18n>
  {
    "en": {

      "sort_date": "Sort by date",
      "sort_-date": "Sort by date (desc)",
      "sort_size": "Sort by size",
      "sort_-size": "Sort by size (desc)"
    }
  }
</i18n>
