import { InstitutionsAccessBaseUrl } from '@/constants'
import * as services from '@/services'
import { createRouter, createWebHistory } from 'vue-router'

/**
 * Router configuration for the institutions-access sibling app.
 * This router operates independently from the main app and widget app.
 * All routes require authentication.
 */
const router = createRouter({
  history: createWebHistory(InstitutionsAccessBaseUrl),
  routes: [
    {
      path: '/',
      name: 'Index',
      component: () => import('../views/Index.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: {
        requiresAuth: false
      }
    },
    {
      path: '/magic-link/:token?',
      name: 'MagicLink',
      component: () => import('../views/MagicLink.vue'),
      meta: {
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
    }
  ]
})

/**
 * Authentication guard for the institutions-access app.
 * Redirects unauthenticated users to the login page.
 */
router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAuth === false) {
    next()
  } else {
    services.app.authentication.getAccessToken().then(jwt => {
      if (jwt) {
        next()
      } else {
        next({
          name: 'Login',
          query: {
            redirect: to.path
          }
        })
      }
    })
  }
})

export default router
