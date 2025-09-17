<template>
  <div class="newspaper-item d-flex align-items-center" :class="{ active }">
    <div class="flex-grow-1">
      <router-link v-if="showLink" :class="{ active: active }" :to="itemUrl">
        <strong>{{ item.name }}</strong>
      </router-link>
      <h2 v-else class="sans" :class="{ 'font-weight-bold': item.included }">
        {{ item.name }}
      </h2>
      <div class="small">
        <span
          class="d-inline"
          v-html="$t('availability', { from: item.startYear, to: item.endYear })"
        ></span>
        <DataProviderLabel
          v-if="item.dataProvider"
          :item="{ id: item.dataProvider, name: '' }"
          class="d-inline mb-1"
          showLink
        />
      </div>
      <div
        class="small"
        v-html="
          $t('stats', {
            articles: $n(item.countArticles),
            pages: $n(item.countPages),
            issues: $n(item.countIssues)
          })
        "
      ></div>

      <div v-if="item.countIssues < 0">{{ $t('unavailable') }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DataProviderLabel from './DataProviderLabel.vue'

// Define interfaces
interface Issue {
  date: Date | string
}

interface NewspaperItem {
  name: string
  uid: string
  dataProvider?: string
  startYear?: number
  endYear?: number
  firstIssue?: Issue
  lastIssue?: Issue
  countIssues: number
  countArticles: number
  countPages: number
  included?: boolean
}

// Props definition
interface Props {
  active?: boolean
  showLink?: boolean
  item: NewspaperItem
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  showLink: false
})
// Composables
const route = useRoute()

const itemUrl = computed(() => ({
  name: 'newspaper_metadata',
  query: route.query,
  params: {
    newspaper_uid: props.item.uid
  }
}))

const parseDate = (date: Date | string | number): Date => {
  return date instanceof Date ? date : new Date(date.toString())
}
</script>

<style lang="scss">
.newspaper-item {
  h2 {
    font-size: inherit;
  }

  .date {
    text-transform: lowercase;
  }
}

.newspaper-item.active {
  box-shadow: inset 0.15em 0 #343a40;
  background-color: #f2f2f2;
}
</style>

<i18n lang="json">
{
  "en": {
    "unavailable": "(coming soon)",
    "availability": "Published from {from} to {to}",
    "stats": "<span class='number'>{articles}</span> articles, <span class='number'>{pages}</span> pages, <span class='number'>{issues}</span> issues"
  }
}
</i18n>
