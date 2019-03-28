<template lang="html">
<div class="">
  <b-pagination
    v-bind:size="size"
    v-bind:value="currentPage"
    v-bind:total-rows="totalRows"
    v-bind:per-page="perPage"
    v-on:change="onChange"
    v-on:input="onInput"
    v-bind:align="align"
    class="m-0"
  ></b-pagination>
  <div v-if="showDescription">
    {{$t("description", {
      firstResult: firstResult,
      lastResult: lastResult,
      totalRows: $n(totalRows),
      totalPages: $n(totalPages)
    })}}
  </div>
</div>
</template>

<script>
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import VueI18n from 'vue-i18n';

Vue.use(BootstrapVue);
Vue.use(VueI18n);

export default {
  model: {
    prop: 'currentPage',
  },
  props: {
    perPage: {
      type: Number,
      default: 1,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    totalRows: {
      type: Number,
      default: 1,
    },
    align: {
      default: 'left',
    },
    showDescription: {
      default: false,
    },
    size: {
      default: 'md',
    },
  },
  computed: {
    firstResult() {
      return ((this.currentPage - 1) * this.perPage) + 1;
    },
    lastResult() {
      let result = this.currentPage * this.perPage;

      if (result > this.totalRows) {
        result = this.totalRows;
      }

      return result;
    },
    totalPages() {
      return Math.ceil(this.totalRows / this.perPage);
    },
  },
  methods: {
    onChange(val) {
      this.$emit('change', val);
    },
    onInput(val) {
      this.$emit('input', val);
    },
  },
};
</script>

<style scoped lang="less">
</style>

<i18n>
{
  "en": {
    "description": "Showing {firstResult} to {lastResult} of {totalRows} ({totalPages} pages)"
  },
  "nl": {
    "description": "Resultaten {firstResult} tot {lastResult} van {totalRows} ({totalPages} paginas)"
  }
}
</i18n>
