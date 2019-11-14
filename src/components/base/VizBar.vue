<template lang="html">
  <div v-b-tooltip.hover.right :title="toolTitle" class="w-100">

    <div class="clearfix">
      <div class="float-left w-75">
        <item-label :item="item" :type="type" />
        <item-selector :uid="uid" :item="item" :type="type"/>
      </div>
      <div v-if="count" class="float-right w-25 text-right">
        {{$n(count)}}
      </div>
    </div>
    <div class="bg-white w-100">
      <div class="bg-accent-secondary viz-bar" :style="`width:${percent}%;`" />
    </div>

  </div>
</template>

<script>
import ItemLabel from '../modules/lists/ItemLabel';
import ItemSelector from '../modules/ItemSelector';

export default {
  props: ['percent', 'count', 'uid', 'type', 'item'],
  components: {
    ItemSelector,
    ItemLabel,
  },
  computed: {
    toolTitle() {
      const title = this.percent ? `${this.$n(this.percent)}%` : '';
      return title;
    },
  },
};
</script>
