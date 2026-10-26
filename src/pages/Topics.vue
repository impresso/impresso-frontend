<template lang="html">
  <i-layout id="TopicsPage">
    <i-layout-section collapsible width="380px">
      <template #header>
        <ul class="nav nav-pills mx-2 mt-1">
          <li class="nav-item active">
            <span class="nav-link">
              {{ $t('topics') }}
            </span>
          </li>
        </ul>
      </template>
      <ListOfFindResponseItems
        :service="topicsService"
        :params="listParams"
        :list-is-empty-message="$t('no_topics')"
        :error-loading-items-message="$t('error_loading_topics')"
        @items-rendered="onItemsRendered"
        :paginationAccessor="paginationAccessor"
      >
        <template #header="{ isLoading, total }">
          <div class="p-3">
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
          </div>
          <div class="d-flex justify-content-between align-items-center px-3 pb-3">
            <h5
              class="m-0 font-size-inherit"
              v-html="
                $t(
                  'numbers.topics',
                  { n: $n(listPagination.total || 0) },
                  listPagination.total || 0
                )
              "
            ></h5>
            <b-dropdown v-if="shouldDisplayOrderBy" size="sm" variant="outline-primary" right>
              <template #button-content>
                {{ $t(`sort_${orderBy}`) }}
              </template>
              <b-dropdown-item
                v-for="value in orderByOptions"
                :key="value"
                @click="orderBy = value"
              >
                {{ $t(`sort_${value}`) }}
              </b-dropdown-item>
            </b-dropdown>
          </div>
        </template>
        <template #default="{ items = [] }">
          <div>
            <TopicItem
              v-for="item in items"
              :key="item.id"
              :topic="item"
              :term="searchQuery"
              class="m-3 p-2 rounded-md border shadow-sm mb-4"
              :class="{ 'border-dark': item.id === route.params.topic_id }"
              show-category
              show-representative-terms
            />
          </div>
        </template>
      </ListOfFindResponseItems>
    </i-layout-section>
    <router-view />
  </i-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { topics as topicsService } from '@/services'
import ListOfFindResponseItems from '@/components/ListOfFindResponseItems.vue'
import SearchInput from '@/components/modules/SearchInput.vue'
import TopicItem from '@/components/topics/TopicItem.vue'
import type { GenericListPagination } from '@/components/ListOfFindResponseItems.vue'

const route = useRoute()
const orderByOptions = ['name', '-name', 'model', '-model']
const orderBy = ref('name')
const searchQuery = ref('')

const shouldDisplayOrderBy = ref(false)

const listPagination = ref<GenericListPagination>({
  limit: 10,
  offset: 0,
  total: 0
})
const onItemsRendered = (_items: any[], pagination: GenericListPagination) => {
  listPagination.value = pagination
}

const paginationAccessor = (_data: any, _pagination: any, response: any) => {
  console.log('paginationAccessor', response)
  return {
    limit: response.limit,
    offset: response.offset,
    total: response.total
  }
}
const listParams = computed(() => {
  console.log('listParams', orderBy.value, searchQuery.value)
  return {
    query: {
      limit: 50,
      includePublic: true,
      order_by: orderBy.value,
      q: searchQuery.value || undefined
    }
  }
})

function onSearchQuery({ q }: { q: string }) {
  searchQuery.value = q
}
</script>

<i18n lang="json">
{
  "en": {
    "topics": "Topics",
    "searchPlaceholder": "search in {total} topics ...",
    "searchPlaceholderLoading": "searching ...",
    "no_topics": "No topics found",
    "error_loading_topics": "Unable to load topics",
    "sort_name": "order by name, A-Z",
    "sort_-name": "order by name, Z-A",
    "sort_count": "order by number of articles, low to high",
    "sort_-count": "order by number of articles, high to low",
    "numbers": {
      "topics": "no topics | {n} topic | {n} topics"
    }
  }
}
</i18n>
