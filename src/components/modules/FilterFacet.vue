<template lang="html">
  <div class="mb-4">
    <base-title-bar>
    {{$t(`label.${filter.type}`)}}
      <b-button v-on:click="removeFilter" class="float-right" variant="link" size="sm" v-show="filter.touched">
        <icon name="times" />
      </b-button>
    </base-title-bar>
    <div v-for="bucket in filter.buckets">
      <b-form-checkbox v-bind:checked="bucket.included" v-on:change="toggleBucket(bucket)">
        {{bucket.item.name || bucket.val}} ({{bucket.count}})
      </b-form-checkbox>
    </div>
  </div>
</template>

<script>
import 'vue-awesome/icons/times';
import Icon from 'vue-awesome/components/Icon';

import BaseTitleBar from './../base/BaseTitleBar';

export default {
  model: {
    prop: 'filter',
  },
  props: ['filter'],
  methods: {
    toggleBucket(bucket) {
      bucket.included = !bucket.included;
      this.filter.touch();
    },
    removeFilter() {
      this.$emit('remove');
      this.filter.untouch();
    },
  },
  components: {
    BaseTitleBar,
    Icon,
  },
};
</script>

<style scoped lang="less">
</style>

<i18n>
{
  "en": {
    "label": {
      "year": "Year",
      "newspaper": "Newspaper Title",
      "language": "Language"
    }
  },
  "nl": {
    "label": {
      "year": "Jaar",
      "newspaper": "Krant",
      "language": "Taal"
    }
  }
}
</i18n>
