<template lang="html">
  <div class="d-inline">
    <span v-if="['newspaper', 'person', 'location'].indexOf(type) !== -1 ">{{ item.name }}</span>
    <span v-if="type === 'topic'">{{ item.htmlExcerpt }}</span>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
};
</script>

<style lang="css">
</style>
