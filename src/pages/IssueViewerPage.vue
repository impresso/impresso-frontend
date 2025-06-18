<template>
  <i-layout id="IssuePageViewer" ref="issuePageViewer">
    <i-layout-section main>
      <template v-slot:header>
        <IssueViewerPageHeading
          :isLoading="isLoading"
          :filtersWithItems="filtersWithItems"
          :issue="issue"
          :article="contentItem"
          :mediaSource="mediaSource"
          :page="page"
        >
        </IssueViewerPageHeading>
        <b-navbar-nav class="IssueViewerPage_tabs px-3 border-bottom pb-2">
          <b-tabs pills>
            <template v-slot:tabs-end>
              <b-nav-item
                class="pl-2"
                v-for="mode in AvailableViewModes"
                :key="mode"
                @click="changeViewMode(mode)"
                :class="{ active: mode === viewMode }"
              >
                <button size="sm" class="btn btn-transparent small-caps">
                  {{ $t('viewModes.' + mode) }}
                </button>
              </b-nav-item>
            </template>
          </b-tabs>
        </b-navbar-nav>
      </template>
      <div v-if="issue" class="d-flex h-100 justify-content-center position-relative">
        <OpenSeadragonArticleViewer
          v-if="viewMode === FacsimileMode && contentItem"
          :pages="pagesIIIFUrls"
          :regions="[]"
          :defaultCurrentPageIndex="pageIndex"
          :article="{ uid: contentItemId }"
          :marginaliaSections="[]"
        />
        <ThumbnailNavigator
          v-if="viewMode === FacsimileMode"
          class="position-absolute"
          style="bottom: 1rem"
          :pages="issue.pages"
          :current-page-uid="page?.uid"
        />
        <IssueViewerText
          v-if="viewMode === IIIFViewerTranscriptMode"
          :article_uid="contentItemId"
          withIIIFViewer
        />
      </div>
    </i-layout-section>
  </i-layout>
</template>

<script setup lang="ts">
import { CommonQueryParameters } from '@/router/util'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Issue from '@/models/Issue'
import TableOfContents from '@/models/TableOfContents'
import type { Filter, MediaSource } from '@/models'
import { issues as issuesService, tableOfContents as tableOfContentsService } from '@/services'
import type ArticleBase from '@/models/ArticleBase'
import { table } from 'console'
import IssueViewerPageHeading from '@/components/IssueViewerPageHeading.vue'
import IssueViewerText from '@/components/modules/IssueViewerText.vue'
import OpenSeadragonArticleViewer from '@/components/modules/OpenSeadragonArticleViewer.vue'
import { PageRegion } from '@/components/osviewer/OSViewer.vue'
import ThumbnailNavigator from '@/components/thumbnailNavigator/ThumbnailNavigator.vue'

// Viewer modes
const FacsimileMode = '0'
const RegionTranscriptMode = '1'
const IIIFViewerTranscriptMode = '2'
const AvailableViewModes = [FacsimileMode, RegionTranscriptMode, IIIFViewerTranscriptMode]
// Route parameters
const RouteParams = Object.freeze({ IssueId: 'issue_uid' })
const QueryParams = Object.freeze({
  ViewMode: 'text'
})
const route = useRoute()
const router = useRouter()

const suggestionQuery = computed(() => route.query[CommonQueryParameters.SuggestionQuery] || '')
const pageNumber = computed<number>(() => {
  const page = route.query[CommonQueryParameters.PageNumber]
  if (typeof page === 'string') {
    return parseInt(page, 10)
  } else if (typeof page === 'number') {
    return page
  } else {
    return 1
  }
})

const viewMode = computed(() => {
  if (!contentItemId.value) {
    console.warn('[IssueViewerPage] No content item ID available to determine view mode.')
    return FacsimileMode
  }
  const textMode = route.query[QueryParams.ViewMode] as string
  if (AvailableViewModes.includes(textMode)) {
    return textMode
  }
  return IIIFViewerTranscriptMode
})

const contentItemId = computed(() => {
  const id =
    route.query[CommonQueryParameters.ContentItemId] ||
    route.query[CommonQueryParameters.LegacyArticleId]

  const issueId = route.params[RouteParams.IssueId]
  if (!issueId) {
    console.warn('[IssueViewerPage] No issue ID provided in route parameters.')
    return null
  }
  if (!id) {
    console.warn('[IssueViewerPage] No content item ID provided in route query parameters.')
    return null
  }
  return `${issueId}-${id}`
})

const isLoading = ref(false)
const issue = ref<Issue | null>()
const tableOfContents = ref<TableOfContents | null>(null)
const pageIndex = ref(0)
const page = ref(null)
const pageRegions = ref<PageRegion[]>([])
const pagesIIIFUrls = ref<string[]>([])
const mediaSource = ref(null)
const contentItem = ref<ArticleBase | null>(null)

export interface IssueViewerPageProps {
  filtersWithItems: Filter[]
}

const props = withDefaults(defineProps<IssueViewerPageProps>(), {
  filtersWithItems: () => []
})
/**
 * Fetches issue details and its table of contents from the server.
 *
 * This asynchronous function retrieves the issue data and its associated table of contents
 * based on the provided parameters. It handles API requests and returns the combined result.
 *
 * @param {string} id - The unique identifier of the issue to fetch.
 * @param {Object} [options] - Optional parameters for the fetch operation.
 * @param {boolean} [options.includeComments=false] - Whether to include comments in the response.
 * @returns {Promise<{ issue: Object, tableOfContents: Array }>} A promise that resolves to an object containing the issue details and its table of contents.
 * @throws {Error} Throws an error if the fetch operation fails.
 */
async function fetchIssueAndTableOfContents(id: string): Promise<void> {
  isLoading.value = true
  console.debug('[IssueViewerPage] fetchIssueAndTableOfContents arg:', id)
  issue.value = await issuesService.get(id).then(data => {
    console.debug('[IssueViewerPage] fetchIssueAndTableOfContents issue OK')
    return new Issue(data)
  })

  tableOfContents.value = await tableOfContentsService.get(id).then(data => {
    console.debug('[IssueViewerPage] fetchIssueAndTableOfContents tableOfContents OK')
    return new TableOfContents(data)
  })

  isLoading.value = false

  pagesIIIFUrls.value = issue.value.pages.map(p => p.iiif)

  if (!tableOfContents.value.newspaper) return

  mediaSource.value = {
    id: tableOfContents.value.newspaper.id,
    name: tableOfContents.value.newspaper.type,
    type: 'newspaper'
  } satisfies MediaSource
}

function fetchContentItem(id: string): ArticleBase | null {
  console.debug('[IssueViewerPage] fetchContentItem id:', contentItemId.value)

  if (!tableOfContents.value) {
    console.warn('[IssueViewerPage] ; No table of contents available to fetch content item id:', id)
    return null
  }
  contentItem.value = tableOfContents.value.articles.find(d => d.uid === contentItemId.value)
}

function fetchPage(pageNumber: number): void {
  console.debug('[IssueViewerPage] fetchPage():', pageNumber)
  if (!issue.value) {
    console.warn('[IssueViewerPage] No issue available to fetch page:', pageNumber)
    return
  }
  pageIndex.value = issue.value.pages.findIndex(d => d.num === pageNumber)
  if (pageIndex.value === -1) {
    console.warn('[IssueViewerPage] No page found for page number:', pageNumber)
    return
  }
  page.value = issue.value.pages[pageIndex.value]
}

function changeViewMode(mode: string): void {
  if (!AvailableViewModes.includes(mode)) {
    console.warn('[IssueViewerPage] changeViewMode: Invalid mode:', mode)
    return
  }
  const query = { ...route.query, [QueryParams.ViewMode]: mode }
  router.replace({ query })
}

watch(
  () => route.params[RouteParams.IssueId],
  async v => {
    if (v) {
      // Handle the new suggestion query
      console.debug('[IssueViewerPage] @route.params[RouteParams.IssueId] v:', v)
      await fetchIssueAndTableOfContents(v as string)

      if (contentItemId.value) {
        fetchContentItem(contentItemId.value)
      }
      if (pageNumber.value) {
        fetchPage(pageNumber.value as number)
      }
    }
  },
  { immediate: true }
)

watch(contentItemId, newId => {
  fetchContentItem(newId)
})
</script>

<style lang="scss">
// @import '@/assets/legacy/bootstrap-impresso-theme-variables.scss';
// .IssueViewerPage_matchingArticles .number {
//   font-weight: bold;
// }
// section.i-layout-section {
//   background-color: $clr-bg-secondary;
// }
// section.i-layout-section > div.header {
//   background-color: $clr-bg-primary;
// }
.IssueViewerPage_tabs .active > .small-caps {
  font-weight: var(--impresso-wght-smallcaps-bold);
  font-variation-settings: 'wght' var(--impresso-wght-smallcaps-bold);
  box-shadow:
    var(--impresso-color-black) 0 2px 0 0,
    var(--impresso-color-black) 0 2px 0 0;
  border-bottom: 1px solid var(--impresso-color-black);
}
</style>
<i18n lang="json">
{
  "en": {
    "viewModes": {
      "0": "Facsimile",
      "1": "Region Transcript",
      "2": "Facsimile + Transcript"
    }
  },
  "de": {
    "viewModes": {
      "0": "Faksimile",
      "1": "Region Transkript",
      "2": "Faksimile + Transkript"
    }
  }
}
</i18n>
