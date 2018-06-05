<template lang="html">
  <section>
    <icon name="font"/>
    {{suggestion.query}}
  </section>
</template>

<script>
import Icon from 'vue-awesome/components/Icon';
import 'vue-awesome/icons/font';

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
