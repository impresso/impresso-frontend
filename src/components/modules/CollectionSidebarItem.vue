<template lang="html">
  <div class="collection-sidebar-item py-3 px-3 bt" v-on:click="click">
    <h2 class="title">{{collection.name}}</h2>
    <div class="details two">
      <div class="detail">
        <span class="muted">Created</span><br>
        <strong>{{collection.creationDate}}</strong>
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
@import "./../../assets/less/color.less";

.collection-sidebar-item {
    transition: background-color 500ms;
    float:left;
    width: 100%;
    border-bottom: 5px solid transparent;
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
        border-bottom: 5px solid @impresso-yellow;
        //box-shadow: inset 0 -5px 0px 5px @impresso-yellow;
        cursor: pointer;
    }
}
</style>
