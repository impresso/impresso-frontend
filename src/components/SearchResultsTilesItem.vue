<template lang="html">
  <div class="">
    <b-img class="thumbnail" slot="aside" v-bind:src="value.image" fluid />
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

  },
};
</script>

<style scoped lang="less">
.thumbnail{
  width: 100%;
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
