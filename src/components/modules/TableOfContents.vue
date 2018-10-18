<template lang="html">
  <div>
    <div v-for="article in toc">
      <h4 v-html="article.title || '<i>Title Unavailable</i>'"></h4>
      <button class="btn btn-sm btn-secondary" type="button" name="button" v-on:click="onClick(article)">Load</button>
      <!-- <pre>{{article}}</pre> -->
      <hr>
    </div>
  </div>
</template>

<script>
export default {
  model: {
    prop: 'toc',
  },
  props: {
    toc: {
      default: [],
    },
  },
  methods: {
    onClick(article) {
      this.$emit('click', article.uid);
    },
  },
};
</script>

<style scoped lang="less">
.active{
  background: orange;
}
</style>
