<template lang="html">
  <div class="">
    <a href="#" v-on:click.prevent="click">
      <img v-bind:src="value.iiif + '/full/300,/0/default.jpg'" class="img-fluid mb-3" />
    </a>
  </div>
</template>

<script>
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import VueI18n from 'vue-i18n';

Vue.use(BootstrapVue);
Vue.use(VueI18n);

export default {
  props: ['value'],
  methods: {
    click() {
      this.$emit('click');
    },
  },
};
</script>

<style scoped lang="less">
.thumbnail{
  margin-bottom: 100px;
}
</style>

<i18n>
{
  "en": {
  },
  "nl": {
  }
}
</i18n>
