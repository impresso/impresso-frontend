<template lang="html">
  <i-layout id="TopicsPage">
    <i-layout-section width="350px">
      <template v-slot:header>
        <ul class="nav nav-pills mx-2 mt-2">
          <li class="nav-item active">
            <router-link
              :to="{
                name: Routes.topics.children.metadata.name
              }"
              exact-active-class="active"
              active-class=""
              class="nav-link"
            >
              {{ $t('topics') }}
            </router-link>
          </li>
        </ul>
      </template>
      <template v-slot:default>
        <ListOfFindResponseItems
          ref="topicsList"
          :service="topicsService"
          :params="listParams"
          :list-is-empty-message="$t('no topics')"
          :error-loading-items-message="$t('error loading topics')"
          @items-rendered="onItemsRendered"
        >
          <template #header="{ total, isLoading }">
            {{ total }}
          </template>
        </ListOfFindResponseItems>
      </template>
    </i-layout-section>
    <router-view />
  </i-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { topics as topicsService } from '../services'
import ListOfFindResponseItems from '../components/ListOfFindResponseItems.vue'
import type { GenericListPagination } from '../components/ListOfFindResponseItems.vue'
import { Routes } from '@/router/routes'
const searchTerm = ref('')
const listParams = computed(() => {
  console.debug(
    'Computed listParams with searchTerm:',
    searchTerm.value,
    'and orderBy:'
    // orderBy.value
  )
  if (searchTerm.value.trim() !== '') {
    return {
      query: {
        limit: 10,
        includePublic: true,
        term: searchTerm.value.trim()
        // order_by: orderBy.value
      }
    }
  }
  return {
    query: {
      limit: 10,
      includePublic: true
      // order_by: orderBy.value
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
</script>
