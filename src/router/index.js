import Vue from 'vue'
import Router from 'vue-router'
import * as services from '@/services'
// import HomePage from '@/components/HomePage.vue'
import HomePage2020 from '@/components/HomePage2020.vue'
// import FaqPage from '@/components/FaqPage.vue'
// import TermsOfUsePage from '@/components/TermsOfUsePage.vue'
// import IssuePage from '@/components/IssuePage.vue'
// import UserLoginPage from '@/components/UserLoginPage.vue'
// import TestPage from '@/components/TestPage.vue'
// import NewspapersExplorerPage from '@/components/NewspapersExplorerPage.vue'
// import NewspapersDetailPage from '@/components/NewspapersDetailPage.vue'
// import EntitiesExplorerPage from '@/components/EntitiesExplorerPage';
// import EntitiesTemporaryPage from '@/components/EntitiesTemporaryPage.vue'
// import EntitiesDetailPage from '@/components/EntitiesDetailPage.vue'
// import TopicsPage from '@/components/TopicsPage.vue'
// import TopicsExplorerPage from '@/components/TopicsExplorerPage.vue'
// import TopicDetailPage from '@/components/TopicDetailPage.vue'
// import PowerUserVisualisation from '@/pages/PowerUserVisualisation.vue'
// import PowerUserVisualisation from '@/pages/PowerUserVisualisationOld.vue'

// import IssueViewerPage from '@/pages/IssueViewerPage.vue'
// import { getShortArticleId } from '@/logic/ids'
import { useUserStore } from '@/stores/user'
import { useNotificationsStore } from '@/stores/notifications'

Vue.use(Router)

const BASE_URL = import.meta.env.BASE_URL || '/'
// eslint-disable-next-line
console.debug('[router] Router with BASE_URL to:', BASE_URL)

const router = new Router({
  mode: 'history',
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      const el = document.querySelector('div#app-content')
      // console.log('---', el.scrollLeft, el.scrollTop);
      const rect = el.getBoundingClientRect()
      const ela = document.querySelector(to.hash)
      const recta = ela.getBoundingClientRect()
      el.scrollTop = recta.top - rect.top - 10
    }
    return {}
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
    // {
    //   path: '/2019',
    //   name: '2019',
    //   component: HomePage,
    //   meta: {
    //     requiresAuth: false,
    //   },
    // },
    // {
    //   path: '/search/ngrams',
    //   name: 'searchNgrams',
    //   component: () => import(/* webpackChunkName: "searchNgrams" */ '@/pages/SearchNgrams.vue'),
    //   meta: {
    //     requiresAuth: false,
    //   },
    // },
    // {
    //   path: '/faq',
    //   name: 'faq',
    //   component: FaqPage,
    //   meta: {
    //     requiresAuth: false,
    //   },
    // },
    // {
    //   path: '/terms-of-use',
    //   name: 'termsOfUse',
    //   component: TermsOfUsePage,
    //   meta: {
    //     requiresAuth: false,
    //   },
    // },
    // {
    //   path: '/search',
    //   name: 'search',
    //   component: () => import(/* webpackChunkName: "search" */ '@/pages/Search.vue'),
    //   meta: {
    //     requiresAuth: false,
    //   },
    // },
    // {
    //   path: '/search/images',
    //   name: 'searchImages',
    //   component: () => import(/* webpackChunkName: "searchImages" */ '@/pages/SearchImages.vue'),
    //   meta: {
    //     requiresAuth: false,
    //   },
    // },
    // {
    //   path: '/user/login',
    //   name: 'login',
    //   component: UserLoginPage,
    //   meta: {
    //     realm: 'user',
    //     requiresAuth: false,
    //   },
    // },
    // {
    //   path: '/user/logout',
    //   name: 'logout',
    //   component: UserLoginPage,
    //   beforeEnter: () => {
    //     const userStore = useUserStore()
    //     userStore.logout().then(
    //       () => {},
    //       err => {
    //         this.error = this.$t(err.message)
    //       },
    //     )
    //   },
    //   meta: {
    //     realm: 'user',
    //     requiresAuth: false,
    //   },
    // },
    // {
    //   path: '/user',
    //   name: 'user',
    //   component: () => import(/* webpackChunkName: "user" */ '@/pages/User.vue'),
    //   meta: {
    //     realm: 'user',
    //     requiresAuth: true,
    //   },
    // },
    // {
    //   path: '/user/register',
    //   name: 'register',
    //   component: () => import(/* webpackChunkName: "userRegister" */ '@/pages/UserRegister.vue'),
    //   meta: {
    //     realm: 'user',
    //     requiresAuth: false,
    //   },
    // },
    // {
    //   path: '/password-reset',
    //   name: 'passwordReset',
    //   component: () =>
    //     import(/* webpackChunkName: "userPasswordReset" */ '@/pages/PasswordReset.vue'),
    //   meta: {
    //     realm: 'user',
    //     requiresAuth: false,
    //   },
    // },
    // {
    //   path: '/password-reset/:token',
    //   name: 'PasswordChange',
    //   component: () =>
    //     import(/* webpackChunkName: "userPasswordReset" */ '@/pages/PasswordChange.vue'),
    //   meta: {
    //     realm: 'user',
    //     requiresAuth: false,
    //   },
    // },
    // {
    //   path: '/password-reset-sent',
    //   name: 'passwordResetSent',
    //   component: () =>
    //     import(/* webpackChunkName: "userPasswordReset" */ '@/pages/PasswordResetSent.vue'),
    //   meta: {
    //     realm: 'user',
    //     requiresAuth: false,
    //   },
    // },
    // {
    //   path: '/collections',
    //   component: () => import(/* webpackChunkName: "collections" */ '@/pages/Collections.vue'),
    //   children: [
    //     {
    //       path: '',
    //       component: () =>
    //         import(/* webpackChunkName: "collections" */ '@/components/CollectionDetailPage.vue'),
    //       name: 'collections',
    //       meta: {
    //         requiresAuth: true,
    //         realm: 'user',
    //       },
    //     },
    //     {
    //       path: ':collection_uid',
    //       component: () =>
    //         import(/* webpackChunkName: "collections" */ '@/components/CollectionDetailPage.vue'),
    //       name: 'collection',
    //       meta: {
    //         requiresAuth: true,
    //         realm: 'user',
    //       },
    //     },
    //   ],
    // },
    // {
    //   path: '/issue/:issue_uid',
    //   component: IssuePage,
    //   name: 'issue',
    //   props: true,
    //   meta: {
    //     requiresAuth: false,
    //     realm: 'issueviewer',
    //   },
    // },
    // {
    //   path: '/issue/:issue_uid/view',
    //   component: IssueViewerPage,
    //   name: 'issue-viewer',
    //   props: true,
    //   meta: {
    //     requiresAuth: false,
    //     realm: 'issueviewer',
    //   },
    // },
    // {
    //   path: '/issue/:issue_uid/page/:page_uid',
    //   component: IssuePage,
    //   name: 'page',
    //   props: true,
    //   meta: {
    //     requiresAuth: false,
    //     realm: 'issueviewer',
    //   },
    // },
    // {
    //   path: '/issue/:issue_uid/page/:page_uid/article/:article_uid',
    //   name: 'article',
    //   redirect: to => ({
    //     name: 'issue-viewer',
    //     params: {
    //       issue_uid: to.params.issue_uid,
    //     },
    //     query: {
    //       p: to.params.page_uid.match(/p0*(\d+)$/)[1],
    //       articleId: getShortArticleId(to.params.article_uid),
    //     },
    //   }),
    // },
    // {
    //   path: '/newspapers',
    //   component: () => import(/* webpackChunkName: "newspapers" */ '@/pages/Newspapers.vue'),
    //   children: [
    //     {
    //       path: '',
    //       component: NewspapersExplorerPage,
    //       name: 'newspapers',
    //       meta: {
    //         requiresAuth: false,
    //         realm: 'newspapers',
    //       },
    //     },
    //     {
    //       path: ':newspaper_uid',
    //       component: NewspapersDetailPage,
    //       name: 'newspaper',
    //       meta: {
    //         requiresAuth: false,
    //         realm: 'newspapers',
    //       },
    //     },
    //     {
    //       path: ':newspaper_uid/metadata',
    //       component: NewspapersDetailPage,
    //       name: 'newspaper_metadata',
    //       meta: {
    //         requiresAuth: false,
    //         realm: 'newspapers',
    //       },
    //     },
    //   ],
    // },
    // {
    //   path: '/entities',
    //   component: () => import(/* webpackChunkName: "entities" */ '@/pages/Entities.vue'),
    //   children: [
    //     {
    //       path: '',
    //       component: EntitiesTemporaryPage,
    //       name: 'entities',
    //       meta: {
    //         requiresAuth: false,
    //         realm: 'entities',
    //       },
    //     },
    //     {
    //       path: ':entity_id',
    //       component: EntitiesDetailPage,
    //       name: 'entity',
    //       meta: {
    //         requiresAuth: false,
    //         realm: 'entities',
    //       },
    //     },
    //   ],
    // },
    // {
    //   path: '/playground',
    //   component: TestPage,
    //   meta: {
    //     requiresAuth: true,
    //   },
    // },
    // {
    //   path: '/topics',
    //   component: TopicsPage,
    //   children: [
    //     {
    //       path: '',
    //       component: TopicsExplorerPage,
    //       name: 'topics',
    //       meta: {
    //         requiresAuth: false,
    //       },
    //     },
    //     {
    //       path: ':topic_uid',
    //       component: TopicDetailPage,
    //       name: 'topic',
    //       meta: {
    //         requiresAuth: false,
    //       },
    //     },
    //   ],
    // },
    // {
    //   path: '/article/:article_uid',
    //   beforeEnter: (to, from, next) => {
    //     services.articles.get(to.params.article_uid).then(res => {
    //       next({
    //         name: 'issue-viewer',
    //         params: {
    //           issue_uid: res.issue.uid,
    //         },
    //         query: {
    //           p: res.pages[0]?.num,
    //           articleId: getShortArticleId(res.uid),
    //           text: '1',
    //         },
    //       })
    //     })
    //   },
    // },
    // {
    //   path: '/compare',
    //   component: () =>
    //     import(
    //       /* webpackChunkName: "search-queries-comparison" */ '@/pages/SearchQueriesComparison.vue'
    //     ),
    //   name: 'compare',
    //   meta: {
    //     requiresAuth: false,
    //   },
    // },
    // {
    //   path: '/text-reuse',
    //   component: () => import(/* webpackChunkName: "tr" */ '@/pages/TextReuse.vue'),
    //   meta: {
    //     requiresAuth: false,
    //     realm: 'textReuse',
    //   },
    //   children: [
    //     {
    //       path: '',
    //       component: () =>
    //         import(
    //           /* webpackChunkName: "tr-clusters-details" */ '@/components/TextReuseExplorerPage.vue'
    //         ),
    //       name: 'textReuseOverview',
    //       meta: {
    //         requiresAuth: false,
    //         realm: 'textReuse',
    //       },
    //     },
    //     {
    //       path: 'statistics',
    //       component: () =>
    //         import(
    //           /* webpackChunkName: "tr-clusters-details" */ '@/components/TextReuseExplorerPage.vue'
    //         ),
    //       name: 'textReuseStatistics',
    //       meta: {
    //         requiresAuth: false,
    //         realm: 'textReuse',
    //       },
    //     },
    //     {
    //       path: 'clusters',
    //       component: () =>
    //         import(
    //           /* webpackChunkName: "tr-clusters-details" */ '@/components/TextReuseExplorerPage.vue'
    //         ),
    //       name: 'textReuseClusters',
    //       meta: {
    //         requiresAuth: false,
    //         realm: 'textReuse',
    //       },
    //     },
    //     {
    //       path: 'passages',
    //       component: () =>
    //         import(
    //           /* webpackChunkName: "tr-clusters-details" */ '@/components/TextReuseExplorerPage.vue'
    //         ),
    //       name: 'textReusePassages',
    //       meta: {
    //         requiresAuth: false,
    //         realm: 'textReuse',
    //       },
    //     },
    //   ],
    // },
    // {
    //   path: '/text-reuse-clusters',
    //   component: () =>
    //     import(/* webpackChunkName: "tr-clusters" */ '@/pages/TextReuseClusters.vue'),
    //   name: 'text-reuse-clusters',
    //   meta: {
    //     requiresAuth: false,
    //   },
    //   children: [
    //     {
    //       path: '',
    //       component: () =>
    //         import(
    //           /* webpackChunkName: "tr-clusters-details" */ '@/components/TextReuseClusterDetailPage.vue'
    //         ),
    //       name: 'text-reuse-cluster-passages',
    //       meta: {
    //         requiresAuth: false,
    //       },
    //     },
    //     {
    //       path: 'card',
    //       component: () =>
    //         import(
    //           /* webpackChunkName: "tr-clusters-details-id-card" */ '@/components/TextReuseClusterIdCardPage.vue'
    //         ),
    //       name: 'text-reuse-cluster-detail',
    //       meta: {
    //         requiresAuth: false,
    //       },
    //     },
    //     {
    //       path: 'connected-clusters',
    //       component: () =>
    //         import(
    //           /* webpackChunkName: "tr-clusters-connected" */ '@/components/TextReuseConnectedClusters.vue'
    //         ),
    //       name: 'text-reuse-connected-clusters',
    //       meta: {
    //         requiresAuth: false,
    //       },
    //     },
    //   ],
    // },
    // {
    //   path: '/powervis',
    //   component: PowerUserVisualisation,
    //   name: 'powervis',
    //   meta: { requiresAuth: false },
    // },
  ],
})

router.beforeEach((to, from, next) => {
  const pathWithPrefix = String(BASE_URL + to.path).replace(/\/+/g, '/')
  // console.info('[router/index] Routing \-to : to', to.name, to.path, 'from', from.name, from.path)
  Vue.prototype.$renderMetaTags({ title: to.name })
  // # forward page to matomo analytics using base.URL
  if (window._paq) {
    console.info(
      '[router/index] Matomo tracking \n - path: ',
      pathWithPrefix,
      ' \n - title:',
      to.name,
    )
    window._paq.push(['setCustomUrl', pathWithPrefix])
    window._paq.push(['setDocumentTitle', to.name])
    window._paq.push(['trackPageView'])
  } else {
    console.warn('[router/index] Matomo not loaded')
  }
  // clean yellow alert error messages
  const notificationsStore = useNotificationsStore()
  notificationsStore.cleanErrorMessage()
  if (to.name === 'login' && from.name && from.name !== 'login') {
    const userStore = useUserStore()
    userStore.setRedirectionRoute({
      name: from.name,
      path: from.path,
      query: from.query,
    })
    next()
  } else if (to.meta.requiresAuth === false) {
    next()
  } else {
    services.app.authentication.getAccessToken().then(jwt => {
      if (jwt) {
        next()
      } else {
        next({
          name: 'login',
          query: {
            redirect: to.path,
          },
        })
      }
    })
  }
})

export default router
