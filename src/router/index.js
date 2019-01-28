import * as services from '@/services';
import Vue from 'vue';
import Router from 'vue-router';
import SearchPage from '../components/SearchPage';
import IssuePage from '../components/IssuePage';
import UserLoginPage from '../components/UserLoginPage';
import UserDashboardPage from '../components/UserDashboardPage';
import CollectionsPage from '../components/CollectionsPage';
import CollectionsExplorerPage from '../components/CollectionsExplorerPage';
import CollectionDetailPage from '../components/CollectionDetailPage';
import TestPage from '../components/TestPage';
import NewspapersPage from '../components/NewspapersPage';
import TopicsPage from '../components/TopicsPage';
import TopicsExplorerPage from '../components/TopicsExplorerPage';
import TopicDetailPage from '../components/TopicDetailPage';

Vue.use(Router);

export default new Router({
  routes: [{
    path: '/',
    name: 'home',
    beforeEnter: (to, from, next) => {
      next({
        name: 'search',
      });
    },
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
    redirect: '/collections',
    name: 'dashboard',
    component: UserDashboardPage,
    meta: {
      realm: 'user',
    },
  },
  {
    path: '/collections',
    component: CollectionsPage,
    name: 'collections',
    props: true,
    meta: {
      realm: 'user',
    },
    children: [{
      path: '',
      component: CollectionsExplorerPage,
      name: 'collectionsExplorer',
    },
    {
      path: ':collection_uid',
      component: CollectionDetailPage,
      name: 'collection',
    }],
  },
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
    path: '/newspapers/:newspaper_uid?',
    component: NewspapersPage,
    name: 'newspapers',
    meta: {
      realm: 'newspapers',
    },
  },
  {
    path: '/playground',
    component: TestPage,
  },
  {
    path: '/topics',
    component: TopicsPage,
    name: 'topics',

    children: [{
      path: '',
      component: TopicsExplorerPage,
      name: 'topicsExplorer',
    },
    {
      path: ':topic_uid',
      component: TopicDetailPage,
      name: 'topic',
    }],
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
  }],
});
