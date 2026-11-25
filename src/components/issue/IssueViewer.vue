<template>
  <div class="IssueViewer h-100 position-relative">
    <LoadingBlock v-if="isLoading" />
    <div v-else-if="issueError" class="p-3" role="alert">{{ $t('issueError') }}</div>
    <div v-else-if="!pages.length" class="p-3">{{ $t('noPages') }}</div>
    <template v-else>
      <div v-if="regionsError" class="IssueViewer_regionsError p-3" role="alert">
        {{ $t('regionsError') }}
      </div>
      <OpenSeadragonArticleViewer
        :pages="pageUrls"
        :regions="pageRegions"
        :default-current-page-index="pageIndex"
        :article="selectedArticle"
        :marginalia-sections="[]"
        class="show-outlines"
        @page-changed="changePage"
        @article-selected="selectArticle"
      />
      <ModalDraggable
        ref="panel"
        v-if="selectedArticle.id"
        class="IssueViewer_panel bg-light border border-dark rounded shadow"
        :initial-x="16"
        :initial-y="16"
        respect-boundaries
        :title="$t('contentItem')"
        :reduce-label="$t('reduce')"
        :restore-label="$t('restore')"
        handle-class="p-2 rounded-top"
      >
        <template #header-actions>
          <button
            type="button"
            class="btn btn-sm btn-outline"
            :aria-label="$t('close')"
            @click.stop="clearSelectedArticle"
          >
            <Icon name="cross" :scale="0.75" :stroke-width="1.5" />
          </button>
        </template>
        <div class="IssueViewer_panelBody p-3">
          <LoadingBlock v-if="isContentItemLoading" />
          <div v-else-if="contentItemError" role="alert">{{ $t('contentItemError') }}</div>
          <ContentItem
            v-else-if="contentItem"
            :content-item="contentItem"
            show-link
            show-icon
            show-meta
            show-snippet
            show-specs
          />
          <div v-if="contentItem && !isContentItemLoading && !contentItemError" class="d-flex mt-2">
            <AddContentItemToSearch
              :content-item-id="contentItem.id"
              :disabled-reason="$t('noEmbeddings')"
              class="ml-auto"
            >
              {{ $t('showInSearch') }}
              <Icon name="brainElectricity" class="ml-1" :scale="0.75" :stroke-width="1.5" />
            </AddContentItemToSearch>
          </div>
        </div>
      </ModalDraggable>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoadingBlock from '@/components/LoadingBlock.vue'
import ModalDraggable from '@/components/ModalDraggable.vue'
import AddContentItemToSearch from '@/components/contentItem/AddContentItemToSearch.vue'
import Icon from '@/components/base/Icon.vue'
import ContentItem from '@/components/modules/lists/ContentItem.vue'
import OpenSeadragonArticleViewer, {
  type Region
} from '@/components/modules/OpenSeadragonArticleViewer.vue'
import Issue from '@/models/Issue'
import type { ContentItem as ContentItemData } from '@/models/generated/canonical/contentItem'
import { CommonQueryParameters } from '@/router/util'
import { contentItems as contentItemsService, issues as issuesService } from '@/services'

const route = useRoute()
const router = useRouter()
const issue = ref<Issue | null>(null)
const isLoading = ref(false)
const issueError = ref(false)
const regionsError = ref(false)
const panel = ref<InstanceType<typeof ModalDraggable> | null>(null)
const contentItem = ref<ContentItemData | null>(null)

const isContentItemLoading = ref(false)
const contentItemError = ref(false)
const pageRegions = ref<Region[]>([])
const issueId = computed(() =>
  typeof route.params.issue_id === 'string' ? route.params.issue_id : ''
)
const pages = computed(() => issue.value?.pages ?? [])
const pageUrls = computed(() => pages.value.map(page => page.iiif))
const pageIndex = computed(() => {
  const page = route.query[CommonQueryParameters.PageNumber]
  const pageNumber = typeof page === 'string' ? Number(page) : 1
  const index = pages.value.findIndex(item => item.num === pageNumber)
  return index < 0 ? 0 : index
})
const currentPage = computed(() => pages.value[pageIndex.value])
const selectedArticle = computed(() => {
  const id =
    route.query[CommonQueryParameters.ContentItemId] ??
    route.query[CommonQueryParameters.LegacyArticleId]
  return { id: typeof id === 'string' && id ? `${issueId.value}-${id}` : null }
})

watch(
  issueId,
  async (id, _previousId, onCleanup) => {
    let cancelled = false
    onCleanup(() => {
      cancelled = true
    })
    issue.value = null
    issueError.value = false
    if (!id) {
      isLoading.value = false
      return
    }

    isLoading.value = true
    try {
      const data = await issuesService.get(id)
      const loadedIssue = new Issue(data)
      if (loadedIssue.pages.some(page => !page.iiif)) {
        throw new Error('Issue contains a page without a IIIF URL')
      }
      if (!cancelled) issue.value = loadedIssue
    } catch (error) {
      if (!cancelled) {
        console.error('[IssueViewer] Failed to load issue', id, error)
        issueError.value = true
      }
    } finally {
      if (!cancelled) isLoading.value = false
    }
  },
  { immediate: true }
)

watch(
  currentPage,
  async (page, _previousPage, onCleanup) => {
    let cancelled = false
    onCleanup(() => {
      cancelled = true
    })
    pageRegions.value = []
    regionsError.value = false
    if (!page) return

    try {
      const response = await contentItemsService.find({
        query: { filters: [{ type: 'page', q: page.id }], limit: 500 }
      })
      if (cancelled) return
      pageRegions.value = response.data.flatMap((item: ContentItemData) =>
        (item.facsimile?.pages ?? [])
          .filter(itemPage => itemPage.id === page.id)
          .flatMap(itemPage =>
            (itemPage.regionCoordinates ?? []).map(([x, y, w, h]) => ({
              articleId: item.id,
              pageId: page.id,
              coords: { x, y, w, h }
            }))
          )
      )
    } catch (error) {
      if (!cancelled) {
        console.error('[IssueViewer] Failed to load page regions', page.id, error)
        regionsError.value = true
      }
    }
  },
  { immediate: true }
)

watch(
  () => selectedArticle.value.id,
  async (id, _previousId, onCleanup) => {
    let cancelled = false
    onCleanup(() => {
      cancelled = true
    })
    contentItem.value = null
    contentItemError.value = false
    if (!id) {
      isContentItemLoading.value = false
      return
    }

    isContentItemLoading.value = true
    try {
      const data = await contentItemsService.get(id)
      if (!cancelled) contentItem.value = data as ContentItemData
    } catch (error) {
      if (!cancelled) {
        console.error('[IssueViewer] Failed to load content item', id, error)
        contentItemError.value = true
      }
    } finally {
      if (!cancelled) isContentItemLoading.value = false
    }
  },
  { immediate: true }
)

async function changePage(index: number) {
  const page = pages.value[index]
  if (!page || index === pageIndex.value) return
  try {
    await router.replace({
      query: { ...route.query, [CommonQueryParameters.PageNumber]: String(page.num) }
    })
  } catch (error) {
    console.error('[IssueViewer] Failed to change page', error)
  }
}

async function selectArticle(id: string) {
  panel.value?.restore()
  const prefix = `${issueId.value}-`
  if (!issueId.value || !id.startsWith(prefix) || id.length === prefix.length) {
    console.warn('[IssueViewer] Cannot select content item outside the current issue:', id)
    return
  }
  const query = { ...route.query }
  delete query[CommonQueryParameters.LegacyArticleId]
  query[CommonQueryParameters.ContentItemId] = id.slice(prefix.length)
  try {
    await router.replace({ query })
  } catch (error) {
    console.error('[IssueViewer] Failed to select content item', error)
  }
}

async function clearSelectedArticle() {
  const query = { ...route.query }
  delete query[CommonQueryParameters.ContentItemId]
  delete query[CommonQueryParameters.LegacyArticleId]
  try {
    await router.replace({ query })
  } catch (error) {
    console.error('[IssueViewer] Failed to clear selected content item', error)
  }
}
</script>

<i18n lang="json">
{
  "en": {
    "issueError": "Could not load the issue.",
    "regionsError": "Could not load content item regions for this page.",
    "noPages": "This issue has no pages.",
    "contentItem": "Content item",
    "contentItemError": "Could not load the content item.",
    "noEmbeddings": "No semantic embeddings available for this content item.",
    "showInSearch": "Find similar items in search",
    "close": "Close",
    "reduce": "Reduce",
    "restore": "Restore"
  }
}
</i18n>

<style scoped>
.IssueViewer_panel {
  top: 0;
  left: 0;
}

.IssueViewer_panelBody {
  min-width: 320px;
  max-width: 420px;
  max-height: 60vh;
  overflow: auto;
  position: relative;
}

.IssueViewer_regionsError {
  position: absolute;
  z-index: 1;
  background: white;
}
</style>
