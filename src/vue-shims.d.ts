import Vue from 'vue'
import VueRouter, { Route } from 'vue-router'

declare module "*.vue" {
  export default Vue;
}

declare class Navigation {
  updateQueryParameters(queryParameters: any): void;
  updateQueryParametersWithHistory(queryParameters: any): void;
}

declare module 'vue/types/vue' {
  interface Vue {
    $router: VueRouter;
    $route: Route;
    $navigation: Navigation;
  }
}