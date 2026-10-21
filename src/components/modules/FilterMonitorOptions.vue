<template>
  <div class="FilterMonitorOptions">
    <template v-if="props.asDropdown">
      <b-dropdown size="sm" variant="outline-primary" class="mr-1">
        <template v-slot:button-content>
          <span v-html="$t(`contexts.${selectedContext}.${props.filter.type}`)" />
        </template>
        <b-dropdown-item
          v-for="option in contextOptions"
          :active="selectedContext === option.value"
          :key="option.value"
          v-on:click="selectedContext = option.value"
          ><span v-html="$t(option.translationKey)"></span
        ></b-dropdown-item>
      </b-dropdown>
      <!--  operator -->
      <b-dropdown size="sm" variant="outline-primary">
        <template v-slot:button-content>
          <span v-html="$t(`operators.${selectedOperator}.${selectedContext}`)" />
        </template>
        <b-dropdown-item
          v-for="option in operatorOptions"
          :active="selectedOperator === option.value"
          :key="option.value"
          v-on:click="selectOperator(option.value)"
          ><span v-html="$t(option.translationKey)"></span
        ></b-dropdown-item>
      </b-dropdown>
    </template>
    <template v-else>
      <!--  operator -->
      <label class="small-caps" v-if="showLabels">{{ $t('labels.context') }}</label>
      <b-form-group>
        <radio-group
          v-model="selectedContext"
          :options="
            contextOptions.map(({ value, translationKey }) => ({
              value,
              text: String($t(translationKey))
            }))
          "
          type="radio"
        />
      </b-form-group>
      <!--  operator -->
      <label class="small-caps" v-if="showLabels">{{ $t('labels.operator') }}</label>
      <b-form-group>
        <radio-group
          v-model="selectedOperator"
          :options="
            operatorOptions.map(({ value, translationKey }) => ({
              value,
              text: String($t(translationKey))
            }))
          "
          type="radio"
        /> </b-form-group
    ></template>
  </div>
</template>

<script setup lang="ts">
import type { FilterMonitorFilter } from '@/components/modules/FilterMonitor.vue'
import { computed } from 'vue'
import RadioGroup from '@/components/layout/RadioGroup.vue'

export type FilterOperator = NonNullable<FilterMonitorFilter['op']>

export type FilterMonitorOperatorProps = {
  /** The filter object to update */
  filter: FilterMonitorFilter
  /** Allowed operators for selection */
  operators?: FilterOperator[]
  /** Allowed contexts for selection */
  contexts?: NonNullable<FilterMonitorFilter['context']>[]
  /** Whether to display as a dropdown */
  asDropdown?: boolean
  /** Whether to show labels */
  showLabels?: boolean
}

const AllowedOperators: FilterOperator[] = ['AND', 'OR']
const AllowedContexts: NonNullable<FilterMonitorFilter['context']>[] = ['include', 'exclude']
const props = withDefaults(defineProps<FilterMonitorOperatorProps>(), {
  operators: () => ['AND', 'OR'],
  contexts: () => ['include', 'exclude'],
  asDropdown: false,
  showLabels: false
})

const emit = defineEmits<{
  (e: 'update:filter', filter: FilterMonitorFilter): void
}>()

const selectOperator = (newOp: FilterOperator) => {
  emit('update:filter', {
    ...props.filter,
    op: newOp
  })
}
// 1. Writable computed handles two-way binding for v-model:filter
const selectedOperator = computed({
  get: () => props.filter.op ?? 'AND',
  set: selectOperator
})

const selectContext = (newContext: NonNullable<FilterMonitorFilter['context']>) => {
  emit('update:filter', {
    ...props.filter,
    context: newContext
  })
}
const selectedContext = computed({
  get: () => props.filter.context ?? 'include',
  set: selectContext
})

/**
 * Return values and translation keys for the allowed operators,
 * aligned to the allowed context (indlude or exclude, see translations).
 */
const operatorOptions = computed(() => {
  return props.operators
    .filter(op => AllowedOperators.includes(op))
    .map(value => ({
      value,
      translationKey: `operators.${value}.${selectedContext.value}`
    }))
})

const contextOptions = computed(() => {
  return props.contexts
    .filter(context => AllowedContexts.includes(context))
    .map(value => ({
      value,
      translationKey: `contexts.${value}.${props.filter.type}`
    }))
})
</script>
<i18n lang="json">
{
  "en": {
    "operators": {
      "OR": {
        "include": "at least <b>one</b> of the following options (OR)",
        "exclude": "<b>any</b> of the following options (OR)"
      },
      "AND": {
        "include": "<b>all</b> of the following options (AND)",
        "exclude": "<b>all</b> of the following options (AND)"
      }
    },
    "labels": {
      "context": "Context",
      "operator": "Operator"
    },
    "contexts": {
      "include": {
        "country": "from",
        "embedding": "similar to",
        "permissionExplore": "with WebApp access:",
        "permissionGetTranscript": "<b>with</b> access",
        "permissionGetImage": "<b>with</b> facsimile access:"
      },
      "exclude": {
        "country": "<b>NOT</b> from",
        "embedding": "<b>NOT</b> similar to",
        "permissionExplore": "<b>without</b> WebApp access",
        "permissionGetTranscript": "<b>without</b> access",
        "permissionGetImage": "<b>without</b> facsimile access"
      }
    }
  }
}
</i18n>
