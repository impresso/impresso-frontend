<script setup lang="ts">
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
</script>

<template>
  <svg :width="props.radius * 2" :height="props.radius * 2" viewBox="0 0 100 100">
    <defs>
      <linearGradient :id="props.gradientId" x1="50%" y1="0%" x2="50%" y2="100%">
        <template v-for="(color, index) in props.colors" :key="index">
          <stop :offset="`${(index / props.colors.length) * 100}%`" :stop-color="color" />
          <stop
            v-if="index < props.colors.length - 1"
            :offset="`${((index + 1) / props.colors.length) * 100 - props.transitionSize}%`"
            :stop-color="color"
          />
          <stop
            v-if="index < props.colors.length - 1"
            :offset="`${((index + 1) / props.colors.length) * 100}%`"
            :stop-color="props.colors[index + 1]"
          />
        </template>
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="50" :fill="`url(#${props.gradientId})`" />
  </svg>
</template>
