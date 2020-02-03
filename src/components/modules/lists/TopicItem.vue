<template lang="html">
  <div class="topic-item d-flex align-items-center">
    <div class="flex-grow-1">
      <div class='badge small-caps'>{{item.language}}</div>
      <router-link :to="{ name: 'topic', params: { topic_uid: item.uid }}" v-html="label" />
      <item-selector :uid="item.uid" :item="item" type="topic"/>
      <div class='small-caps'>{{item.model}}</div>
    </div>
    <div class="px-2" @click="toggleVisualized">
      <div class="topic-visualized" :class="{ active: visualized }"><div class="icon dripicons-preview" /></div>

    </div>
  </div>
</template>

<script>
import ItemSelector from '../ItemSelector';

export default {
  props: {
    item: Object,
  },
  computed: {
    label() {
      const countlabel = this.$tc('numbers.articles', this.item.countItems, {
        n: this.$n(this.item.countItems),
      });
      return `${this.item.getHtmlExcerpt()} (${countlabel})`;
    },
    visualized() {
      return typeof this.$store.state.topics.visualizedItemsIndex[this.item.uid] != 'undefined';
    },
  },
  methods: {
    toggleVisualized() {
      if (!this.visualized) {
        this.$store.dispatch('topics/ADD_VISUALIZED_ITEM', this.item);
      } else {
        this.$store.dispatch('topics/REMOVE_VISUALIZED_ITEM', this.item);
      }
    },
  },
  components: {
    ItemSelector,
  },
};
</script>

<style lang="scss" scoped>
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
