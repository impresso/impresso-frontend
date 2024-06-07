<template lang="html">
  <div class="topic-item d-flex align-items-center">
    <div class="flex-grow-1">
      <div class='badge badge-language small-caps mr-1'>{{item.language}}</div>
      <router-link :to="{ name: 'topic', params: { topic_uid: item.uid }}" v-html="label" />
      <item-selector :uid="item.uid" :item="item" type="topic"/>
      <div class='small-caps'>{{item.model}}</div>
      <div v-if="item.matches.length" class="small mr-2 mt-1 pl-2 topic-matches">
        <span v-html="labelMatches" />
      </div>
    </div>
    <div class="px-2" @click="toggleVisualized">
      <div class="topic-visualized" :class="{ active: visualized }"><div class="icon dripicons-preview" /></div>
    </div>
  </div>
</template>

<script>
import ItemSelector from '../ItemSelector.vue';
import { mapStores } from 'pinia'
import { useTopicsStore } from '@/stores/topics'

export default {
  props: {
    item: Object,
  },
  computed: {
    ...mapStores(useTopicsStore),
    label() {
      const countlabel = this.$tc('numbers.articles', this.item.countItems, {
        n: this.$n(this.item.countItems),
      });
      return `${this.item.getHtmlExcerpt()} (${countlabel})`;
    },
    labelMatches() {
      return this.item.matches.join(' · ');
      // return this.item.matches.map(m => m.join(' · ')).join('<br>');
    },
    visualized() {
      return this.topicsStore.visualizedItemsIndex[this.item.uid] != null
    },
  },
  methods: {
    toggleVisualized() {
      if (!this.visualized) {
        this.topicsStore.addVisualizedItem(this.item);
      } else {
        this.topicsStore.removeVisualizedItem(this.item);
      }
    },
  },
  components: {
    ItemSelector,
  },
};
</script>

<style lang="scss" scoped>
.topic-matches{
  border-left: 2px solid gold;
}
.topic-visualized{
  cursor: pointer;
  width:1.25rem;
  height:1.25rem;
  text-align: center;
  & > div {
    color: #ccc;
  }
  &.active > div{
    color: blue;
  }
}
</style>
