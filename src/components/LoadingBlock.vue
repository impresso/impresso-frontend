<template>
  <div class="LoadingBlock" :style="{ height: `${height}px` }">
    <div class="pulsating-block" :style="{ height: `${height}px` }"></div>
    <p>{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
interface LoadingBlockProps {
  label?: string
  height?: number
}
withDefaults(defineProps<LoadingBlockProps>(), {
  height: 100,
  label: 'loading...'
})
</script>

<style type="css">
.LoadingBlock {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.LoadingBlock .pulsating-block {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: var(--impresso-color-pastel-blue-alpha-20);
  border-radius: var(--impresso-border-radius-sm);
  animation: LoadingBlock_pulsate 4s infinite;
  z-index: 0;
}

@keyframes LoadingBlock_pulsate {
  0% {
    background-color: var(--impresso-color-pastel-blue-alpha-20);
    transform: scale3d(1, 1, 1);
  }
  25% {
    background-color: var(--impresso-color-yellow-alpha-30);
    transform: scale3d(1.01, 1.05, 1);
  }
  50% {
    background-color: var(--impresso-color-pastel-blue-alpha-20);
    transform: scale3d(0.98, 0.98, 1);
  }
  75% {
    background-color: var(--impresso-color-yellow-alpha-30);
    transform: scale3d(1.01, 1.05, 1);
  }
  100% {
    background-color: var(--impresso-color-pastel-blue-alpha-20);
    transform: scale3d(1, 1, 1);
  }
}

.LoadingBlock p {
  z-index: 1;
  position: relative;
  margin: 0;
}
</style>
