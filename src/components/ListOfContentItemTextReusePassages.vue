<template>
  <List
    width="100%"
    :is-loading="isLoading"
    :items="items"
    :paginationList="pagination"
    @changePage="handlePaginationChange"
  >
    <template v-slot:header>
      <b-navbar-nav class="py-2 pl-3 ml-auto d-flex flex-row position-sticky top-0">
        <b-nav-item
          v-if="items.length"
          v-html="
            $tc('numbers.textReusePassagesFound', pagination.totalRows, {
              count: pagination.totalRows
            })
          "
        >
        </b-nav-item>
      </b-navbar-nav>
    </template>
    <div class="container-fluid my-3 position-relative">
      <div class="row">
        <template v-if="isLoading">
          <div class="col-3 mb-3" v-for="n in 20" :key="n">
            <LoadingBlock label=" " :height="200" />
          </div>
        </template>
        <template v-else>
          <div v-if="pagination.totalRows === 0" class="col-12 mb-3">
            {{ $t('textReusePassages.noPassagesFound') }}
          </div>
          <div class="col-md-12 col-lg-6 col-xl-4 mb-3" v-for="item in items" :key="item.id">
            <TextReusePassageItem :item="item" />
          </div>
        </template>
        <FeathersErrorManager
          class="col-12"
          v-if="error"
          :error="error"
          :defaultLabel="$t('textReusePassages.fetchError')"
        />
      </div>
    </div>
  </List>
</template>
<i18n lang="json">
{
  "en": {
    "numbers": {
      "textReusePassagesFound": "<span class='number'>{n}</span> text reuse passage | <span class='number'>{n}</span> text reuse passages"
    },
    "textReusePassages": {
      "noPassagesFound": "No text reuse passages found for this content item.",
      "fetchError": "An error occurred while fetching text reuse passages."
    }
  }
}
</i18n>
<script lang="ts" setup>
import { ref, watch } from 'vue'
import List from '@/components/modules/lists/List.vue'
import LoadingBlock from './LoadingBlock.vue'
import FeathersErrorManager from './FeathersErrorManager.vue'
import TextReusePassageItem from './modules/lists/TextReusePassageItem.vue'
import { textReusePassages as textReusePassagesService } from '@/services'
import type { ContentItem as ContentItemType } from '@/models/generated/schemas/contentItem'
import type { TextReusePassage } from '@/models/generated/schemas'

const props = defineProps<{
  contentItem: ContentItemType
}>()

const items = ref<TextReusePassage[]>([])
const pagination = ref({
  perPage: 12,
  currentPage: 1,
  totalRows: 0
})
const isLoading = ref(false)
const error = ref<Error | null>(null)

const handlePaginationChange = (newPage: number) => {
  pagination.value.currentPage = newPage
  fetchTextReusePassages()
}

const fetchTextReusePassages = async () => {
  if (!props.contentItem || isLoading.value) return

  isLoading.value = true
  error.value = null

  try {
    const { data, total } = await textReusePassagesService.find({
      query: {
        filters: [
          {
            type: 'contentItemId',
            q: [props.contentItem.id]
          }
        ],
        limit: pagination.value.perPage,
        offset: (pagination.value.currentPage - 1) * pagination.value.perPage
      }
    })
    items.value = data
    pagination.value = {
      ...pagination.value,
      totalRows: total
    }
  } catch (err) {
    error.value = err
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.contentItem,
  () => {
    pagination.value = {
      perPage: 12,
      currentPage: 1,
      totalRows: 0
    }
    fetchTextReusePassages()
  },
  { immediate: true }
)
</script>
