<template lang="html">
  <div class="topic-item d-flex align-items-center">
    <div class="flex-grow-1">
      <div class='badge small-caps'>{{item.language}}</div>
      <router-link :to="{ name: 'topic', params: { topic_uid: item.uid }}" v-html="item.getHtmlExcerpt()" />
      <item-selector :uid="item.uid" :item="item" type="topic"/>
      <div class='small-caps'>{{item.model}} {{visualized}}</div>
    </div>
    <div class="px-2" @click="toggleVisualized">
      <div class="topic-visualized" :class="{ active: visualized }"><div class="icon" :class="{ 'dripicons-checkmark': visualized }" /></div>
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

<style lang="css" scoped>
.topic-visualized{
  cursor: pointer;
  color: #aaaaaa;
  border: 1px solid;
  width:1.25rem;
  height:1.25rem;
  overflow: hidden;
  text-align: center;
}
.topic-visualized > div{
  background: transparent;
  border: 1px solid transparent;
  width:1.25rem;
  height:1.25rem;
}
.topic-visualized.active{
  border-color: #343a40;
}
.topic-visualized.active > div{
  background-color: #343a40;
  color: white;
}

</style>
