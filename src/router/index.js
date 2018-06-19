import Vue from 'vue';
import Router from 'vue-router';
import HomePage from '../components/HomePage';
import SearchPage from '../components/SearchResultsPage';
import IssuePage from '../components/IssuePage';
import UserLoginPage from '../components/UserLoginPage';
import UserDashboardPage from '../components/UserDashboardPage';
import UserCollectionPage from '../components/UserCollectionPage';
import TestPage from '../components/TestPage';

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
      name: 'search',
      component: SearchPage,
    },
    {
      path: '/user/login',
      name: 'login',
      component: UserLoginPage,
    },
    {
      path: '/user/logout',
      name: 'logout',
      component: UserLoginPage,
    },
    {
      path: '/user/dashboard',
      name: 'dashboard',
      component: UserDashboardPage,
    },
    {
      path: '/user/collection/:collection_uid?',
      name: 'collection',
      component: UserCollectionPage,
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
      path: '/issue/:issue_uid/page/:page_uid',
      component: IssuePage,
      name: 'page',
      props: true,
    },
    {
      path: '/issue/:issue_uid/page/:page_uid/article/:article_uid',
      component: IssuePage,
      name: 'article',
      props: true,
    },
    {
      path: '/playground',
      component: TestPage,
    },
  ],
});
