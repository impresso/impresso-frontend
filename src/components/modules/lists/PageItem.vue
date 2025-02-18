<template>
  <div class="page-item" :class="{ active: props.active }">
    <div class="number text-center position-absolute">{{ props.item.num }}</div>
    <AuthImg :src="props.item.getIiifThumbnail({ dim: 30 })" width="100%" />
  </div>
</template>

<script setup lang="ts">
import AuthImg from '@/components/AuthImg.vue'
import Page from '@/models/Page'

const props = defineProps<{ active: boolean; item: Page }>()
</script>

<style lang="scss" scoped>
@use 'sass:math';
$size: 1.5rem;

.page-item {
  position: relative;
  cursor: pointer;
  img {
    border: 1px solid #e0e0e0;
  }
  .number {
    position: absolute;
    width: $size;
    height: $size;
    left: 50%;
    top: 50%;
    margin-top: math.div(-$size, 2);
    margin-left: math.div(-$size, 2);
    color: #c6ccd2;
    text-align: center;
    line-height: $size;
    border-radius: $size;
    background: inherit;
    opacity: 0;
    transition: opacity 0.3s ease-in;
  }
  &:hover .number,
  &.active .number {
    opacity: 1;
  }
  &.active {
    box-shadow: 0px -2px 0 0px #ffeb78;
    background: black !important;
    .number {
      color: white;
    }
  }
}
.page-item.bg-dark {
  .number {
    color: #c6ccd2;
  }
  &.active {
    box-shadow: 0px -2px 0 0px #ffeb78;
    background: black !important;
    .number {
      color: white;
    }
  }
}
</style>
