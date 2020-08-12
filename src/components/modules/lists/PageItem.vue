<template lang="html">
  <div class="page-item p-2" :class="{ active }">
    <div class="number text-center">{{item.num}}</div>
    <img :src="item.iiifThumbnail" width="100%"/>
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
.page-item {
  cursor: pointer;
  img{
    border: 1px solid #E0E0E0;
  }
  &.active{
    background: #343a40;

    .number{
      color: white;
    }
  }
}
</style>
