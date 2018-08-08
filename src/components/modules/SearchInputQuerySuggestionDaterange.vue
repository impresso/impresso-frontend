<template lang="html">
  <section v-on:click.prevent="click">
      <icon name="calendar"/>
      {{$d(suggestion.daterange.start, 'short')}} - {{$d(suggestion.daterange.end, 'short')}}
  </section>
</template>

<script>
import Icon from 'vue-awesome/components/Icon';
import 'vue-awesome/icons/calendar';

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
