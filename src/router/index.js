import Vue from 'vue';
import Router from 'vue-router';
import HomePage from '@/components/HomePage';
import SearchResultsPage from '@/components/SearchResultsPage';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/search/results',
      name: 'search_results',
      component: SearchResultsPage,
    },
    {
      path: '/search/results/:uuid',
      component: SearchResultsPage,
      props: true,
    },
  ],
});
