<template>
  <!--
    The wrapper is NOT focusable itself (no tabindex). Clicking anywhere on it
    delegates focus to the real <input>, and :focus-within draws the focus ring.
  -->
  <div
    class="tags-input form-control h-auto"
    :class="{ 'is-disabled': disabled }"
    @click="onContainerClick"
  >
    <ul class="tags-input__list">
      <li
        v-for="(tag, index) in value"
        :key="tag"
        :title="tag"
        class="tags-input__tag"
        :style="getTagStyle(tag, index)"
      >
        <span class="tags-input__tag-label">{{ tag }}</span>
        <button
          type="button"
          class="tags-input__tag-remove"
          :aria-label="`Remove tag ${tag}`"
          :disabled="disabled"
          @click.stop="removeTag(tag)"
        >
          <Icon name="cross" :stroke-width="2" :height="14" :width="14" />
        </button>
      </li>

      <li class="tags-input__field">
        <input
          ref="inputRef"
          v-model.trim="draft"
          type="text"
          class="tags-input__input"
          :placeholder="placeholder"
          :disabled="disabled"
          enterkeyhint="enter"
          @keydown.enter.prevent="addTag"
          @keydown.backspace="onBackspace"
          @blur="addTag"
        />
        <button
          v-if="draft.length > 0"
          type="button"
          class="btn btn-sm btn-outline-secondary tags-input__add"
          :disabled="isAddDisabled"
          @mousedown.prevent
          @click="addTag"
        >
          Add
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { PropType, computed, ref } from 'vue'
import Icon from './Icon.vue'

/**
 * Colors for a tag. A plain string is used as the background and the text
 * color is picked automatically (black or white) for readable contrast.
 */
type TagColor = string | { backgroundColor?: string; color?: string }
type TagColorResolver = (tag: string, index: number) => TagColor | undefined | null

const props = defineProps({
  value: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  disabled: Boolean,
  placeholder: String,
  /**
   * Either a function `(tag, index) => color` (e.g. wrapping your d3 scale)
   * or a record `{ [tag]: color }`. Tags without a color stay grey.
   */
  colors: {
    type: [Function, Object] as PropType<TagColorResolver | Record<string, TagColor>>,
    default: undefined
  }
})

const emit = defineEmits<{
  (e: 'input', value: string[]): void
}>()

// Returns black or white depending on the background luminance (WCAG relative luminance).
// Handles #rgb, #rrggbb and rgb()/rgba() strings, which covers d3 scales' output
// (e.g. d3.schemeTableau10, d3.interpolateViridis). Anything else falls back to white.
const readableTextColor = (background: string): string => {
  let r: number, g: number, b: number
  const hex = background.trim().match(/^#([\da-f]{3}|[\da-f]{6})$/i)
  if (hex) {
    const h = hex[1].length === 3 ? hex[1].replace(/./g, c => c + c) : hex[1]
    ;[r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16))
  } else {
    const rgb = background.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i)
    if (!rgb) return '#fff'
    ;[r, g, b] = [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])]
  }
  const channel = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const luminance = 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
  return luminance > 0.5 ? '#000' : '#fff'
}

// Sets CSS custom properties; the stylesheet falls back to grey when they are absent.
const getTagStyle = (tag: string, index: number) => {
  const resolved =
    typeof props.colors === 'function' ? props.colors(tag, index) : props.colors?.[tag]
  if (!resolved) return undefined
  const { backgroundColor, color } =
    typeof resolved === 'string' ? { backgroundColor: resolved, color: undefined } : resolved
  return {
    ...(backgroundColor && {
      '--tag-bg': backgroundColor,
      '--tag-color': color ?? readableTextColor(backgroundColor)
    }),
    ...(!backgroundColor && color && { '--tag-color': color })
  }
}

const draft = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

const isAddDisabled = computed(
  () => props.disabled || draft.value.length === 0 || props.value.includes(draft.value)
)

const addTag = () => {
  if (isAddDisabled.value) return
  emit('input', [...props.value, draft.value])
  draft.value = ''
}

const removeTag = (tag: string) => {
  emit(
    'input',
    props.value.filter(t => t !== tag)
  )
  inputRef.value?.focus()
}

// Backspace in an empty field removes the last tag, like most tag inputs.
const onBackspace = () => {
  if (draft.value.length === 0 && props.value.length > 0) {
    emit('input', props.value.slice(0, -1))
  }
}

// Clicking the padding, the gaps between tags, etc. focuses the input.
// Clicks on interactive children (remove / add buttons, the input) keep their own behaviour.
const onContainerClick = (event: MouseEvent) => {
  if (props.disabled) return
  const target = event.target as HTMLElement
  if (target.closest('button, input')) return
  inputRef.value?.focus()
}

defineExpose({ focus: () => inputRef.value?.focus() })
</script>

<style scoped>
.tags-input {
  padding: var(--spacing-2);
  border-top-left-radius: var(--impresso-border-radius-sm);
  border-bottom-left-radius: var(--impresso-border-radius-sm);
  border-left-color: var(--impresso-color-black);
  border-top-color: var(--impresso-color-black);
  border-bottom-color: var(--impresso-color-black);
  cursor: text;
}

/* Focus ring follows the real input, so it appears whenever the user is "in" the control */
.tags-input:focus-within {
  border-color: var(--impresso-color-black);
  box-shadow: 0 0 0 0.15rem rgb(0 0 0 / 0.15);
}

.tags-input.is-disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.tags-input__list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-1);
  margin: 0;
  padding: 0;
  list-style: none;
}

.tags-input__tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  max-width: 100%;
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--impresso-border-radius-xs);
  background: var(--tag-bg, var(--bs-secondary, #6c757d));
  color: var(--tag-color, #fff);
  font-size: 0.875rem;
  line-height: 1.2;
}

.tags-input__tag-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tags-input__tag-remove {
  display: inline-flex;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  opacity: 0.75;
  cursor: pointer;
}

.tags-input__tag-remove:hover:not(:disabled),
.tags-input__tag-remove:focus-visible {
  opacity: 1;
}

.tags-input__tag-remove:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
  border-radius: 2px;
}

.tags-input__field {
  display: flex;
  flex: 1 1 8rem;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 8rem;
}

.tags-input__input {
  flex: 1 1 auto;
  min-width: 0;
  padding: 0;
  margin: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
}

.tags-input__add {
  padding-block: 0;
  font-size: 0.875rem;
}
</style>
