<template lang="html">
  <section>
    <icon name="flash"/>
    {{suggestion.entity.name}}
    <span class="float-right">
      <a href="#" v-on:click.prevent="add">add</a>
      <a href="#" v-on:click.prevent="submit">submit</a>
    </span>
  </section>
</template>

<script>
import Icon from 'vue-awesome/components/Icon';
import 'vue-awesome/icons/flash';

export default {
  model: {
    prop: 'suggestion',
  },
  props: ['suggestion'],
  components: {
    Icon,
  },
  methods: {
    add() {
      this.$emit('add', this.suggestion);
    },
    submit() {
      this.$emit('submit', this.suggestion);
    },
  },
};
</script>

<style scoped lang="less">
</style>
