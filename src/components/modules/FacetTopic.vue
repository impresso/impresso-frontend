<template lang="html">
  <ul class="list-unstyled">
    <li v-for="bucket in facet.buckets">
      <a href="#">{{bucket.item.getHtmlExcerpt()}} ({{$n(bucket.count)}})</a>
    </li>
  </ul>
</template>

<script>
export default {
  model: {
    prop: 'facet',
  },
  props: ['facet'],
  methods: {
    onClick(bucket) {
      this.$emit('submit', this.facet, bucket);
    },
  },
};
</script>

<style lang="css">
</style>
