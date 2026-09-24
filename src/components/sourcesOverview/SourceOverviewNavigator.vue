<template>
  <ModalDraggable
    class="SourceOverviewNavigator bg-light border border-dark rounded shadow pointer-events-auto"
    respect-boundaries
    center-on-mount
    :title="$t('sourcesOverviewNavigator.title')"
    :reduce-label="$t('sourcesOverviewNavigator.reduce')"
    :restore-label="$t('sourcesOverviewNavigator.restore')"
    handle-class="SourceOverviewNavigator__handle p-2 d-flex justify-content-between align-items-center bg-dark text-white border-bottom border-dark rounded-top gap-2"
    :zIndex="props.zIndex"
  >
    <template #header-actions>
      <icon name="dots" :scale="0.3" :stroke-width="8" class="m-1" color="white" />
    </template>
    <template #default="{ isReduced }">
      <div v-if="!isReduced" class="SourceOverviewNavigator__content flex-grow-1">
        <slot />
      </div>
      <div
        class="SourceOverviewNavigator__minimap m-2 position-relative"
        v-if="props.tooltipPosition && !isReduced"
        style="height: 200px"
        ref="minimapRef"
      >
        <Minimap
          :clientHeight="props.tooltipPosition.clientHeight"
          :clientWidth="props.tooltipPosition.clientWidth"
          :scrollHeight="props.tooltipPosition.scrollHeight"
          :scrollWidth="props.tooltipPosition.scrollWidth"
          :scrollLeft="props.tooltipPosition.scrollLeft"
          :scrollTop="props.tooltipPosition.scrollTop"
          @updateScroll="
            value => {
              emit('update:tooltipPosition', {
                ...props.tooltipPosition,
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
