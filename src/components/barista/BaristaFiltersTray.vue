<template>
  <section
    class="BaristaFiltersTray"
    :class="[`BaristaFiltersTray--${props.variant}`, { 'is-open': isBodyVisible }]"
  >
    <div v-if="props.variant === 'bar'" class="BaristaFiltersTray__bar">
      <button
        type="button"
        class="BaristaFiltersTray__toggle"
        :aria-expanded="isOpen"
        :aria-controls="bodyId"
        @click="isOpen = !isOpen"
      >
        <span class="small-caps">{{ $t('filters') }}</span>
        <span class="BaristaFiltersTray__count" :class="{ 'is-empty': !count }">{{ count }}</span>
        <Icon name="chevron" :scale="0.6" :stroke-width="2" class="BaristaFiltersTray__chevron" />
      </button>
      <button
        type="button"
        class="btn btn-sm btn-outline-secondary border border-dark BaristaFiltersTray__apply"
        :disabled="!canApply"
        @click="emit('apply')"
      >
        {{ $t('apply') }}
      </button>
    </div>

    <div v-if="isBodyVisible" :id="bodyId" class="BaristaFiltersTray__body">
      <p class="BaristaFiltersTray__summary" :class="{ 'is-pending': canApply }" role="status">
        <template v-if="!count">{{ $t('summary.empty') }}</template>
        <template v-else-if="!canApply">{{ $t('summary.same') }}</template>
        <template v-else>
          <span v-if="diff.added">{{ $t('summary.added', { n: diff.added }, diff.added) }}</span>
          <span v-if="diff.added && diff.removed"
            >, {{ $t('summary.removed', { n: diff.removed }) }}</span
          >
          <span v-else-if="diff.removed">
            {{ $t('summary.removedOnly', { n: diff.removed }, diff.removed) }}
          </span>
        </template>
      </p>
      <SearchPills
        v-if="count"
        disable-reset
        :filters="props.filtersWithItems"
        @changed="emit('changed', $event)"
      />
      <BFormCheckbox
        switch
        v-model="baristaStore.sendCurrentFilters"
        class="BaristaFiltersTray__share"
      >
        {{ $t('share') }}
      </BFormCheckbox>
    </div>

    <div v-if="props.variant === 'panel'" class="BaristaFiltersTray__footer">
      <button
        type="button"
        class="btn btn-sm btn-outline-secondary border border-dark BaristaFiltersTray__apply"
        :disabled="!canApply"
        @click="emit('apply')"
      >
        {{ $t('apply') }}
      </button>
      <button
        v-if="count"
        type="button"
        class="btn btn-sm btn-transparent BaristaFiltersTray__clear"
        @click="emit('changed', [])"
      >
        {{ $t('clear') }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import type { Filter } from '@/models'
import Icon from '@/components/base/Icon.vue'
import SearchPills from '@/components/SearchPills.vue'
import BFormCheckbox from '@/components/legacy/bootstrap/BFormCheckbox.vue'
import { useBaristaStore } from '@/stores/barista'
import { getVisibleFilters } from '@/composables/useBaristaSuggestedFilters'

export interface BaristaFiltersTrayProps {
  /** Filters suggested by Barista */
  suggestedFilters?: Filter[]
  /** Same filters joined with their items, as expected by SearchPills */
  filtersWithItems?: Filter[]
  /** Filters of the current search, used to tell what applying will change */
  currentFilters?: Filter[]
  /** `bar`: collapsible strip for the compact window. `panel`: always open, actions pinned at the bottom */
  variant?: 'bar' | 'panel'
  defaultOpen?: boolean
}

const props = withDefaults(defineProps<BaristaFiltersTrayProps>(), {
  suggestedFilters: () => [],
  filtersWithItems: () => [],
  currentFilters: () => [],
  variant: 'bar',
  defaultOpen: false
})

const emit = defineEmits<{
  changed: [filters: Filter[]]
  apply: []
}>()

const baristaStore = useBaristaStore()
const isOpen = ref(props.defaultOpen)
const bodyId = `barista-filters-${useId()}`

const isBodyVisible = computed(() => props.variant === 'panel' || isOpen.value)

const filterKey = (filter: Filter) =>
  JSON.stringify([
    filter.type,
    filter.context ?? 'include',
    filter.op ?? 'OR',
    filter.precision ?? null,
    ([] as unknown[])
      .concat(filter.q ?? [])
      .map(String)
      .sort()
  ])

const diff = computed(() => {
  const suggested = new Set(getVisibleFilters(props.suggestedFilters).map(filterKey))
  const current = new Set(getVisibleFilters(props.currentFilters).map(filterKey))
  return {
    added: [...suggested].filter(key => !current.has(key)).length,
    removed: [...current].filter(key => !suggested.has(key)).length
  }
})

const count = computed(() => getVisibleFilters(props.suggestedFilters).length)
const canApply = computed(() => count.value > 0 && (diff.value.added > 0 || diff.value.removed > 0))
</script>

<i18n lang="json">
{
  "en": {
    "filters": "Filters",
    "clear": "Clear all",
    "apply": "Apply to search",
    "summary": {
      "empty": "Filters Barista builds for you appear here, ready to apply to your search.",
      "same": "These filters match your current search.",
      "added": "Applying adds {n} filter to your search | Applying adds {n} filters to your search",
      "removed": "removes {n}",
      "removedOnly": "Applying removes {n} filter from your search | Applying removes {n} filters from your search"
    },
    "share": "Share my current search filters with Barista"
  }
}
</i18n>

<style>
/* positioned above following content so pill dropdowns overlap it instead of being clipped */
.BaristaFiltersTray {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  background-color: var(--impresso-color-white);
}
.BaristaFiltersTray__bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  padding: 0.375rem 0.75rem;
}
.BaristaFiltersTray__toggle {
  all: unset;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
  margin-right: auto;
  padding: 0.125rem 0;
  cursor: pointer;
  color: var(--impresso-color-black);
}
.BaristaFiltersTray__toggle:focus-visible {
  outline: 2px solid var(--impresso-color-black);
  outline-offset: 2px;
  border-radius: var(--border-radius-sm);
}
.BaristaFiltersTray__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.125rem;
  height: 1.125rem;
  padding: 0 0.25rem;
  border: 1px solid var(--impresso-color-black);
  border-radius: var(--border-radius-sm);
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.BaristaFiltersTray__count.is-empty {
  border-color: var(--clr-grey-600);
  color: var(--clr-grey-300);
}
.BaristaFiltersTray__chevron {
  transition: transform 0.2s ease;
}
.BaristaFiltersTray.is-open .BaristaFiltersTray__chevron {
  transform: rotate(180deg);
}
.btn.BaristaFiltersTray__apply {
  flex: 0 0 auto;
  white-space: nowrap;
}
.btn.BaristaFiltersTray__apply:hover:not(:disabled),
.btn.BaristaFiltersTray__apply:active:not(:disabled) {
  background-color: var(--impresso-color-black);
  color: var(--impresso-color-white);
}
.BaristaFiltersTray__body {
  padding: 0.25rem 0.75rem 0.75rem;
}
.BaristaFiltersTray__summary {
  margin: 0 0 0.625rem;
  font-size: 0.8125rem;
  line-height: 1.45;
  color: var(--clr-grey-300);
  text-wrap: pretty;
}
.BaristaFiltersTray__summary.is-pending {
  color: var(--impresso-color-black);
}
.BaristaFiltersTray__body .search-pills {
  gap: 0.25rem;
}
.BaristaFiltersTray__body .search-pill,
.BaristaFiltersTray__body .search-pills .btn {
  margin: 0 !important;
}
.BaristaFiltersTray__body .search-pill span.label {
  max-width: 13rem;
}
.BaristaFiltersTray__body .search-pills .sp-contents {
  width: 18rem;
}
.BaristaFiltersTray__share {
  margin-top: 0.875rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--clr-grey-800);
  font-size: 0.8125rem;
  color: var(--clr-grey-200);
}

/* panel: fills its column, apply pinned at the bottom */
.BaristaFiltersTray--panel {
  height: 100%;
  min-height: 0;
}
.BaristaFiltersTray--panel .BaristaFiltersTray__body {
  flex: 1 1 auto;
  padding: 0;
}
.BaristaFiltersTray__footer {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 0 0 auto;
  padding-top: 0.75rem;
  border-top: 1px solid var(--clr-grey-700);
}
.BaristaFiltersTray__footer .btn.BaristaFiltersTray__apply {
  width: 100%;
  min-height: 2.25rem;
}
.btn.BaristaFiltersTray__clear {
  align-self: center;
  color: var(--clr-grey-300);
}
.btn.BaristaFiltersTray__clear:hover {
  color: var(--impresso-color-black);
}
@media (prefers-reduced-motion: reduce) {
  .BaristaFiltersTray__chevron {
    transition: none;
  }
}
</style>
