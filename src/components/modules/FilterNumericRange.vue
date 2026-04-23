<template>
  <div class="FilterNumericRange d-flex align-items-center">
    <BFormInput v-model="startInputModel" type="number" class="px-2 py-0 rounded-sm"></BFormInput>
    <div class="mx-2 text-small">{{ $t('and') }}</div>
    <BFormInput v-model="endInputModel" type="number" class="px-2 py-0 rounded-sm"></BFormInput>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BFormInput from '@/components/legacy/bootstrap/BFormInput.vue'

export interface FilterNumericRangeProps {
  start?: number
  end?: number
}

export interface FilterNumericRangeChangedPayload {
  item: {
    start: number
    end: number
  }
  q: [string, string]
}

const props = defineProps<FilterNumericRangeProps>()

const emit = defineEmits<{
  (e: 'changed', payload: FilterNumericRangeChangedPayload): void
}>()

const toNumber = (value: unknown): number => {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : 0
}

// Keep numeric state in this component; convert only at the input boundary because
// BFormInput emits string values even with type="number".
const startValue = ref<number>(toNumber(props.start))
const endValue = ref<number>(toNumber(props.end))

const startInputModel = computed<string>({
  get: () => String(startValue.value),
  set: value => {
    startValue.value = toNumber(value)
  }
})

const endInputModel = computed<string>({
  get: () => String(endValue.value),
  set: value => {
    endValue.value = toNumber(value)
  }
})

const range = computed<[string, string]>(() => [String(startValue.value), String(endValue.value)])

watch(
  range,
  () => {
    emit('changed', {
      item: { start: startValue.value, end: endValue.value },
      q: range.value
    })
    console.info('[FilterNumericRange] range changed:', range.value)
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
label {
  font-variant: none;
}
</style>
