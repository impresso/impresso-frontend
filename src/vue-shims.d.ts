import Vue from 'vue'
import { Store } from 'vuex'
import VueRouter from 'vue-router';

declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

// https://vuejs.org/v2/guide/typescript.html#Augmenting-Types-for-Use-with-Plugins
declare module "vue/types/vue" {
  interface Vue {
    $store: Store;
    $router: VueRouter
  }
}