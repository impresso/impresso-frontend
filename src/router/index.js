import Vue from 'vue';
import Router from 'vue-router';
import HomePage from '../components/HomePage';
import SearchPage from '../components/SearchResultsPage';
import IssuePage from '../components/IssuePage';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/search',
      name: 'search_results',
      component: SearchPage,
    },
    {
      path: '/search/:uuid',
      name: 'search',
      component: SearchPage,
      props: true,
    },
    // {
    //   path: '/archive/:archive_id',
    //   component: ArchivePage,
    //   name: 'archive',
    //   props: true,
    // },
    // {
    //   path: '/title/:title_id',
    //   component: TitlePage,
    //   name: 'title',
    //   props: true,
    // },
    // {
    //   path: '/issue/:issue_id',
    //   component: IssuePage,
    //   name: 'issue',
    //   props: true,
    // },
    // {
    //   path: '/page/:page_id',
    //   component: PagePage,
    //   name: 'page',
    //   props: true,
    // },
    {
      path: '/issue/:issue_uid',
      component: IssuePage,
      name: 'issue',
      props: true,
    },
    {
      path: '/issue/:issue_uid/page/:page_number',
      component: IssuePage,
      name: 'page',
      props: true,
    },
    {
      path: '/issue/:issue_uid/page/:page_number/article/:article_uid',
      component: IssuePage,
      name: 'article',
      props: true,
    },
  ],
});
