import { createRouter, createWebHistory } from 'vue-router'
import * as services from '@/services'
import HomePage2020 from '@/components/HomePage2020.vue'
import FaqPage from '@/pages/FaqPage.vue'
import IssuePage from '@/components/IssuePage.vue'
import UserLoginPage from '@/components/UserLoginPage.vue'
import TestPage from '@/components/TestPage.vue'
import NewspapersExplorerPage from '@/components/NewspapersExplorerPage.vue'
import NewspapersDetailPage from '@/components/NewspapersDetailPage.vue'
import EntitiesTemporaryPage from '@/components/EntitiesTemporaryPage.vue'
import EntitiesDetailPage from '@/components/EntitiesDetailPage.vue'
import TopicsPage from '@/components/TopicsPage.vue'
import TopicsExplorerPage from '@/components/TopicsExplorerPage.vue'
import TopicDetailPage from '@/components/TopicDetailPage.vue'
import PowerUserVisualisation from '@/pages/PowerUserVisualisation.vue'

import IssueViewerPage from '@/pages/IssueViewerPage.vue'
import { getShortArticleId } from '@/logic/ids'
import { useUserStore } from '@/stores/user'
import { useNotificationsStore } from '@/stores/notifications'
import { AnalyticsObject } from '@/plugins/analytics'

const BASE_URL = import.meta.env.BASE_URL || '/'
// eslint-disable-next-line
console.debug('[router] Router with BASE_URL to:', BASE_URL)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      const el = document.querySelector('div#app-content')
      // console.log('---', el.scrollLeft, el.scrollTop);
      const rect = el?.getBoundingClientRect()
      const ela = document.querySelector(to.hash)
      const recta = ela?.getBoundingClientRect()
      if (el && rect && ela && recta) {
        el.scrollTop = recta.top - rect.top - 10
      }
    }
    return {}
  },
  routes: [
    {
      path: '',
      name: 'home',
      component: HomePage2020,
      meta: {
        requiresAuth: false
      }
    },

    {
      path: '/search/ngrams',
      name: 'searchNgrams',
      component: () => import('@/pages/SearchNgrams.vue'),
      meta: {
        requiresAuth: false
      }
    },
    {
      path: '/search/radio',
      name: 'searchRadio',
      component: () => import('@/pages/SearchRadio.vue'),
      meta: {
        requiresAuth: false
      }
    },
    {
      path: '/faq',
      name: 'faq',
      component: FaqPage,
      meta: {
        requiresAuth: false
      }
    },

    {
      path: '/search',
      name: 'search',
      component: () => import('@/pages/Search.vue'),
      meta: {
        requiresAuth: false
      }
    },
    {
      path: '/search/images',
      name: 'searchImages',
      component: () => import('@/pages/SearchImages.vue'),
      meta: {
        requiresAuth: false
      }
    },
    {
      path: '/helpers/filters',
      name: 'filtersParser',
      component: () => import('@/pages/FilterParserPage.vue'),
      meta: {
        requiresAuth: false
      }
    },
    {
      path: '/user/login',
      name: 'login',
      component: UserLoginPage,
      meta: {
        realm: 'user',
        requiresAuth: false
      }
    },
    {
      path: '/user/logout',
      name: 'logout',
      component: UserLoginPage,
      beforeEnter: () => {
        const userStore = useUserStore()
        userStore.logout().then(
          () => {},
          err => {
            console.error(err)
            // what was supposed to be `this`?
            // this.error = this.$t(err.message)
          }
        )
      },
      meta: {
        realm: 'user',
        requiresAuth: false
      }
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('@/pages/User.vue'),
      meta: {
        realm: 'user',
        requiresAuth: true
      }
    },
    {
      path: '/user/register',
      name: 'register',
      component: () => import('@/pages/UserRegister.vue'),
      beforeEnter: (to, from, next) => {
        const userStore = useUserStore()
        if (userStore.userData) {
          next({ name: 'home' })
        } else {
          next()
        }
      },
      meta: {
        realm: 'user',
        requiresAuth: false
      }
    },
    {
      path: '/password-reset',
      name: 'passwordReset',
      component: () => import('@/pages/PasswordReset.vue'),
      meta: {
        realm: 'user',
        requiresAuth: false
      }
    },
    {
      path: '/password-reset/:token',
      name: 'PasswordChange',
      component: () => import('@/pages/PasswordChange.vue'),
      meta: {
        realm: 'user',
        requiresAuth: false
      }
    },
    {
      path: '/password-reset-sent',
      name: 'passwordResetSent',
      component: () => import('@/pages/PasswordResetSent.vue'),
      meta: {
        realm: 'user',
        requiresAuth: false
      }
    },
    {
      path: '/collections',
      component: () => import('@/pages/Collections.vue'),
      children: [
        {
          path: '',
          component: () => import('@/components/CollectionExplorerPage.vue'),
          name: 'collections',
          meta: {
            requiresAuth: true,
            realm: 'user'
          }
        },
        {
          path: ':collection_uid',
          component: () => import('@/components/CollectionDetailPage.vue'),
          name: 'collection',
          meta: {
            requiresAuth: true,
            realm: 'user'
          }
        }
      ]
    },
    {
      path: '/issue/:issue_uid',
      component: IssueViewerPage,
      name: 'issue',
      props: true,
      meta: {
        requiresAuth: false,
        realm: 'issueviewer'
      }
    },
    {
      path: '/issue/:issue_uid/view',
      component: IssueViewerPage,
      name: 'issue-viewer',
      props: true,
      meta: {
        requiresAuth: false,
        realm: 'issueviewer'
      }
    },
    {
      path: '/issue/:issue_uid/page/:page_uid',
      component: IssuePage,
      name: 'page',
      props: true,
      meta: {
        requiresAuth: false,
        realm: 'issueviewer'
      }
    },
    {
      path: '/issue/:issue_uid/page/:page_uid/article/:article_uid',
      name: 'article',
      redirect: to => ({
        name: 'issue-viewer',
        params: {
          issue_uid: to.params.issue_uid
        },
        query: {
          p: (to.params.page_uid as string).match(/p0*(\d+)$/)[1],
          articleId: getShortArticleId(to.params.article_uid as string)
        }
      })
    },
    {
      path: '/newspapers',
      component: () => import('@/pages/Newspapers.vue'),
      children: [
        {
          path: '',
          component: NewspapersExplorerPage,
          name: 'newspapers',
          meta: {
            requiresAuth: false,
            realm: 'newspapers'
          }
        },
        {
          path: ':newspaper_uid',
          component: NewspapersDetailPage,
          name: 'newspaper',
          meta: {
            requiresAuth: false,
            realm: 'newspapers'
          }
        },
        {
          path: ':newspaper_uid/metadata',
          component: NewspapersDetailPage,
          name: 'newspaper_metadata',
          meta: {
            requiresAuth: false,
            realm: 'newspapers'
          }
        }
      ]
    },
    {
      path: '/entities',
      component: () => import('@/pages/Entities.vue'),
      children: [
        {
          path: '',
          component: EntitiesTemporaryPage,
          name: 'entities',
          meta: {
            requiresAuth: false,
            realm: 'entities'
          }
        },
        {
          path: ':entity_id',
          component: EntitiesDetailPage,
          name: 'entity',
          meta: {
            requiresAuth: false,
            realm: 'entities'
          }
        }
      ]
    },
    {
      path: '/playground',
      component: TestPage,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/terms-of-use',
      name: 'termsOfUse',
      component: () => import('@/pages/TermsOfUse.vue'),
      meta: {
        requiresAuth: false
      }
    },
    {
      path: '/topics',
      component: TopicsPage,
      children: [
        {
          path: '',
          component: TopicsExplorerPage,
          name: 'topics',
          meta: {
            requiresAuth: false
          }
        },
        {
          path: ':topic_uid',
          component: TopicDetailPage,
          name: 'topic',
          meta: {
            requiresAuth: false
          }
        }
      ]
    },
    {
      path: '/article/:article_uid',
      component: () => null,
      beforeEnter: async to => {
        const res = await services.articles.get(to.params.article_uid as string)
        return {
          name: 'issue-viewer',
          params: {
            issue_uid: res.issue.uid
          },
          query: {
            p: res.pages[0]?.num,
            articleId: getShortArticleId(res.uid),
            text: '1'
          }
        }
      }
    },
    {
      name: 'audioContentItem',
      path: '/audio-content-item/:content_item_uid',
      component: import('@/pages/AudioContentItem.vue'),
      meta: {
        requiresAuth: true,
        realm: 'contentItem'
      }
    },
    {
      path: '/compare',
      component: () => import('@/pages/SearchQueriesComparison.vue'),
      name: 'compare',
      meta: {
        requiresAuth: false
      }
    },
    {
      path: '/text-reuse',
      component: () => import('@/pages/TextReuse.vue'),
      meta: {
        requiresAuth: false,
        realm: 'textReuse'
      },
      children: [
        {
          path: '',
          component: () => import('@/components/TextReuseExplorerPage.vue'),
          name: 'textReuseOverview',
          meta: {
            requiresAuth: false,
            realm: 'textReuse'
          }
        },
        {
          path: 'statistics',
          component: () => import('@/components/TextReuseExplorerPage.vue'),
          name: 'textReuseStatistics',
          meta: {
            requiresAuth: false,
            realm: 'textReuse'
          }
        },
        {
          path: 'clusters',
          component: () => import('@/components/TextReuseExplorerPage.vue'),
          name: 'textReuseClusters',
          meta: {
            requiresAuth: false,
            realm: 'textReuse'
          }
        },
        {
          path: 'passages',
          component: () => import('@/components/TextReuseExplorerPage.vue'),
          name: 'textReusePassages',
          meta: {
            requiresAuth: false,
            realm: 'textReuse'
          }
        }
      ]
    },
    {
      path: '/text-reuse-clusters',
      component: () => import('@/pages/TextReuseClusters.vue'),
      name: 'text-reuse-clusters',
      // because of https://github.com/vuejs/vue-router/issues/822#issuecomment-255685008
      redirect: '/text-reuse-clusters/',
      meta: {
        requiresAuth: false
      },
      children: [
        {
          path: '',
          component: () => import('@/components/TextReuseClusterDetailPage.vue'),
          name: 'text-reuse-cluster-passages',
          meta: {
            requiresAuth: false
          }
        },
        {
          path: 'card',
          component: () => import('@/components/TextReuseClusterIdCardPage.vue'),
          name: 'text-reuse-cluster-detail',
          meta: {
            requiresAuth: false
          }
        },
        {
          path: 'connected-clusters',
          component: () => import('@/components/TextReuseConnectedClusters.vue'),
          name: 'text-reuse-connected-clusters',
          meta: {
            requiresAuth: false
          }
        }
      ]
    },
    {
      path: '/powervis',
      component: PowerUserVisualisation,
      name: 'powervis',
      meta: { requiresAuth: false }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const pathWithPrefix = String(BASE_URL + to.path).replace(/\/+/g, '/')
  // console.info('[router/index] Routing \-to : to', to.name, to.path, 'from', from.name, from.path)
  // Vue.prototype.$renderMetaTags({ title: to.name })
  // # forward page to matomo analytics using base.URL
  const analytics = (window as any as { _paq?: AnalyticsObject })._paq
  if (analytics) {
    console.info(
      '[router/index] Matomo tracking \n - path: ',
      pathWithPrefix,
      ' \n - title:',
      to.name
    )
    analytics.push(['setCustomUrl', pathWithPrefix])
    analytics.push(['setDocumentTitle', to.name as string])
    analytics.push(['trackPageView'])
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
      params: from.params
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
            redirect: to.path
          }
        })
      }
    })
  }
})

export default router
