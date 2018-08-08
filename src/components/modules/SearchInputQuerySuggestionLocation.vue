<template lang="html">
  <section v-on:click.prevent="click">
    <icon name="map-marker"/>
    {{suggestion.entity.name}}
  </section>
</template>

<script>
import Icon from 'vue-awesome/components/Icon';
import 'vue-awesome/icons/map-marker';

export default {
  model: {
    prop: 'suggestion',
  },
  props: ['suggestion'],
  components: {
    Icon,
  },
  methods: {
    click() {
      this.$emit('click', this.suggestion);
    },
  },
};
</script>

<style scoped lang="less">
</style>
