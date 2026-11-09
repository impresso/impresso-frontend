<template>
  <div class="SearchModeSwitch d-flex align-items-center gap-2">
    <div
      ref="root"
      class="SearchModeSwitch__root d-inline-flex position-relative rounded-pill border border-dark bg-light shadow-sm"
      :class="{ disabled: props.disabled }"
      role="radiogroup"
      :aria-disabled="props.disabled"
      :data-testid="dataTestid"
    >
      <span
        class="SearchModeSwitch__thumb rounded-pill"
        :class="{ 'SearchModeSwitch__thumb--animated': ready }"
        :style="{
          width: `${thumb.width}px`,
          transform: `translateX(${thumb.x}px)`
        }"
      ></span>
      <label
        v-for="option in availableOptions"
        :key="option.value"
        class="SearchModeSwitch__option small-caps rounded-pill text-center m-0 px-2 py-1"
        :class="{
          active: props.modelValue === option.value,
          'SearchModeSwitch__option--disabled': disabledModes.includes(option.value)
        }"
        :aria-disabled="props.disabled || disabledModes.includes(option.value)"
      >
        <input
          type="radio"
          class="SearchModeSwitch__input"
          :name="uid"
          :value="option.value"
          :checked="props.modelValue === option.value"
          :disabled="props.disabled || disabledModes.includes(option.value)"
          @change="handleChanged(option.value)"
        />
        <span class="px-1">{{ $t(option.labelKey) }}</span>
      </label>
    </div>
    <InfoButton name="how-do-search-modes-work"></InfoButton>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, useId, watch } from 'vue'
import { useFeaturesStore } from '@/stores/features'
import InfoButton from './base/InfoButton.vue'
import { useUserStore } from '@/stores/user'

export type SearchMode = 'keyword' | 'semantic' | 'prompt'

export interface SearchModeSwitchProps {
  modelValue: SearchMode
  modes?: SearchMode[]
  disabled?: boolean
  dataTestid?: string
}

const props = withDefaults(defineProps<SearchModeSwitchProps>(), {
  modes: () => ['keyword', 'semantic', 'prompt'],
  disabled: false,
  dataTestid: undefined
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: SearchMode): void
}>()
const featuresStore = useFeaturesStore()
const userStore = useUserStore()

const disabledModes = computed(() => {
  if (!userStore.isLoggedIn) {
    return ['semantic', 'prompt']
  }
  if (!featuresStore.isBaristaEnabled) {
    return ['prompt']
  }
  return []
})

const options: { value: SearchMode; labelKey: string }[] = [
  { value: 'keyword', labelKey: 'options.keyword' },
  { value: 'semantic', labelKey: 'options.semantic' },
  { value: 'prompt', labelKey: 'options.prompt' }
]
const availableOptions = computed(() =>
  options.filter(option => props.modes.includes(option.value))
)
const uid = useId()
const selectedIndex = computed(() =>
  availableOptions.value.findIndex(option => option.value === props.modelValue)
)
const root = ref<HTMLElement>()
const thumb = reactive({ x: 0, width: 0 })
const ready = ref(false)
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
  observer = new ResizeObserver(updateThumb)
  if (root.value) observer.observe(root.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})

watch(selectedIndex, updateThumb, { flush: 'post' })

const handleChanged = (value: SearchMode) => {
  if (!props.disabled && !disabledModes.value.includes(value)) {
    emit('update:modelValue', value)
  }
}
</script>

<style>
.SearchModeSwitch__root {
  --switch-pad: 2px;
  padding: var(--switch-pad);
  user-select: none;
}
.SearchModeSwitch__root.disabled {
  opacity: 0.5;
  pointer-events: none;
}
.SearchModeSwitch__thumb {
  position: absolute;
  top: var(--switch-pad);
  bottom: var(--switch-pad);
  left: 0;
  background: var(--impresso-color-black);
}
.SearchModeSwitch__thumb--animated {
  transition:
    transform 0.15s ease-in-out,
    width 0.15s ease-in-out;
}
.SearchModeSwitch__option {
  position: relative;
  z-index: 1;
  cursor: pointer;
  transition: color 0.15s ease-in-out;
}
.SearchModeSwitch__option--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.SearchModeSwitch__option.active {
  color: var(--impresso-color-white);
}
.SearchModeSwitch__option:has(input:focus-visible) {
  outline: 2px solid var(--bs-primary);
  outline-offset: 1px;
}
.SearchModeSwitch__input {
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
  .SearchModeSwitch__thumb--animated,
  .SearchModeSwitch__option {
    transition: none;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "options": {
      "keyword": "Keywords",
      "semantic": "Semantic",
      "prompt": "Prompt"
    }
  }
}
</i18n>
