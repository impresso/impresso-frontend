<template lang="html">
  <section>
    <icon name="flash"/>
    {{suggestion.entity.name}}
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
};
</script>

<style scoped lang="less">
</style>
