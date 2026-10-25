<template lang="html">
  <i-layout id="TopicsPage">
    <i-layout-section collapsible width="auto">
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
      >
        <template #header="{ total, isLoading }">
          <div class="p-3">
            <form @submit.prevent="handleSubmitSuggestionQuery">
              <div class="input-group">
                <b-form-input
                  v-model.trim="suggestionQuery"
                  class="border border-dark"
                  :style="{
                    'border-top-left-radius': 'var(--border-radius-sm)',
                    'border-bottom-left-radius': 'var(--border-radius-sm)',
                    'background-color': 'transparent',
                    'box-shadow': 'var(--bs-box-shadow-sm)',
                    color: 'var(--impresso-color-black)'
                  }"
                  :placeholder="$t('label_filter_topics')"
                />
                <div class="input-group-append">
                  <button
                    type="button"
                    class="btn btn-outline-primary"
                    :title="$t('placeholder.search')"
                    :disabled="isLoading"
                    @click="handleSubmitSuggestionQuery"
                  >
                    search
                  </button>
                </div>
              </div>
            </form>
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
            {{ listPagination.total }}
            <b-dropdown size="sm" variant="outline-primary" right>
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
              class="m-3 p-2 rounded-md border shadow-sm mb-4"
              :class="{ 'border-dark': item.id === route.params.topic_id }"
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
import TopicItem from '@/components/topics/TopicItem.vue'
import type { GenericListPagination } from '@/components/ListOfFindResponseItems.vue'
const route = useRoute()
const orderByOptions = ['name', '-name', 'count', '-count']
const orderBy = ref('name')
const suggestionQuery = ref('')
const searchQuery = ref('')

const listPagination = ref<GenericListPagination>({
  limit: 10,
  offset: 0,
  total: 0
})
const onItemsRendered = (_items: any[], pagination: GenericListPagination) => {
  listPagination.value = pagination
}

const listParams = computed(() => {
  return {
    query: {
      limit: 50,
      includePublic: true,
      order_by: orderBy.value,
      term: searchQuery.value || undefined
    }
  }
})

function handleSubmitSuggestionQuery() {
  searchQuery.value = suggestionQuery.value
}
</script>

<i18n lang="json">
{
  "en": {
    "topics": "Topics",
    "label_filter_topics": "Search topics",
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
