import * as services from '@/services';
import Vue from 'vue';
import Router from 'vue-router';
import SearchPage from '../components/SearchPage';
import IssuePage from '../components/IssuePage';
import UserLoginPage from '../components/UserLoginPage';
import UserDashboardPage from '../components/UserDashboardPage';
import UserCollectionPage from '../components/UserCollectionPage';
import TestPage from '../components/TestPage';
import TopicExplorerPage from '../components/TopicExplorerPage';


Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: SearchPage,
    },
    {
      path: '/user/login',
      name: 'login',
      component: UserLoginPage,
      meta: {
        realm: 'user',
      },
    },
    {
      path: '/user/logout',
      name: 'logout',
      component: UserLoginPage,
      meta: {
        realm: 'user',
      },
    },
    {
      path: '/user/dashboard',
      name: 'dashboard',
      component: UserDashboardPage,
      meta: {
        realm: 'user',
      },
    },
    {
      path: '/user/collection/:collection_uid?',
      name: 'collection',
      component: UserCollectionPage,
      props: true,
      meta: {
        realm: 'user',
      },
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
      meta: {
        realm: 'issueviewer',
      },
    },
    {
      path: '/issue/:issue_uid/page/:page_uid',
      component: IssuePage,
      name: 'page',
      props: true,
      meta: {
        realm: 'issueviewer',
      },
    },
    {
      path: '/issue/:issue_uid/page/:page_uid/article/:article_uid',
      component: IssuePage,
      name: 'article',
      props: true,
      meta: {
        realm: 'issueviewer',
      },
    },
    {
      path: '/playground',
      component: TestPage,
    },
    {
      path: '/topic/:topic_model/:topic_uid',
      component: TopicExplorerPage,
      name: 'topicexplorer',
    },
    {
      path: '/article/:article_uid',
      beforeEnter: (to, from, next) => {
        services.articles.get(to.params.article_uid).then((res) => {
          next({
            name: 'article',
            params: {
              issue_uid: res.issue.uid,
              page_uid: res.pages[0].uid,
              article_uid: res.uid,
            },
          });
        });
      },
    },
  ],
});
