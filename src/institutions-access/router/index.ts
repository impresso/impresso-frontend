import { InstitutionsAccessBaseUrl } from '@/constants'
import * as services from '@/services'
import { decodeJwt } from '@/util/auth'
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
      // check if jwt exists and if valid
      console.debug('[router] JWT token:', jwt, decodeJwt(jwt))
      try {
        const { groups } = decodeJwt(jwt)
        if (!groups || !Array.isArray(groups) || !groups.includes('institutions-access')) {
          console.warn('[router] JWT groups:', groups)
          console.info('[router] Your authentication token does not have the required group.')
          jwt = null
        }
      } catch (e) {
        console.error('[router] Invalid JWT token:', e)
        jwt = null
      }
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
