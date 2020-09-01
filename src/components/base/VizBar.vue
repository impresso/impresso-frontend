<template>
  <div>
    <div class="d-flex">
      <div class="mr-2 small-caps" v-if="showPercent">{{ toolTitle }}</div>
      <div class="flex-grow-1">
        <item-label :item="item" :type="type" class="mr-1"/>
        <item-selector
        :uid="uid"
        :item="item"
        :type="type"
        :default-click-action-disabled="defaultClickActionDisabled"
        @click="param => $emit('click', param)"/>
      </div>
      <div v-if="count">{{ $n(count) }}</div>
    </div>
    <div class="bg-white w-100" :class="{ 'border-bottom border-dark': showBorder }">
      <div class="bg-dark viz-bar" :style="`width:${percent}%;`" />
    </div>
  </div>
</template>

<script>
import ItemLabel from '../modules/lists/ItemLabel';
import ItemSelector from '../modules/ItemSelector';

export default {
  props: {
    showBorder: Boolean,
    showPercent: Boolean,
    percent: { type: Number },
    count: { type: Number },
    uid: { type: String },
    type: { type: String },
    item: { type: Object },
    defaultClickActionDisabled: {
      type: Boolean,
      default: false
    }
  },
  components: {
    ItemSelector,
    ItemLabel,
  },
  computed: {
    /** @returns {string} */
    toolTitle() {
      const title = this.percent ? `${this.$n(this.percent)}%` : '';
      return title;
    },
  },
};
</script>
