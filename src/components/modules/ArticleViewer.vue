<template lang="html">
  <div class="">

    <h4 v-html="article.title"></h4>
    <p>{{$d(new Date(article.date), 'long')}}</p>
    <p v-html="article.contents"></p>
    <pre>{{article}}</pre>
  </div>

</template>

<script>
export default {
  model: {
    prop: 'article',
  },
  props: ['article'],
};
</script>

<style scoped lang="less">
</style>
