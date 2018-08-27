<template lang="html">
  <section v-on:click.prevent="click">
    <icon v-bind:name="icon"/>
    {{suggestion.entity.name}}
  </section>
</template>

<script>
import Icon from 'vue-awesome/components/Icon';
import 'vue-awesome/icons/map-marker';
import 'vue-awesome/icons/user-circle';

export default {
  model: {
    prop: 'suggestion',
  },
  props: ['suggestion'],
  computed: {
    icon: {
      get() {
        if (this.suggestion.entity.hasLabel('location')) {
          return 'map-marker';
        }
        return 'user-circle';
      },
    },
  },
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
