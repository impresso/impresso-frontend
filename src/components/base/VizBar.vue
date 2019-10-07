<template lang="html">
  <div class="">
    <b-badge variant="none" class="p-0 position-absolute"
      <router-link v-if="linkto" :to="linkto">
        {{ label }}
        <span class="text-muted">({{percent}}%)</span>
      </router-link>
      <span v-else>{{ label }} <span class="text-muted">({{percent}}%)</span></span>
      <item-selector :uid="uid" :item="item" :type="type"/>

      <div class="bg-white position-relative">
        <div class="bg-accent-secondary viz-bar"
          :style="`width:${percent}%;`" />
      </div>
    </b-badge>
  </div>
</template>

<script>
import ItemSelector from '../modules/ItemSelector';

export default {
  props: ['label', 'linkto', 'uid', 'percent', 'uid', 'type', 'item'],
  components: {
    ItemSelector,
  },
};
</script>

<style lang="css">
.viz-bar {
  height: 2px;
}
</style>
