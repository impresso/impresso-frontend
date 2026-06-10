import { InstitutionsAccessBaseUrl } from '@/constants'
import * as services from '@/services'
import { decodeJwt } from '@/util/auth'
import { createRouter, createWebHistory } from 'vue-router'
import { RoutesByRequestStatus } from './routes.js'

/**
 * Router configuration for the institutions-access sibling app.
 * This router operates independently from the main app and widget app.
 * All routes require authentication.
 */
const router = createRouter({
  history: createWebHistory(InstitutionsAccessBaseUrl),
  routes: [
    ...RoutesByRequestStatus.map(([status, path, name]) => ({
      path,
      name,
      component: () => import(`../views/Index.vue`),
      props: {
        status
      },
      meta: {
        requiresAuth: true
      }
    })),
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
      path: '/special-membership-request/:id',
      name: 'SpecialMembershipRequest',
      component: () => import('../views/Index.vue'),
      props: route => ({
        prefetchedItem: route.meta.prefetchedItem,
        status: route.meta.prefetchedStatus
      }),
      meta: {
        requiresAuth: true
      },
      beforeEnter: async to => {
        console.debug(
          '[router] Entering route for special membership request with ID:',
          to.params.id
        )
        try {
          const item = await services.userSpecialMembershipRequestsReviews.get(
            to.params.id as string
          )
          to.meta.prefetchedItem = item
          to.meta.prefetchedStatus = item?.status ?? 'pending'
          console.info('[router] Prefetched special membership request with ID:', to.params.id)
        } catch (e) {
          console.error('[router] Failed to prefetch special membership request:', e)
          to.meta.prefetchedStatus = 'pending'
        }
      }
    }
  ]
})

/**
 * Authentication guard for the institutions-access app.
 * Redirects unauthenticated users to the login page.
 */
router.beforeEach((to, _from, next) => {
  console.debug('[router] Checking authentication for route:', to.fullPath)
  if (to.meta.requiresAuth === false) {
    next()
  } else {
    services.app.authentication.getAccessToken().then(jwt => {
      try {
        const { groups } = decodeJwt(jwt)
        if (!groups || !Array.isArray(groups) || !groups.includes('institutions-access')) {
          console.warn('[router] JWT groups:', groups)
          console.info('[router] Your authentication token does not have the required group.')
          jwt = null
        }
        console.debug('[router] JWT decoded successfully. Groups:', groups)
      } catch (e) {
        console.error('[router] Invalid JWT token:', e)
        jwt = null
      }
      if (jwt) {
        next()
      } else {
        next({
          name: 'Login'
        })
      }
    })
  }
})

/**
 * Re-authentication guard for protected routes.
 * Ensures backend session is valid before route-level prefetch and JWT group checks.
 */
router.beforeEach(async (to, _from, next) => {
  console.debug('[router] Checking backend session for route:', to.fullPath)
  if (to.meta.requiresAuth === false) {
    next()
    return
  }

  try {
    await services.app.reAuthenticate(true)
    next()
  } catch (e) {
    console.warn('[router] Re-authentication failed:', e)
    next({
      name: 'Login'
    })
  }
})
export default router
