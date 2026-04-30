<template>
  <ModalDraggable
    class="SourceOverviewNavigator bg-light border border-dark rounded shadow"
    :initialX="initialX"
    :initialY="initialY"
    :zIndex="zIndex"
  >
    <template #header="{ isReduced, toggleReduced }">
      <div
        class="SourceOverviewNavigator__handle p-2 d-flex justify-content-between align-items-center bg-dark text-white border-bottom border-dark rounded-top gap-2"
      >
        <span class="very-small-caps-bold">{{ $t('sourcesOverviewNavigator.title') }}</span>
        <div class="mb-1">
          <button
            type="button"
            class="SourceOverviewNavigator__toggle btn btn-sm btn-outline-light mr-2"
            :aria-label="$t(getToggleButtonLabelKey(isReduced))"
            :title="$t(getToggleButtonLabelKey(isReduced))"
            @click.stop="toggleReduced()"
          >
            {{ isReduced ? '+' : '-' }}
          </button>
          <icon name="dots" :scale="0.3" :stroke-width="8" class="m-1" color="white" />
        </div>
      </div>
    </template>
    <template #default="{ isReduced }">
      <div v-if="!isReduced" class="SourceOverviewNavigator__content flex-grow-1">
        <slot />
      </div>
      <div
        class="SourceOverviewNavigator__minimap m-2 position-relative"
        v-if="tooltipPosition && !isReduced"
        style="height: 200px"
        ref="minimapRef"
      >
        <Minimap
          :clientHeight="tooltipPosition.clientHeight"
          :clientWidth="tooltipPosition.clientWidth"
          :scrollHeight="tooltipPosition.scrollHeight"
          :scrollWidth="tooltipPosition.scrollWidth"
          :scrollLeft="tooltipPosition.scrollLeft"
          :scrollTop="tooltipPosition.scrollTop"
          @updateScroll="
            value => {
              emit('update:tooltipPosition', {
                ...tooltipPosition,
                scrollLeft: value.scrollLeft,
                scrollTop: value.scrollTop
              })
            }
          "
        >
          <slot name="minimap" />
        </Minimap>
      </div>
    </template>
  </ModalDraggable>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ModalDraggable from '@/components/ModalDraggable.vue'
import Icon from '../base/Icon.vue'
import Minimap from '../Minimap.vue'
import { TooltipPosition } from './SourcesOverviewTimeline.vue'

export interface SourceOverviewNavigatorProps {
  initialX?: number
  initialY?: number
  zIndex?: number
  tooltipPosition?: TooltipPosition | null
}

const props = withDefaults(defineProps<SourceOverviewNavigatorProps>(), {
  initialX: 0,
  initialY: 0,
  zIndex: 2,
  tooltipPosition: null
})

const emit = defineEmits<{
  (e: 'update:tooltipPosition', value: TooltipPosition): void
}>()

const minimapRef = ref<HTMLDivElement | null>(null)
const { initialX, initialY, zIndex, tooltipPosition } = props

const getToggleButtonLabelKey = (isReduced: boolean) => {
  return isReduced ? 'sourcesOverviewNavigator.restore' : 'sourcesOverviewNavigator.reduce'
}
</script>

<style>
.SourceOverviewNavigator.ModalDraggable {
  min-width: 250px;
}

.SourceOverviewNavigator.ModalDraggable.ModalDraggable--reduced {
  min-width: unset;
}

.SourceOverviewNavigator button {
  cursor: pointer;
  pointer-events: all;
}

.SourceOverviewNavigator__handle {
  height: 30px;
}
.SourceOverviewNavigator.ModalDraggable--reduced {
  border: 0 !important;
}
.SourceOverviewNavigator.ModalDraggable--reduced .SourceOverviewNavigator__handle {
  border-bottom: 0 !important;
  border-bottom-left-radius: var(--impresso-border-radius-sm) !important;
  border-bottom-right-radius: var(--impresso-border-radius-sm) !important;
  border-top-left-radius: var(--impresso-border-radius-sm) !important;
  border-top-right-radius: var(--impresso-border-radius-sm) !important;
}

.SourceOverviewNavigator__toggle {
  line-height: 1;
  min-width: 1.4rem;
}

.SourceOverviewNavigator__minimap {
  flex: 0 0 auto;
  background: #f9f9f9;
}

.SourceOverviewNavigator__tooltip-indicator {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 6px;
  height: 6px;
  background: #ff6b6b;
  border-radius: 50%;
  pointer-events: none;
  z-index: 10;
}
</style>

<i18n lang="json">
{
  "en": {
    "sourcesOverviewNavigator": {
      "title": "Navigator",
      "reduce": "Reduce navigator",
      "restore": "Restore navigator"
    }
  }
}
</i18n>
