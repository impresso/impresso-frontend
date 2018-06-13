<template lang="html">
  <div class="collection-sidebar-item py-2 px-3 bb" v-on:click="click">
    <h1 class="text-serif font-weight-bold font-size-lg">{{collection.name}}</h1>
    <div class="details two">
      <div class="detail">
        <span class="muted">Created</span><br>
        <strong>{{$d(collection.creationDate, 'short')}}</strong>
      </div>
      <div class="detail">
        <span class="muted">Edited</span><br>
        <strong>{{$d(collection.lastModifiedDate, 'short')}}</strong>
      </div>
    </div>
    <hr>
    <div class="details four">
      <div class="detail">
        <span class="muted">Issues</span><br>
        <strong>{{collection.countIssues}}</strong>
      </div>
      <div class="detail">
        <span class="muted">Pages</span><br>
        <strong>{{collection.countPages}}</strong>
      </div>
      <div class="detail">
        <span class="muted">Articles</span><br>
        <strong>{{collection.countArticles}}</strong>
      </div>
      <div class="detail">
        <span class="muted">Entities</span><br>
        <strong>{{collection.countEntities}}</strong>
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
        grid-template-rows: auto;
        &.four{
          grid-template-columns: repeat(4, 1fr);
        }

        &.two{
          grid-template-columns: repeat(2, 1fr);
        }

        .muted{
          opacity: .5;
          font-size: smaller;
        }
    }

    &:hover, &.active {
        background-color: #eee;
        cursor: pointer;
    }
}
</style>
