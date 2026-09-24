<template>
  <div class="List" :style="{ width: width }">
    <header class="layout-header border-bottom">
      <slot name="header" />
    </header>

    <main class="layout-body">
      <div class="items">
        <slot />
      </div>
    </main>

    <footer v-if="!hidePagination" class="List__footer mb-2">
      <Pagination
        :per-page="paginationList.perPage"
        :current-page="paginationList.currentPage"
        :total-rows="paginationList.totalRows"
        @change="onInputPagination"
      />
    </footer>
  </div>
</template>

<script setup lang="ts">
import Pagination from '../Pagination.vue'

// 1. Define TypeScript interfaces for your strongly-typed props
interface PaginationList {
  perPage: number
  currentPage: number
  totalRows: number
}

interface Props {
  hidePagination?: boolean
  width?: string
  items?: any[] // Replace 'any' with your actual Item type if available
  paginationList?: PaginationList
}

// 2. Define Props with Vue 3 compiler-macro defaults
withDefaults(defineProps<Props>(), {
  hidePagination: false,
  width: 'auto',
  items: () => [],
  paginationList: () => ({
    perPage: 10,
    currentPage: 1,
    totalRows: 0
  })
})

// 3. Define modern Emit macro
const emit = defineEmits<{
  (e: 'change-page', page: number): void
}>()

const onInputPagination = (page: number): void => {
  emit('change-page', page)
}
</script>

<style lang="css">
.List {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.layout-header {
  flex-shrink: 0;
}

.layout-body {
  flex-grow: 1;
  overflow-y: auto;
}

/* Updated Footer to handle centering */
.List__footer {
  position: absolute;
  bottom: 16px; /* Margin from the bottom frame edge */
  left: 51%; /* Dead center alignment trick */
  transform: translateX(-50%);
  z-index: 10; /* Floating directly above scrolling items */

  /* Flex centering setup inside the layout block itself */
  display: flex;
  justify-content: center;
  align-items: center;

  /* Optional styling: Add a soft background/shadow so text underneath doesn't blend */
  background: var(--clr-white, #ffffff);
  padding: 6px 12px;
  border-radius: 30px; /* Gives it a neat pill container look */
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
}

.items :deep(.item.active) {
  background: white;
  box-shadow:
    inset 3px 0px #343a40,
    inset 0px 1px 0px #343a4063;
}
.List__footer .Pagination .pagination li.page-item > .page-link {
  border: none;
}
</style>
