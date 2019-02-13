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
import NewspapersExplorerPage from '../components/NewspapersExplorerPage';
import NewspapersDetailPage from '../components/NewspapersDetailPage';
import TopicsPage from '../components/TopicsPage';
import TopicsExplorerPage from '../components/TopicsExplorerPage';
import TopicDetailPage from '../components/TopicDetailPage';
import store from '../store';

Vue.use(Router);

const router = new Router({
  routes: [{
    path: '/',
    name: 'home',
    beforeEnter: (to, from, next) => {
      next({
        name: 'search',
      });
    },
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/search',
    name: 'search',
    component: SearchPage,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/user/login',
    name: 'login',
    component: UserLoginPage,
    meta: {
      realm: 'user',
      requiresAuth: false,
    },
  },
  {
    path: '/user/logout',
    name: 'logout',
    component: UserLoginPage,
    beforeEnter: (to, from, next) => {
      store.dispatch('user/LOGOUT').then(() => {
        next();
      });
    },
    meta: {
      realm: 'user',
      requiresAuth: true,
    },
  },
  {
    path: '/user/dashboard',
    redirect: '/collections',
    name: 'dashboard',
    component: UserDashboardPage,
    meta: {
      realm: 'user',
      requiresAuth: true,
    },
  },
  {
    path: '/collections',
    component: CollectionsPage,
    name: 'collections',
    props: true,
    children: [{
      path: '',
      component: CollectionsExplorerPage,
      name: 'collectionsExplorer',
      meta: {
        requiresAuth: true,
        realm: 'user',
      },
    },
    {
      path: ':collection_uid',
      component: CollectionDetailPage,
      name: 'collection',
      meta: {
        requiresAuth: true,
        realm: 'user',
      },
    }],
  },
  {
    path: '/issue/:issue_uid',
    component: IssuePage,
    name: 'issue',
    props: true,
    meta: {
      requiresAuth: true,
      realm: 'issueviewer',
    },
  },
  {
    path: '/issue/:issue_uid/page/:page_uid',
    component: IssuePage,
    name: 'page',
    props: true,
    meta: {
      requiresAuth: true,
      realm: 'issueviewer',
    },
  },
  {
    path: '/newspapers',
    component: NewspapersPage,
    children: [{
      path: '',
      component: NewspapersExplorerPage,
      name: 'newspapers',
      meta: {
        requiresAuth: true,
        realm: 'newspapers',
      },
    },
    {
      path: ':newspaper_uid',
      component: NewspapersDetailPage,
      name: 'newspaper',
      meta: {
        requiresAuth: true,
        realm: 'newspapers',
      },
    }],
  },
  {
    path: '/playground',
    component: TestPage,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/topics',
    component: TopicsPage,
    children: [{
      path: '',
      component: TopicsExplorerPage,
      name: 'topics',
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: ':topic_uid',
      component: TopicDetailPage,
      name: 'topic',
      meta: {
        requiresAuth: true,
      },
    }],
  },
  {
    path: '/issue/:issue_uid/page/:page_uid/article/:article_uid',
    component: IssuePage,
    name: 'article',
    props: true,
    meta: {
      realm: 'issueviewer',
      requiresAuth: true,
    },
  },
  {
    path: '/playground',
    component: TestPage,
    meta: {
      requiresAuth: true,
    },
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

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    services.app.passport.getJWT().then((jwt) => {
      if (services.app.passport.payloadIsValid(jwt)) {
        next();
      } else {
        next({
          name: 'login',
        });
      }
    }).catch(() => {
      next({
        name: 'login',
      });
    });
  } else {
    next();
  }
});

export default router;
