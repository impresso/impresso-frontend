<template>
  <div class="AudioProgressBar" :class="{ disabled: disabled }">
    <!-- Background bars -->
    <div class="progress-bar-background"></div>
    <div class="progress-bar" :style="computedStyle"></div>
    <div class="progress-buffer-bar" :style="computedBufferStyle"></div>

    <!-- User-seekable input -->
    <input
      type="range"
      :min="startTime"
      :step="step"
      :max="duration"
      v-model="sliderValue"
      @mousedown="isDragging = true"
      @mouseup="handleSeekCommit"
      @touchstart="isDragging = true"
      @touchend="handleSeekCommit"
      class="progress-bar-input"
      :disabled="disabled"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

export interface AudioProgressBarProps {
  startTime?: number
  currentTime: number
  duration: number
  step?: number
  isPlaying?: boolean
  disabled?: boolean
}
const props = withDefaults(defineProps<AudioProgressBarProps>(), {
  startTime: 0,
  currentTime: 0,
  duration: 1,
  step: 0.01,
  isPlaying: false,
  disabled: false,
})

const emit = defineEmits<{
  timeupdate: [time: number]
}>()

// Local slider value
const sliderValue = ref(props.currentTime)
const isDragging = ref(false)

// Sync local value with prop unless dragging
watch(
  () => props.currentTime,
  (val) => {
    if (!isDragging.value) {
      sliderValue.value = val
    }
  }
)

// Commit seek when user releases slider
function handleSeekCommit() {
  isDragging.value = false
  emit('timeupdate', sliderValue.value)
}

// Progress bar fill
const computedStyle = computed(() => {
  return {
    width: `${
      ((sliderValue.value - props.startTime) / props.duration) * 100 || 0
    }%`,
    backgroundColor: props.isPlaying ? '#007bff' : '#ccc',
  }
})

// Optional: buffer bar stub
const computedBufferStyle = computed(() => {
  return {
    backgroundColor: 'red',
    width: '0%', // or a calculated width later
  }
})
</script>

<style>
.AudioProgressBar {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
}
.AudioProgressBar .progress-bar-background {
  position: absolute;
  height: 6px;
  width: 100%;
  background-color: var(--clr-grey-500, grey) !important;
  pointer-events: none;
  border-radius: 3px;
  z-index: -1;
}
.AudioProgressBar .progress-bar {
  position: absolute;
  height: 6px;
  background-color: var(--impresso-color-black, blue) !important;
  pointer-events: none;
  border-radius: 3px;
  transition: none !important;
  z-index: 2;
}
.AudioProgressBar .progress-buffer-bar {
  position: absolute;
  height: 6px;
  background-color: var(--impresso-color-yellow, red) !important;
  pointer-events: none;
  border-radius: 3px;
  transition: none !important;
  z-index: 1;
}
.AudioProgressBar .progress-bar-input {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  appearance: none;
  background: #ddd;
  outline: none;
  cursor: pointer;
}

.AudioProgressBar .progress-bar-input::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--impresso-color-black, blue);
  cursor: pointer;
  transition: left 0.2s ease, transform 0.2s ease;
  box-shadow: 0 0 0 4px var(--impresso-color-black-alpha-20, blue);
}

.AudioProgressBar .progress-bar-input::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--impresso-color-black, blue);
  cursor: pointer;
  border: none;
  transition: left 0.2s ease, transform 0.2s ease;

  box-shadow: 0 0 0 4px var(--impresso-color-black-alpha-20, blue);
}

.AudioProgressBar.disabled .progress-bar-input {
  cursor: not-allowed;
  opacity: 0;
}
</style>
