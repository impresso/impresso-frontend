<template lang="html">
  <b-media>
    <div class="thumbnail" slot="aside" >
      <a href="#" v-on:click.prevent="click"><b-img fluid v-bind:src="value.image" v-bind:alt="value.title" /></a>
    </div>
    <h2><a href="#" v-on:click.prevent="click">{{value.title}}</a></h2>
    <p>{{value.extract}}</p>
    <b-table small :items="value.details"></b-table>
  </b-media>
</template>

<script>
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import VueI18n from 'vue-i18n';

Vue.use(BootstrapVue);
Vue.use(VueI18n);

export default {
  props: {
    value: {
      required: true,
    },
  },
  methods: {
    click() {
      this.$emit('click');
    },
  },
};
</script>

<style scoped lang="less">
.thumbnail {
    width: 120px;
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
