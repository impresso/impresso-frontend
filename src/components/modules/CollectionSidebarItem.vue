<template lang="html">
  <div class="collection-sidebar-item py-2 px-3 bb" v-on:click="click">
    <h1 class="text-serif font-weight-bold font-size-lg">{{collection.label}}</h1>
    <div class="details">
      <div class="detail">
        Named Entities<br>
        <strong>{{collection.countEntities}}</strong>
      </div>
      <div class="detail">
        Articles<br>
        <strong>{{collection.countArticles}}</strong>
      </div>
    </div>
  </div>
</template>

<script>
import '@/assets/less/style.less';
import Collection from '@/models/Collection';

export default {
  model: {
    prop: 'collection',
  },
  props: {
    collection: {
      type: Collection,
      default: new Collection(),
    },
  },
  methods: {
    click() {
      this.$emit('click');
    },
  },
};
</script>

<style scoped lang="less">
.collection-sidebar-item {
    transition: background-color 500ms;

    .details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto;
    }

    &:hover, &.active {
        background-color: #eee;
        cursor: pointer;
    }
}
</style>
