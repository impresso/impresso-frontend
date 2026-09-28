<template>
  <i-layout>
    <i-layout-section width="350px">
      <template v-slot:header>
        <ul class="nav nav-pills mx-2 mt-2">
          <li class="nav-item active">
            <router-link
              :to="{
                name: Routes.collections.children.overview.name
              }"
              exact-active-class="active"
              active-class=""
              class="nav-link"
            >
              {{ $t('collections') }}
            </router-link>
          </li>
        </ul>
      </template>
      <template v-slot:default>
        <ListOfFindResponseItems
          :service="collectionsService"
          :params="listParams"
          :list-is-empty-message="$t('no collections')"
          :error-loading-items-message="$t('error loading collections')"
          @items-rendered="onItemsRendered"
        >
          <template #header="{ total, isLoading }">
            <div class="my-3 mx-3">
              <SearchInput
                @submit="onSearchQuery"
                :disabled="isLoading"
                :placeholder="
                  $t(
                    isLoading ? 'searchPlaceholderLoading' : 'searchPlaceholder',
                    { isLoading: isLoading, total: total },
                    total
                  )
                "
              />
              <div class="d-flex align-items-center justify-content-between mt-2">
                <div
                  class="text-muted"
                  v-html="$t('numbers.collections', { n: $n(total) }, total)"
                ></div>

                <i-dropdown
                  right
                  v-model="orderBy"
                  :options="
                    orderByOptions.map(value => ({
                      value,
                      text: $t(`label_sort_${value}`)
                    }))
                  "
                  size="sm"
                  variant="outline-tertiary"
                ></i-dropdown>
              </div>
            </div>
          </template>
          <template #default="{ items, isSuccess }">
            <div class="pb-5">
              <div
                v-for="item in items"
                :key="item.id"
                class="m-3 p-2 rounded-md border shadow-sm mb-4"
              >
                <CollectionItem :item="item" showIcon showDescription showLink showId />
              </div>
            </div>
          </template>
        </ListOfFindResponseItems>
      </template>
    </i-layout-section>
    <router-view />
  </i-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { collections as collectionsService } from '../services'

import { Routes } from '../router/routes'
import CollectionItem from '../components/modules/lists/CollectionItem.vue'

import ListOfFindResponseItems from '../components/ListOfFindResponseItems.vue'
import type { GenericListPagination } from '../components/ListOfFindResponseItems.vue'
import SearchInput from '@/components/modules/SearchInput.vue'

const orderBy = ref('-date')
const orderByOptions = ['date', '-date', 'creationDate', '-creationDate']
const searchTerm = ref('')

const listParams = computed(() => {
  console.debug(
    'Computed listParams with searchTerm:',
    searchTerm.value,
    'and orderBy:',
    orderBy.value
  )
  if (searchTerm.value.trim() !== '') {
    return {
      query: {
        limit: 10,
        term: searchTerm.value.trim(),
        order_by: orderBy.value
      }
    }
  }
  return {
    query: {
      limit: 10,
      order_by: orderBy.value
    }
  }
})

const listPagination = ref<GenericListPagination>({
  limit: 10,
  offset: 0,
  total: 0
})

const onItemsRendered = (_items: any[], pagination: GenericListPagination) => {
  listPagination.value = pagination
}
const onSearchQuery = ({ q: query }) => {
  console.log('Search query:', query)
  searchTerm.value = query
  // Implement your search logic here, e.g., update listParams with the search query
}
</script>

<style scoped lang="less"></style>

<i18n lang="json">
{
  "en": {
    "collections": "collections",
    "searchPlaceholder": "search in {total} collections ...",
    "searchPlaceholderLoading": "searching ...",
    "label_sort_date": "sort by date ↑",
    "label_sort_creationDate": "sort by creation date ↑ ",
    "label_sort_-date": "sort by date ↓",
    "label_sort_-creationDate": "sort by creation date ↓"
  }
}
</i18n>
