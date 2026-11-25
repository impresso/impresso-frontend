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
            showType
            showSpecs
          />
        </template>
      </ListOfFindResponseItems>
    </i-layout-section>

    <i-layout-section main>
      <template #header>
        <b-navbar class="py-3 d-block container ml-0">
          <section class="py-1">
            <div class="label small-caps">{{ $t('issue') }}</div>
            <h3 class="mb-1">
              <span v-if="isIssueInfoLoading" class="text-muted"> {{ $t('loading') }}... </span>
              <span v-else-if="issueInfoError">
                {{ $t('errorLoadingIssueInfo') }}
              </span>
              <span v-else>
                {{ issueId }}
              </span>
            </h3>

            <div v-if="firstContentItem?.meta" class="IssuePage_info">
              <div>
                <MediaSourceLabel
                  v-if="firstContentItem.meta.mediaId"
                  :item="{
                    id: firstContentItem.meta.mediaId,
                    name: firstContentItem.meta.mediaId,
                    type: firstContentItem.meta.sourceType
                  }"
                  show-link
                  class="d-inline-block"
                />
                <template v-if="firstContentItem.meta.date">
                  &mdash; {{ $d(new Date(firstContentItem.meta.date), 'long') }}
                </template>
              </div>
              <div v-if="firstContentItem.access || firstContentItem.meta.partnerId">
                <span v-if="firstContentItem.access">
                  {{ $t(`buckets.copyright.${firstContentItem.access.copyright}`) }}
                </span>
                <DataProviderLabel
                  v-if="firstContentItem.meta.partnerId"
                  :item="{
                    id: firstContentItem.meta.partnerId,
                    name: firstContentItem.meta.partnerId
                  }"
                  show-link
                  class="d-inline-block"
                />
              </div>
            </div>
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
      <div
        :class="
          route.name === Routes.issuePage.children.viewer.name
            ? 'h-100'
            : 'container ml-0 py-4 pr-5'
        "
      >
        <router-view v-slot="{ Component }">
          <component
            :is="Component"
            v-bind="
              route.name === Routes.issuePage.children.overview.name
                ? { item: issueId ? { id: issueId } : undefined, listFilters: sidebarFilters }
                : {}
            "
          />
        </router-view>
      </div>
    </i-layout-section>
  </i-layout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import DataProviderLabel from '@/components/modules/lists/DataProviderLabel.vue'
import MediaSourceLabel from '@/components/modules/lists/MediaSourceLabel.vue'
import LoadingBlock from '@/components/LoadingBlock.vue'
import ListOfFindResponseItems from '@/components/ListOfFindResponseItems.vue'
import ContentItem from '@/components/modules/lists/ContentItem.vue'
import SearchResultsSummary from '@/components/modules/SearchResultsSummary.vue'
import type { ContentItem as ContentItemData } from '@/models/generated/canonical/contentItem'
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
const firstContentItem = ref<ContentItemData | null>(null)
const isIssueInfoLoading = ref(false)
const issueInfoError = ref(false)

watch(
  issueId,
  async (id, _previousId, onCleanup) => {
    let cancelled = false
    onCleanup(() => {
      cancelled = true
    })
    firstContentItem.value = null
    issueInfoError.value = false
    if (!id) {
      isIssueInfoLoading.value = false
      return
    }

    isIssueInfoLoading.value = true
    try {
      const response = await contentItemService.find({
        query: { filters: [{ type: 'issue', q: id }], limit: 1, offset: 0, order_by: 'id' }
      })
      if (!cancelled) firstContentItem.value = response.data[0] ?? null
    } catch (error) {
      if (!cancelled) {
        console.error('[IssuePage] Failed to load issue info', id, error)
        issueInfoError.value = true
      }
    } finally {
      if (!cancelled) isIssueInfoLoading.value = false
    }
  },
  { immediate: true }
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
    "errorLoadingIssueInfo": "Could not load issue information",
    "contentItemsInIssue": "Content items in this issue",
    "noContentItems": "No content items found",
    "errorLoadingContentItems": "Error loading content items"
  }
}
</i18n>
