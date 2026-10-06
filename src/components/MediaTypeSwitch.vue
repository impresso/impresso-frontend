<template>
  <div
    ref="root"
    class="MediaTypeSwitch d-inline-flex position-relative rounded-pill border bg-light shadow-sm"
    :class="{ disabled: props.disabled }"
    role="radiogroup"
    :aria-disabled="props.disabled"
    :data-testid="dataTestid"
  >
    <span
      class="MediaTypeSwitch__thumb rounded-pill"
      :class="{ 'MediaTypeSwitch__thumb--animated': ready }"
      :style="{
        width: `${thumb.width}px`,
        transform: `translateX(${thumb.x}px)`,
        background: thumbBackground
      }"
    ></span>
    <label
      v-for="option in options"
      :key="option.value"
      class="MediaTypeSwitch__option small-caps rounded-pill text-center m-0 px-2 py-1"
      :class="localValue === option.value ? 'text-white' : 'text-body'"
    >
      <input
        type="radio"
        class="MediaTypeSwitch__input"
        :name="uid"
        :value="option.value"
        :checked="localValue === option.value"
        :disabled="props.disabled"
        @change="handleChanged(option.value)"
      />
      <span>{{ $t(option.labelKey) }}</span>
    </label>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { v4 } from 'uuid'
import { MediaSource } from '@/models/generated/canonical'
import { RadioLow, RadioHigh, NewspaperLow, NewspaperHigh } from './sourcesOverview/colors'
export type MediaType = MediaSource['type'] | 'both'

export type MediaTypeSwitchColors = Partial<Record<MediaType, string>>

export interface MediaTypeSwitchProps {
  modelValue: MediaType
  disabled?: boolean
  dataTestid?: string
  colors?: MediaTypeSwitchColors
  defaultColor?: string
  debounce?: number
}

const props = withDefaults(defineProps<MediaTypeSwitchProps>(), {
  disabled: false,
  dataTestid: undefined,
  colors: () => ({
    radio_broadcast: `linear-gradient(90deg, rgb(${RadioLow.join(', ')}), rgb(${RadioHigh.join(', ')}))`, //' var(--impresso-color-vintage-purple)',
    newspaper: `linear-gradient(90deg, rgb(${NewspaperLow.join(', ')}), rgb(${NewspaperHigh.join(', ')}))`, //' var(--impresso-color-vintage-blue)',
    both: `linear-gradient(90deg, rgb(${RadioLow.join(', ')}), rgb(${RadioHigh.join(', ')}), rgb(${NewspaperLow.join(', ')}), rgb(${NewspaperHigh.join(', ')}))`
  }),
  // Bootstrap 5 variable (Bootstrap 4 used --dark)
  defaultColor: 'var(--bs-dark)',
  debounce: 500
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: MediaType): void
}>()

const options: { value: MediaType; labelKey: string }[] = [
  { value: 'radio_broadcast', labelKey: 'options.radio_broadcast' },
  { value: 'newspaper', labelKey: 'options.newspaper' },
  { value: 'both', labelKey: 'options.both' }
]

const uid = v4()
// local value gives instant visual feedback while the emitted update is debounced
const localValue = ref<MediaType>(props.modelValue)
watch(
  () => props.modelValue,
  value => {
    localValue.value = value
  }
)
const selectedIndex = computed(() => options.findIndex(option => option.value === localValue.value))

// 'both' defaults to a split gradient of the radio/newspaper colors unless explicitly overridden.
// No !important needed: the thumb no longer carries Bootstrap's bg-dark class.
const thumbBackground = computed(() => {
  const explicit = props.colors[localValue.value]
  if (explicit) return explicit
  return props.defaultColor
})

const root = ref<HTMLElement>()
const thumb = reactive({ x: 0, width: 0 })
const ready = ref(false) // enable the transition only after the first measure
let observer: ResizeObserver | undefined

const updateThumb = () => {
  const label = root.value?.querySelectorAll<HTMLElement>('label')[selectedIndex.value]
  if (!label) return
  thumb.x = label.offsetLeft
  thumb.width = label.offsetWidth
}

onMounted(async () => {
  updateThumb()
  await nextTick()
  ready.value = true
  // fires when labels change size: locale switch, font loading, container styles...
  observer = new ResizeObserver(updateThumb)
  if (root.value) observer.observe(root.value)
})
let debounceTimer: ReturnType<typeof setTimeout> | null = null
onBeforeUnmount(() => {
  observer?.disconnect()
  if (debounceTimer !== null) clearTimeout(debounceTimer)
})
watch(selectedIndex, updateThumb, { flush: 'post' })

const handleChanged = (value: MediaType) => {
  if (props.disabled) return
  localValue.value = value

  if (debounceTimer !== null) clearTimeout(debounceTimer)
  if (props.debounce > 0) {
    debounceTimer = setTimeout(() => {
      debounceTimer = null
      emit('update:modelValue', value)
    }, props.debounce)
  } else {
    emit('update:modelValue', value)
  }
}
</script>

<style>
.MediaTypeSwitch {
  --switch-pad: 2px;
  padding: var(--switch-pad);
  user-select: none;
}
.MediaTypeSwitch.disabled {
  opacity: 0.5;
  pointer-events: none;
}
.MediaTypeSwitch__thumb {
  position: absolute;
  top: var(--switch-pad);
  bottom: var(--switch-pad);
  left: 0; /* x position comes from the inline translateX */
}
.MediaTypeSwitch__thumb--animated {
  transition:
    transform 0.15s ease-in-out,
    width 0.15s ease-in-out;
}
.MediaTypeSwitch__option {
  position: relative;
  z-index: 1;
  cursor: pointer;
  transition: color 0.15s ease-in-out;
}
.MediaTypeSwitch__option:has(input:focus-visible) {
  outline: 2px solid var(--bs-primary);
  outline-offset: 1px;
}
.MediaTypeSwitch__input {
  position: absolute;
  appearance: none;
  -webkit-appearance: none;
  opacity: 0;
  width: 0;
  height: 0;
  margin: 0;
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  .MediaTypeSwitch__thumb--animated,
  .MediaTypeSwitch__option {
    transition: none;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "options": {
      "radio_broadcast": "Radio",
      "newspaper": "Newspaper",
      "both": "Both"
    }
  }
}
</i18n>
