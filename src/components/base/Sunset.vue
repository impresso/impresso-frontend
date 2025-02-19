<script setup lang="ts">
import { computed } from 'vue'

export interface SunsetProps {
  radius: number
  colors: string[]
  gradientId?: string
  transitionSize?: number // Optional: Controls how soft the edges are
}
const props = withDefaults(defineProps<SunsetProps>(), {
  radius: 20,
  colors: () => ['#ff0000', '#00ff00', '#0000ff'],
  gradientId: 'defaultGradient',
  transitionSize: 15 // Percentage of space used for soft edges
})

const midpoint = Math.ceil(props.colors.length / 2)

const topColors = computed(() => props.colors.slice(0, midpoint))
const bottomColors = computed(() => props.colors.slice(midpoint - 1, props.colors.length))
</script>

<template>
  <svg :width="props.radius * 2" :height="props.radius * 2" viewBox="0 0 100 100">
    <defs>
      <!-- Top Gradient -->
      <radialGradient :id="`${props.gradientId}-top`" cx="50%" cy="0%" r="150%">
        <template v-for="(color, index) in topColors" :key="index">
          <stop :offset="`${(index / (topColors.length - 1)) * 80}%`" :stop-color="color" />
        </template>
      </radialGradient>

      <!-- Bottom Gradient -->
      <radialGradient :id="`${props.gradientId}-bottom`" cx="50%" cy="100%" r="150%">
        <template v-for="(color, index) in bottomColors" :key="index">
          <stop :offset="`${(index / (bottomColors.length - 1)) * 100}%`" :stop-color="color" />
        </template>
      </radialGradient>
    </defs>
    <!-- Top Half -->
    <path d="M 0,50 A 50,50 0 1,0 100,50 Z" :fill="`url(#${props.gradientId}-bottom)`" />

    <!-- Bottom Half -->
    <path d="M 100,50 A 50,50 0 1,0 0,50 Z" :fill="`url(#${props.gradientId}-top)`" />
  </svg>
</template>
