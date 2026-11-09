<template>
  <div
    class="RequestsToolbar px-3 py-3 d-flex gap-3 justify-content-between align-items-center flex-wrap"
  >
    <div class="d-flex gap-2 align-items-center flex-wrap">
      <BSearchInputForm
        :key="searchInputKey"
        :model-value="term"
        :required="false"
        :placeholder="$t('searchPlaceholder')"
        :search-button-label="$t('searchButtonLabel')"
        @submit="value => emit('update:term', value)"
      />
      <button
        v-if="hasActiveFilters"
        type="button"
        class="btn btn-sm btn-outline-secondary"
        @click="emit('reset')"
      >
        {{ $t('reset') }}
      </button>
    </div>

    <div class="d-flex gap-3 align-items-center flex-wrap">
      <span
        class="small RequestsToolbar__total"
        v-html="$t('numbers.itemsGeneric', { n: $n(total) }, total)"
      ></span>

      <div class="d-flex gap-2 align-items-center">
        <span class="small text-muted">{{ $t('sortBy') }}</span>
        <i-dropdown
          :model-value="orderBy"
          :options="RequestsOrderByOptions.map(value => ({ value, text: $t(`orderBy.${value}`) }))"
          size="sm"
          variant="outline-primary"
          @update:model-value="value => emit('update:orderBy', value as RequestsOrderBy)"
        ></i-dropdown>
      </div>

      <BDropdown
        right
        size="sm"
        variant="outline-secondary"
        :text="isExporting ? $t('export.inProgress') : $t('export.label')"
      >
        <li>
          <a
            role="menuitem"
            class="dropdown-item"
            :class="{ disabled: isExporting }"
            @click="!isExporting && emit('export', 'csv')"
          >
            {{ $t('export.csv') }}
          </a>
        </li>
        <li>
          <a
            role="menuitem"
            class="dropdown-item"
            :class="{ disabled: isExporting }"
            @click="!isExporting && emit('export', 'json')"
          >
            {{ $t('export.json') }}
          </a>
        </li>
        <li class="mx-3"><hr class="dropdown-divider" /></li>
        <li class="mx-3">
          <span class="very-small text-muted">{{ $t('export.hint') }}</span>
        </li>
      </BDropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BSearchInputForm from '@/components/legacy/bootstrap/BSearchInputForm.vue'
import BDropdown from '@/components/legacy/bootstrap/BDropdown.vue'
import { RequestsOrderByOptions, type RequestsOrderBy } from '@/composables/useRequestsQuery'
import type { RequestsExportFormat } from '@/composables/useRequestsExport'

export interface RequestsToolbarProps {
  term: string
  orderBy: RequestsOrderBy
  total: number
  hasActiveFilters?: boolean
  isExporting?: boolean
}

const props = withDefaults(defineProps<RequestsToolbarProps>(), {
  hasActiveFilters: false,
  isExporting: false
})

const emit = defineEmits<{
  (e: 'update:term', value: string): void
  (e: 'update:orderBy', value: RequestsOrderBy): void
  (e: 'export', format: RequestsExportFormat): void
  (e: 'reset'): void
}>()

/**
 * `BSearchInputForm` seeds its internal state from `modelValue` once, so it has
 * to be remounted when the term is cleared from outside, for instance by the
 * reset button.
 */
const searchInputKey = ref(0)
watch(
  () => props.term,
  value => {
    if (value === '') searchInputKey.value += 1
  }
)
</script>

<i18n lang="json">
{
  "en": {
    "searchPlaceholder": "Search by requester name",
    "searchButtonLabel": "Search requests",
    "reset": "Reset filters",
    "sortBy": "Sort by",
    "orderBy": {
      "-dateLastModified": "Recently modified first",
      "dateLastModified": "Oldest modified first"
    },
    "export": {
      "label": "Export logs",
      "inProgress": "Exporting...",
      "csv": "Download as CSV",
      "json": "Download as JSON",
      "hint": "Note: this export includes every request for the current data provider, including those not shown in the current list."
    }
  }
}
</i18n>

<style>
.RequestsToolbar {
  background-color: var(--impresso-color-white);
  border-bottom: 1px solid var(--clr-grey-700);
}
.RequestsToolbar__total {
  font-variant-numeric: tabular-nums;
  color: var(--clr-grey-200);
}
</style>
