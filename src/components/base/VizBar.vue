<template lang="html">
  <div v-b-tooltip.hover.right :title="toolTitle" class="w-100">

      <div>
        <item-label :item="item" :type="type" />
        <item-selector :uid="uid" :item="item" :type="type"/>
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
      let title = '';
      if (this.count) title += this.$n(this.count);
      if (this.percent) title += ` (${this.$n(this.percent)}%) `;
      return title;
    },
  },
};
</script>
