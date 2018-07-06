<template lang="html">
  <div class="collection-sidebar-item py-3 px-3 bb" v-on:click="click">
    <h1 class="collection-name">{{collection.name}}</h1>
    <div class="collection-date">{{$d(collection.lastModifiedDate, 'numeric')}}</div>
    <p class="collection-description">
      {{collection.description}}
    </p>
    <div class="collection-meta">
      <span v-bind:class="{muted: collection.countIssues === 0}">{{collection.countIssues}} <i>issues</i></span>
      <span v-bind:class="{muted: collection.countArticles === 0}">{{collection.countArticles}} <i>articles</i></span>
      <span v-bind:class="{muted: collection.countPages === 0}">{{collection.countPages}} <i>pages</i></span>
      <span v-bind:class="{muted: collection.countEntities === 0}">{{collection.countEntities}} <i>entities</i></span>
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

    font-size: 12px;
    color: rgba(0,0,0,0.8);

    .collection-name {
      float:left;
      width:80%;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .collection-date {
      float:right;
      width:20%;
      text-align: right;
      color: rgba(0,0,0,0.3);
      font-weight: bold;
    }
    .collection-description {
      clear:both;
    }
    .collection-meta {
      span {
        text-transform: uppercase;
        font-weight: 500;
        letter-spacing: 0.05em;
        font-size: 11px;
        display: inline-block;
        padding-right: 1em;
        i {
          color: rgba(0,0,0,0.3);
          font-style: normal;
        }
      }
      .muted{
        opacity: 0.2;
      }
    }
    .collection-meta:before {
      content: '';
      display: block;
      width: 50px;
      height: 1px;
      background: rgba(0,0,0,0.2);
      margin: 0.6rem 0;
    }

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

    background-color: #f4f5f6;
    &:hover, &.active {
        background-color: white;
        cursor: pointer;
    }
}
</style>
