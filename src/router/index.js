import Vue from 'vue';
import Router from 'vue-router';
import HomePage from '@/components/HomePage';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomePage,
      props: { sidebar: false },
    },
  ],
});
