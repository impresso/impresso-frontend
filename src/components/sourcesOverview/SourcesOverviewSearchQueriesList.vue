<template>
  <div>
    <p v-if="!entries.length" class="text-muted mb-0">{{ $t('noSavedSearchQueries') }}</p>
    <template v-else>
      <div class="d-flex justify-content-between mb-3 gap-3">
        <slot></slot>
        <label class="d-flex align-items-center gap-2 small text-muted">
          <span>{{ $t('sortBy') }}</span>
          <i-dropdown
            right
            v-model="orderBy"
            :options="orderByOptions"
            size="sm"
            variant="outline-primary"
          ></i-dropdown>
        </label>
      </div>
      <ul class="list-unstyled">
        <li
          v-for="entry in sortedEntries"
          :key="entry.hash"
          class="mb-2 bg-light p-3 rounded border d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2"
        >
          <div>
            {{ entry.summary || entry.hash }}
            <span class="small text-muted ml-2">
              {{ $t('saved') }} <TimeAgo :date="new Date(entry.createdAt ?? entry.timestamp)" />
            </span>
          </div>
          <slot name="action" :entry="entry">
            <RouterLink
              class="small text-decoration-underline"
              :to="{
                name: 'search',
                query: { sq: entry.hash }
              }"
            >
              {{ $t('exploreInSearch') }}
            </RouterLink>
          </slot>
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import TimeAgo from '@/components/TimeAgo.vue'
import { useSearchQueriesStore } from '@/stores/searchQueries'
import type { SearchQueryHashEntry } from '@/stores/searchQueries'

type OrderBy = 'createdAtDesc' | 'createdAtAsc' | 'modifiedAtDesc' | 'modifiedAtAsc'

defineSlots<{
  action(props: { entry: SearchQueryHashEntry }): any
}>()

const searchQueriesStore = useSearchQueriesStore()

const entries = computed(() => searchQueriesStore.all)
const orderBy = ref<OrderBy>('modifiedAtDesc')

const orderByOptions: { value: OrderBy; text: string }[] = [
  { value: 'modifiedAtDesc', text: 'modification date, newest first' },
  { value: 'modifiedAtAsc', text: 'modification date, oldest first' },
  { value: 'createdAtDesc', text: 'creation date, newest first' },
  { value: 'createdAtAsc', text: 'creation date, oldest first' }
]

const sortedEntries = computed(() => {
  const getCreatedAt = (entry: SearchQueryHashEntry) => entry.createdAt ?? entry.timestamp
  const getModifiedAt = (entry: SearchQueryHashEntry) => entry.timestamp

  return [...entries.value].sort((left, right) => {
    switch (orderBy.value) {
      case 'createdAtAsc':
        return getCreatedAt(left) - getCreatedAt(right)
      case 'createdAtDesc':
        return getCreatedAt(right) - getCreatedAt(left)
      case 'modifiedAtAsc':
        return getModifiedAt(left) - getModifiedAt(right)
      case 'modifiedAtDesc':
      default:
        return getModifiedAt(right) - getModifiedAt(left)
    }
  })
})
</script>

<i18n lang="json">
{
  "en": {
    "exploreInSearch": "explore in search",
    "noSavedSearchQueries": "Your previous queries will appear here.",
    "saved": "saved",
    "sortBy": "Sort by"
  }
}
</i18n>
