<template lang="html">
  <div>
    <b-button
      class="mr-2 mb-2"
      v-on:click="onClick(bucket)"
      v-for="bucket in facet.buckets"
      variant="secondary"
      size="sm">{{getLabel(bucket)}} ({{$n(bucket.count)}})</b-button>
  </div>
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
    getLabel(bucket) {
      return bucket.item.excerpt.map(topicWord => topicWord.w).join(', ') || bucket.item.uid;
    },
  },
};
</script>

<style lang="css">
</style>
