<template>
  <section
    class="i-layout-section"
    :class="{
      'border-left': main,
      collapsed: isCollapsed,
      'auto-width': width === 'auto' && !main
    }"
    :style="style"
  >
    <button
      v-if="collapsible"
      type="button"
      class="toggle"
      :aria-expanded="!isCollapsed"
      :aria-label="isCollapsed ? 'Expand section' : 'Collapse section'"
      @click="isCollapsed = !isCollapsed"
    >
      <span class="toggle-icon" :class="{ flipped: isCollapsed }">‹</span>
    </button>

    <div v-if="$slots.header" class="header" :class="{ scroll: scrollTop > 0 }">
      <slot name="header" />
    </div>

    <div ref="bodyRef" class="body" :class="variant">
      <slot />
    </div>

    <div v-if="$slots.footer" class="footer">
      <slot name="footer" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, type CSSProperties } from 'vue'

/*
<i-layout-section width="400px" />
*/

interface Props {
  main?: boolean
  width?: string
  variant?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  main: false,
  width: 'auto',
  variant: '',
  collapsible: false,
  defaultCollapsed: false
})

const emit = defineEmits<{
  scroll: [payload: { scrollTop: number }]
}>()

const bodyRef = ref<HTMLDivElement | null>(null)
const scrollTop = ref(0)
const isCollapsed = ref(props.defaultCollapsed)

const style = computed<CSSProperties>(() => {
  if (props.main) {
    // main always grows to fill remaining space; an explicit width
    // (if given) only caps how far it can grow, it never fixes the size
    return {
      flex: '1 1 0%',
      minWidth: 0,
      maxWidth: props.width !== 'auto' ? props.width : 'none'
    }
  }
  if (props.width === 'auto') {
    return { flex: '0 1 auto' }
  }
  return {
    flex: `0 0 ${props.width}`,
    maxWidth: props.width
  }
})

function onScroll() {
  if (!bodyRef.value) return
  scrollTop.value = bodyRef.value.scrollTop
  emit('scroll', { scrollTop: scrollTop.value })
}

onMounted(() => {
  bodyRef.value?.addEventListener('scroll', onScroll)
})

onBeforeUnmount(() => {
  bodyRef.value?.removeEventListener('scroll', onScroll)
})
</script>

<style scoped lang="scss">
section.i-layout-section {
  position: relative;
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: min-content auto min-content;
  grid-template-areas: 'header' 'body' 'footer';
  height: 100%;
  background-color: transparent;
  transition:
    max-width 0.2s ease-in-out,
    flex-basis 0.2s ease-in-out;

  &.auto-width {
    max-width: 100%;
  }

  @media (min-width: 576px) {
    &.auto-width {
      max-width: 320px;
    }
  }

  @media (min-width: 768px) {
    &.auto-width {
      max-width: 260px;
    }
  }

  @media (min-width: 992px) {
    &.auto-width {
      max-width: 300px;
    }
  }

  @media (min-width: 1200px) {
    &.auto-width {
      max-width: 300px;
    }
  }

  @media (min-width: 1400px) {
    &.auto-width {
      max-width: 360px;
    }
  }

  > .toggle {
    display: none;
  }

  > .header {
    grid-area: header;
    position: relative;
    background-color: transparent;

    &::after {
      content: '';
      position: absolute;
      bottom: -4px;
      height: 5px;
      left: 0;
      right: 0;
      pointer-events: none;
      z-index: 2;
      opacity: 0.25;
      background: linear-gradient(0deg, rgba(255, 255, 255, 0) 0%, rgba(198, 204, 210, 0.21) 100%);
      border-top: 1px solid #c6ccd2;
      transition: opacity 0.2s ease-in-out;
    }

    &.scroll::after {
      opacity: 1;
    }
  }

  > .body {
    grid-area: body;
    overflow-y: auto;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  > .footer {
    grid-area: footer;
  }

  @media (max-width: 768px) {
    > .toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 8px;
      right: -14px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 1px solid #c6ccd2;
      background-color: #fff;
      cursor: pointer;
      z-index: 3;
      padding: 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    }

    > .toggle .toggle-icon {
      display: inline-block;
      font-size: 16px;
      line-height: 1;
      transition: transform 0.2s ease-in-out;
    }

    > .toggle .toggle-icon.flipped {
      transform: rotate(180deg);
    }

    &.collapsed {
      flex: 0 0 32px !important;
      max-width: 32px !important;
      overflow: hidden;
    }
  }
}
</style>
