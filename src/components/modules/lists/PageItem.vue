<template lang="html">
  <div class="page-item" :class="{ active }">
    <div class="number text-center position-absolute">{{item.num}}</div>
    <img :src="item.getIiifThumbnail({ dim: 30 })" width="100%"/>
  </div>
</template>

<script>
export default {
  props: {
    active: Boolean,
    item: Object,
  }
}
</script>

<style lang="scss" scoped>

$size:1.5rem;

.page-item {
  position: relative;
  cursor: pointer;
  img{
    border: 1px solid #E0E0E0;
  }
  .number{
    position: absolute;
    width: $size;
    height: $size;
    left: 50%;
    top: 50%;
    margin-top: -$size / 2;
    margin-left: -$size / 2;
    color: #c6ccd2;
    text-align: center;
    line-height: $size;
    border-radius: $size;
    background: inherit;
    opacity: 0;
    transition: opacity .3s ease-in;
  }
  &:hover .number{
    opacity: 1;
  }
}
.page-item.bg-dark{
  .number{
    color: #c6ccd2;
  }
  &.active{
    background: black !important;
    .number{
      color: white;
      opacity: 1;
    }
  }
}
</style>
