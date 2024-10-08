<template>
  <div
    class="b-form-btn-label-control dropdown b-form-datepicker btn-group wrapper"
    :lang="props.locale"
    :aria-labelledby="`${uid}-value`"
  >
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded="false"
      class="btn dropdown-toggle dropdown-toggle-no-caret"
      :class="buttonClasses"
      @click="handleClick"
      @mouseenter="isHover = true"
      @mouseleave="isHover = false"
    >
      <svg
        viewBox="0 0 16 16"
        width="1em"
        height="1em"
        focusable="false"
        role="img"
        aria-label="calendar"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        :class="iconClasses"
      >
        <g>
          <path
            d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"
          ></path>
        </g>
      </svg>
    </button>
    <input
      type="date"
      :required="props.required"
      :min="minDate"
      :max="maxDate"
      :id="`${uid}-value`"
      :value="props.modelValue"
      @input="handleInput"
      style="width: 0px; height: 0px; border: 0px; margin: 0px; padding: 0px"
      ref="dateInput"
    />
  </div>
</template>

<script setup lang="ts">
import { v4 } from 'uuid'
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: [Date, String]
  },
  locale: {
    type: String,
    default: 'en-US'
  },
  size: {
    type: String,
    default: 'md'
  },
  min: {
    type: Date
  },
  max: {
    type: Date
  },
  buttonVariant: {
    type: String,
    default: 'outline-secondary'
  },
  required: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const uid = v4()
const dateInput = ref<HTMLInputElement>()
const isHover = ref(false)

const buttonClasses = computed(() => ({
  [`btn-${props.size}`]: true,
  [`btn-${props.buttonVariant}`]: !!props.buttonVariant
}))

const iconClasses = computed(() => ({
  'bi-calendar': !isHover.value,
  'bi-calendar-fill': isHover.value,
  'b-icon': true,
  bi: true
}))

const minDate = computed(() => {
  const d = props.min
  if (d instanceof Date) {
    return d.toISOString().split('T')[0]
  }
  return undefined
})
const maxDate = computed(() => {
  const d = props.max
  if (d instanceof Date) {
    return d.toISOString().split('T')[0]
  }
  return undefined
})

const handleClick = () => {
  dateInput.value?.showPicker()
}

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  console.log('target.value', target.value)
  if (props.required && !target.value) {
    return
  }
  emit('update:modelValue', target.value)
}
</script>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
}

input[type='date']::-webkit-clear-button {
  display: none;
}
</style>
