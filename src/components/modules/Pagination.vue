<template lang="html">
<div class="">
  <b-pagination
    size="md"
    v-bind:value="currentPage"
    v-bind:total-rows="totalRows"
    v-bind:per-page="perPage"
    v-on:change="onChange"
    v-on:input="onInput"
  ></b-pagination>
  {{$t("description", {
    firstResult: firstResult,
    lastResult: lastResult,
    totalRows: totalRows,
    totalPages: totalPages
  })}}
</div>
</template>

<script>
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import VueI18n from 'vue-i18n';

Vue.use(BootstrapVue);
Vue.use(VueI18n);

export default {
  props: {
    perPage: {
      type: Number,
      default: 10,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    totalRows: {
      type: Number,
      default: 70,
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
