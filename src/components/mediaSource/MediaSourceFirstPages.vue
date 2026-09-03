<template>
  <ListOfFindResponseItems
    v-if="props.mediaSource"
    :service="pagesService"
    :params="listParams"
    @page-changed="handlePageChanged"
  >
    <template #header="{ total, isLoading }">
      <div class="container-xxl d-flex align-items-center justify-content-between gap-3 py-2">
        <div v-if="!isLoading" v-html="$t('numbers.pages', { n: $n(total) }, total)" />
        <div v-else class="text-muted">
          {{ $t('actions.loading') }}
        </div>
      </div>
    </template>
    <template #loading="{ isLoading }">
      <div class="container-xxl" v-if="isLoading">
        <div ref="topOfListRef" class="pt-4" />
        <div class="row mb-4">
          <div :class="eachItemClass" v-for="n in 12" :key="n" class="mb-4">
            <LoadingBlock :height="200" :animation-delay="n * 0.1" />
          </div>
        </div></div
    ></template>
    <template #default="{ items, isSuccess }">
      <div class="container-xxl mb-5" v-if="isSuccess">
        <div ref="topOfListRef" class="pt-3" />
        <div class="row mb-4">
          <div class="col-12" v-if="items.length === 0">
            <Alert type="info" class="border border-info" :closable="false">
              <span v-html="$t('messages.listIsEmpty')"></span>
            </Alert>
          </div>
          <div v-for="item in items" :key="item.id" :class="eachItemClass">
            <div class="border mb-3 rounded-md shadow-sm p-2 d-flex flex-column align-items-center">
              <div class="mb-1 small">
                {{ $d(dateFromIssueId(item.issueId), 'long') }}
              </div>
              <IIIFFragment
                class="position-relative"
                :iiif="item.iiif"
                size=",300"
                :scale="1"
                style="min-height: 200px"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </ListOfFindResponseItems>
</template>

<script setup lang="ts">
import { pages as pagesService } from '@/services'
import ListOfFindResponseItems from '../ListOfFindResponseItems.vue'
import IIIFFragment from '../IIIFFragment.vue'
import { computed, ref } from 'vue'
import { MediaSource } from '@/models/generated/canonical.js'
import LoadingBlock from '../LoadingBlock.vue'
import { useScrollToTop } from '@/composables/useScrollToTop'

export interface MediaSourceFirstPagesProps {
  mediaSource?: MediaSource
}

const props = defineProps<MediaSourceFirstPagesProps>()

const topOfListRef = ref<HTMLElement | null>(null)
const eachItemClass = ref('col-12 col-sm-6 col-md-4 col-lg-3')

const { triggerScroll } = useScrollToTop(topOfListRef)

const handlePageChanged = (newPage: number) => {
  // Handle page change event
  triggerScroll()
}

const listParams = computed(() => {
  return {
    query: {
      num: [1],
      mediaSourceId: props.mediaSource?.id,
      limit: 12,
      order_by: 'dateasc'
    }
  }
})

const dateFromIssueId = (issueId: string): Date | undefined => {
  const match = issueId.match(/(\d{4})-(\d{2})-(\d{2})/) // Format: yyyy-mm-dd

  if (match) {
    const [, year, month, day] = match
    return new Date(`${year}-${month}-${day}`)
  }
  return undefined
}
</script>
