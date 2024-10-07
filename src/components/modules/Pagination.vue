<template>
  <div class="Pagination" :class="{ 'dark-mode': props.darkMode }">
    <ul
      class="pagination b-pagination m-0"
      :class="{
        [`pagination-${props.size}`]: props.size != null
      }"
      role="menubar"
      aria-disabled="false"
      aria-label="Pagination"
      data-testid="pagination-container"
    >
      <!-- Go to first page -->
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
        <button v-else role="menuitem" type="button" class="page-link" @click="goToFirst()">
          «
        </button>
      </li>

      <!-- Go to previous page -->
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
        <button v-else role="menuitem" type="button" class="page-link" @click="incrementPage(1)">
          ‹
        </button>
      </li>

      <!-- Ellipsis before -->
      <li v-if="showEllipsisBefore" role="separator" class="page-item disabled">
        <span class="page-link">…</span>
      </li>

      <!-- visible pages -->
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
          aria-setsize="254"
          :tabindex="page.isCurrent ? 1 : -1"
          class="page-link"
          @click="goToPage(page.number)"
        >
          {{ page.number }}
        </button>
      </li>

      <!-- Ellipsis after -->
      <li v-if="showEllipsisAfter" role="separator" class="page-item disabled">
        <span class="page-link">…</span>
      </li>

      <!-- Go to next page -->
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
        <button v-else role="menuitem" type="button" class="page-link" @click="incrementPage(-1)">
          ›
        </button>
      </li>

      <!-- Go to last page -->
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
          aria-label="Go to first page"
          >»</span
        >
        <button v-else role="menuitem" type="button" class="page-link" @click="goToLast()">
          »
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  darkMode: Boolean,
  size: {
    type: String,
    default: 'md'
  },
  perPage: {
    // number of pages visible at a time
    type: Number,
    default: 1
  },
  currentPage: {
    type: Number,
    default: 1
  },
  totalRows: {
    type: Number,
    default: 1
  },
  visiblePagesCount: {
    type: Number,
    default: 4
  }
})

const emit = defineEmits(['change'])

const currentPage = computed({
  get: () => props.currentPage,
  set: value => emit('change', value)
})

const totalPages = computed(() => Math.ceil(props.totalRows / props.perPage))

const isFirstPage = computed(() => currentPage.value === 1)
const isLastPage = computed(() => currentPage.value === totalPages.value)

const visiblePages = computed(() => {
  const halfVisiblePages = Math.floor(props.visiblePagesCount / 2)

  const firstVisiblePage = Math.max(currentPage.value - halfVisiblePages, 1)
  const lastVisiblePage = Math.min(firstVisiblePage + props.visiblePagesCount - 1, totalPages.value)

  return Array.from({ length: lastVisiblePage - firstVisiblePage + 1 }, (_, i) => {
    const number = firstVisiblePage + i
    return {
      number,
      isCurrent: number === currentPage.value
    }
  })
})

const showEllipsisBefore = computed(() => {
  if (visiblePages.value.length === 0) return false
  return visiblePages.value[0].number > 1
})
const showEllipsisAfter = computed(() => {
  if (visiblePages.value.length === 0) return false
  return visiblePages.value[visiblePages.value.length - 1].number < totalPages.value
})

const goToPage = (page: number) => {
  currentPage.value = page
}

const incrementPage = (inc: number) => {
  if (currentPage.value - inc < 1 || currentPage.value - inc > totalPages.value) return
  currentPage.value -= inc
}

const goToFirst = () => {
  currentPage.value = 1
}

const goToLast = () => {
  currentPage.value = totalPages.value
}
</script>

<style>
.dark-mode {
  background: transparent;
}

.fixed-pagination-footer .Pagination {
  border-radius: var(--impresso-border-radius-xs);
  box-shadow: var(--bs-box-shadow-md);
}
.Pagination .pagination li.page-item > a,
.Pagination .pagination li.page-item > .page-link {
  padding: var(--spacing-1) var(--spacing-2);
  background-color: var(--clr-white);
}
.Pagination .pagination li.page-item.active > .page-link {
  background-color: var(--impresso-color-black);
}
</style>
