import Vue from 'vue';
import Router from 'vue-router';
import * as services from '@/services';
import HomePage from '../components/HomePage';
import HomePage2020 from '../components/HomePage2020';
import FaqPage from '../components/FaqPage';
import TermsOfUsePage from '../components/TermsOfUsePage';
import SearchImagesPage from '../components/SearchImagesPage';
import SearchPage from '../components/SearchPage';
import SearchNgramsPage from '../components/SearchNgramsPage';
import IssuePage from '../components/IssuePage';
import UserLoginPage from '../components/UserLoginPage';
import UserPage from '../components/UserPage';
import UserRegisterPage from '../components/UserRegisterPage';
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
import SearchClustersPage from '../components/SearchClustersPage';
import TextReusePassagesPage from '../components/TextReusePassagesPage'
import store from '../store';

Vue.use(Router);

const BASE_URL = process.env.BASE_URL || '/';
console.info('Setup Router with BASE_URL to:', BASE_URL);

const router = new Router({
  mode: 'history',
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    if (to.hash) {
      const el = document.querySelector('div#app-content');
      // console.log('---', el.scrollLeft, el.scrollTop);
      const rect = el.getBoundingClientRect();
      const ela = document.querySelector(to.hash);
      const recta = ela.getBoundingClientRect();
      el.scrollTop = recta.top - rect.top - 10;
    }
    return {};
  },
  base: BASE_URL,
  routes: [
    {
      path: '',
      name: 'home',
      component: HomePage2020,
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/2019',
      name: '2019',
      component: HomePage,
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/search/ngrams',
      name: 'searchNgrams',
      component: SearchNgramsPage,
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/faq',
      name: 'faq',
      component: FaqPage,
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/terms-of-use',
      name: 'termsOfUse',
      component: TermsOfUsePage,
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
      path: '/user',
      name: 'user',
      component: UserPage,
      meta: {
        realm: 'user',
        requiresAuth: true,
      },
    },
    {
      path: '/user/register',
      name: 'register',
      component: UserRegisterPage,
      meta: {
        realm: 'user',
        requiresAuth: false,
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
      path: '/compare',
      component: SearchQueriesComparisonPage,
      name: 'compare',
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/text-reuse-clusters',
      component: SearchClustersPage,
      name: 'text-reuse-clusters',
      meta: {
        requiresAuth: false,
      },
      children: [{
        path: '',
        component: TextReusePassagesPage,
        name: 'text-reuse-clusters-passages',
        meta: {
          requiresAuth: false,
        },
      }],
    }],
});

router.beforeEach((to, from, next) => {
  console.info('Routing to', to.name, to.path, 'from', from.name, from.path);
  Vue.prototype.$renderMetaTags({ title: to.name });
  // clean yellow alert error messages
  store.dispatch('CLEAN_ERROR_MESSAGE');
  if (to.name === 'login' && from.name && from.name !== 'login') {
    store.dispatch('SET_REDIRECTION_ROUTE', {
      ...from,
    }).then(next);
  } else if (to.meta.requiresAuth === false) {
    next();
  } else {
    services.app.authentication.getAccessToken().then((jwt) => {
      if (jwt) {
        next();
      } else {
        next({
          name: 'login',
          query: {
            redirect: to.path,
          },
        });
      }
    });
  }
});

export default router;
