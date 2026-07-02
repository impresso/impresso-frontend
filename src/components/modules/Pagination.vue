<template>
  <div class="Pagination" :class="{ 'dark-mode': props.darkMode }">
    <ul
      class="pagination b-pagination m-0"
      :class="{ [`pagination-${props.size}`]: props.size }"
      role="menubar"
      aria-disabled="false"
      aria-label="Pagination"
      data-testid="pagination-container"
    >
      <li
        role="presentation"
        :aria-hidden="isFirstPage"
        class="page-item"
        :class="{ disabled: isFirstPage }"
      >
        <span
          v-if="isFirstPage"
          role="menuitem"
          aria-disabled="true"
          class="page-link"
          aria-label="Go to first page"
          >«</span
        >
        <button v-else role="menuitem" type="button" class="page-link" @click="goToFirst">«</button>
      </li>

      <li
        role="presentation"
        :aria-hidden="isFirstPage"
        class="page-item"
        :class="{ disabled: isFirstPage }"
      >
        <span
          v-if="isFirstPage"
          role="menuitem"
          aria-disabled="true"
          class="page-link"
          aria-label="Go to previous page"
          >‹</span
        >
        <button v-else role="menuitem" type="button" class="page-link" @click="prevPage">‹</button>
      </li>

      <li v-if="showEllipsisBefore" role="separator" class="page-item disabled">
        <span class="page-link">…</span>
      </li>

      <li
        v-for="page in visiblePages"
        :key="page.number"
        role="presentation"
        class="page-item"
        :class="{ active: page.isCurrent }"
        :data-testid="`page-${page.number}`"
      >
        <button
          role="menuitemradio"
          type="button"
          :aria-label="`Go to page ${page.number}`"
          :aria-checked="page.isCurrent"
          :aria-posinset="page.number"
          :aria-setsize="totalPages"
          :tabindex="page.isCurrent ? 0 : -1"
          class="page-link"
          @click="goToPage(page.number)"
        >
          {{ $n(page.number) }}
        </button>
      </li>

      <li v-if="showEllipsisAfter" role="separator" class="page-item disabled">
        <span class="page-link">…</span>
      </li>

      <li
        role="presentation"
        :aria-hidden="isLastPage"
        class="page-item"
        :class="{ disabled: isLastPage }"
      >
        <span
          v-if="isLastPage"
          role="menuitem"
          aria-disabled="true"
          class="page-link"
          aria-label="Go to next page"
          >›</span
        >
        <button v-else role="menuitem" type="button" class="page-link" @click="nextPage">›</button>
      </li>

      <li
        role="presentation"
        :aria-hidden="isLastPage"
        class="page-item"
        :class="{ disabled: isLastPage }"
      >
        <span
          v-if="isLastPage"
          role="menuitem"
          aria-disabled="true"
          class="page-link"
          aria-label="Go to last page"
          >»</span
        >
        <button v-else role="menuitem" type="button" class="page-link" @click="goToLast">»</button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 1. Clean TypeScript Interfaces for Props
interface Props {
  darkMode?: boolean
  size?: 'sm' | 'md' | 'lg'
  perPage?: number
  currentPage?: number
  totalRows?: number
  visiblePagesCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  darkMode: false,
  size: 'md',
  perPage: 1,
  currentPage: 1,
  totalRows: 1,
  visiblePagesCount: 4
})

// 2. Strict Type Emits
const emit = defineEmits<{
  (e: 'change', page: number): void
}>()

// 3. Simple Intermediary Write Handler
const updatePage = (value: number) => {
  if (value >= 1 && value <= totalPages.value) {
    emit('change', value)
  }
}

const totalPages = computed(() => Math.max(1, Math.ceil(props.totalRows / props.perPage)))

const isFirstPage = computed(() => props.currentPage <= 1)
const isLastPage = computed(() => props.currentPage >= totalPages.value)

// 4. Fixed Slider Window Logic
const visiblePages = computed(() => {
  let start = Math.max(1, props.currentPage - Math.floor(props.visiblePagesCount / 2))
  let end = start + props.visiblePagesCount - 1

  if (end > totalPages.value) {
    end = totalPages.value
    start = Math.max(1, end - props.visiblePagesCount + 1)
  }

  return Array.from({ length: end - start + 1 }, (_, i) => {
    const number = start + i
    return {
      number,
      isCurrent: number === props.currentPage
    }
  })
})

const showEllipsisBefore = computed(() => {
  return visiblePages.value.length > 0 && visiblePages.value[0].number > 1
})

const showEllipsisAfter = computed(() => {
  return (
    visiblePages.value.length > 0 &&
    visiblePages.value[visiblePages.value.length - 1].number < totalPages.value
  )
})

// 5. Clean Action Methods
const goToPage = (page: number) => updatePage(page)
const nextPage = () => updatePage(props.currentPage + 1)
const prevPage = () => updatePage(props.currentPage - 1)
const goToFirst = () => updatePage(1)
const goToLast = () => updatePage(totalPages.value)
</script>

<style>
/* Ensure layout container naturally renders as a flex row item */
.Pagination {
  display: inline-block;
}

.Pagination .pagination {
  display: flex;
  list-style: none;
  padding-left: 0;
}

.Pagination.dark-mode {
  background: transparent;
}

.fixed-pagination-footer .Pagination {
  border-radius: var(--impresso-border-radius-xs);
  box-shadow:
    rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
    rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
}

.Pagination .pagination li.page-item > .page-link {
  display: block;
  text-decoration: none;
  border: 1px solid var(--clr-grey-200, #dee2e6);
  cursor: pointer;
  padding: var(--spacing-1, 0.375rem) var(--spacing-2, 0.75rem);
  background-color: var(--clr-white, #fff);
}

.Pagination .pagination li.page-item.disabled > .page-link {
  cursor: not-allowed;
  opacity: 0.6;
}

.Pagination .pagination li.page-item.active > .page-link {
  background-color: var(--impresso-color-black, #000);
  color: #fff;
}

/* Background contexts variations mapping */
.bg-dark .Pagination .pagination {
  border: 1px solid var(--clr-grey-200);
  border-radius: var(--impresso-border-radius-xs);
  overflow: hidden;
}
.bg-dark .Pagination .pagination li.page-item > .page-link {
  background-color: var(--impresso-color-black);
  color: var(--clr-grey-400);
  border-color: var(--clr-grey-400);
}
.bg-dark .Pagination .pagination li.page-item.active > .page-link {
  background-color: var(--clr-grey-400);
  color: var(--impresso-color-black);
  border-color: var(--clr-grey-400) !important;
}
</style>
