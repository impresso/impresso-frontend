<template>
  <i-layout class="IssuePage">
    <i-layout-section width="380px">
      <template #header>
        <ul class="nav nav-pills mx-2 mt-2">
          <li class="nav-item active">
            <router-link
              :to="{
                name: Routes.issuePage.name,
                params: { issue_id: route.params.issue_id }
              }"
              exact-active-class="active"
              active-class="active"
              class="nav-link"
            >
              {{ $t('Issue') }}
            </router-link>
          </li>
        </ul>
      </template>

      <ListOfFindResponseItems
        v-if="issueId"
        :key="issueId"
        :service="contentItemService"
        :params="listParams"
        :list-is-empty-message="$t('noContentItems')"
        :error-loading-items-message="$t('errorLoadingContentItems')"
        items-class="p-0"
      >
        <template #header="{ total, isLoading }">
          <div class="my-3 mx-3">
            <SearchResultsSummary
              :is-loading="isLoading"
              groupBy="articles"
              :totalRows="total"
              :searchQuery="{ filters: sidebarFiltersWithItems }"
            />
          </div>
        </template>
        <template #default="{ items }">
          <ContentItem
            v-for="item in items"
            :key="item.id"
            :content-item="item"
            class="m-3 p-2 rounded-md border shadow-sm mb-4"
            showLink
            showIcon
            showMeta
            showSnippet
            showSemanticEnrichments
            showProvider
            showType
          />
        </template>
      </ListOfFindResponseItems>
    </i-layout-section>

    <i-layout-section main>
      <template #header>
        <b-navbar class="py-3 d-block container ml-0">
          <section class="py-1">
            <div class="label small-caps">{{ $t('issue') }}</div>
            <h3 class="mb-1">{{ issueId }}</h3>
          </section>
        </b-navbar>
        <b-navbar-nav class="container ml-0 pb-2">
          <ul class="nav nav-pills border-0">
            <li
              v-for="nestedRoute in availableNestedRoutes"
              :key="nestedRoute.name"
              class="nav-item px-3"
            >
              <router-link
                :to="{ name: nestedRoute.name, params: { issue_id: issueId } }"
                exact-active-class="active"
                active-class=""
                class="nav-link"
              >
                {{ $t('routes.' + nestedRoute.name) }}
              </router-link>
            </li>
          </ul>
        </b-navbar-nav>
      </template>
      <div :class="route.name === Routes.issuePage.children.viewer.name ? 'h-100' : 'container ml-0 py-4 pr-5'">
        <router-view v-slot="{ Component }">
          <component
            :is="Component"
            v-bind="route.name === Routes.issuePage.children.overview.name
              ? { item: issueId ? { id: issueId } : undefined, listFilters: sidebarFilters }
              : {}"
          />
        </router-view>
      </div>
    </i-layout-section>
  </i-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ListOfFindResponseItems from '@/components/ListOfFindResponseItems.vue'
import ContentItem from '@/components/modules/lists/ContentItem.vue'
import SearchResultsSummary from '@/components/modules/SearchResultsSummary.vue'
import type { Filter, FilterWithItems } from '@/models'
import { contentItems as contentItemService } from '@/services'
import { Routes } from '@/router/routes'

const route = useRoute()
const availableNestedRoutes = [
  Routes.issuePage.children.viewer,
  Routes.issuePage.children.overview
] as const
const issueId = computed(() =>
  typeof route.params.issue_id === 'string' ? route.params.issue_id : ''
)
const sidebarFilters = computed<Filter[]>(() =>
  issueId.value ? [{ type: 'issue', q: issueId.value }] : []
)
const sidebarFiltersWithItems = computed<FilterWithItems[]>(() =>
  sidebarFilters.value.map(filter => ({
    ...filter,
    items: [{ id: issueId.value, label: issueId.value }]
  }))
)
const listParams = computed(() => ({
  query: {
    limit: 10,
    offset: 0,
    filters: sidebarFilters.value,
    order_by: 'id'
  }
}))
</script>

<i18n lang="json">
{
  "en": {
    "issue": "Issue",
    "routes": {
      "issuePageViewer": "Viewer",
      "issuePageOverview": "Overview"
    },
    "contentItemsInIssue": "Content items in this issue",
    "noContentItems": "No content items found",
    "errorLoadingContentItems": "Error loading content items"
  }
}
</i18n>
