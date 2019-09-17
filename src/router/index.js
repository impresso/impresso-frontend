import * as services from '@/services';
import Vue from 'vue';
import Router from 'vue-router';
import HomePage from '../components/HomePage';
import SearchImagesPage from '../components/SearchImagesPage';
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
import EntitiesPage from '../components/EntitiesPage';
import EntitiesExplorerPage from '../components/EntitiesExplorerPage';
import EntitiesDetailPage from '../components/EntitiesDetailPage';
import TopicsPage from '../components/TopicsPage';
import TopicsExplorerPage from '../components/TopicsExplorerPage';
import TopicDetailPage from '../components/TopicDetailPage';
import SearchQueriesComparisonPage from '../components/SearchQueriesComparisonPage';
import store from '../store';

Vue.use(Router);

const router = new Router({
  routes: [{
    path: '/',
    name: 'home',
    component: HomePage,
    // beforeEnter: (to, from, next) => {
    //   next({
    //     name: 'search',
    //   });
    // },
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/search',
    name: 'search',
    component: SearchPage,
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/search/images',
    name: 'searchImages',
    component: SearchImagesPage,
    meta: {
      requiresAuth: false,
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
    beforeEnter: () => {
      store.dispatch('user/LOGOUT').then(() => {
      }, (err) => {
        this.error = this.$t(err.message);
      });
    },
    meta: {
      realm: 'user',
      requiresAuth: false,
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
      path: 'collections',
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
      requiresAuth: false,
      realm: 'issueviewer',
    },
  },
  {
    path: '/issue/:issue_uid/page/:page_uid',
    component: IssuePage,
    name: 'page',
    props: true,
    meta: {
      requiresAuth: false,
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
      requiresAuth: false,
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
        requiresAuth: false,
        realm: 'newspapers',
      },
    },
    {
      path: ':newspaper_uid',
      component: NewspapersDetailPage,
      name: 'newspaper',
      meta: {
        requiresAuth: false,
        realm: 'newspapers',
      },
    },
    {
      path: ':newspaper_uid/metadata',
      component: NewspapersDetailPage,
      name: 'newspaper_metadata',
      meta: {
        requiresAuth: false,
        realm: 'newspapers',
      },
    }],
  },
  {
    path: '/entities',
    component: EntitiesPage,
    children: [{
      path: '',
      component: EntitiesExplorerPage,
      name: 'entities',
      meta: {
        requiresAuth: false,
        realm: 'entities',
      },
    },
    {
      path: ':entity_id',
      component: EntitiesDetailPage,
      name: 'entity',
      meta: {
        requiresAuth: false,
        realm: 'entities',
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
        requiresAuth: false,
      },
    },
    {
      path: ':topic_uid',
      component: TopicDetailPage,
      name: 'topic',
      meta: {
        requiresAuth: false,
      },
    }],
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
  {
    path: '/compare/:ids',
    component: SearchQueriesComparisonPage,
    name: 'compare',
    meta: {
      requiresAuth: false,
    },
    beforeEnter: (to, from, next) => {
      const { ids = '' } = to.params;
      to.params.ids = ids.split(',');
      next();
    },
  }],
});

router.beforeEach((to, from, next) => {
  window.redirect = from.path;
  if (to.meta.requiresAuth === false) {
    next();
  } else {
    services.app.passport.getJWT().then((jwt) => {
      if (services.app.passport.payloadIsValid(jwt)) {
        next();
      } else {
        next({
          name: 'login',
          query: {
            redirect: from.path,
          },
        });
      }
    }).catch(() => {
      next({
        name: 'login',
      });
    });
  }
});

export default router;
