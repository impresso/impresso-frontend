<template lang="html">
  <div>
    <b-button
      class="mr-2 mb-2"
      v-on:click="onClick(bucket)"
      v-for="bucket in facet.buckets"
      variant="secondary"
      size="sm">{{bucket.item.name}} ({{$n(bucket.count)}})</b-button>
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
  },
};
</script>

<style lang="css">
</style>
