import { InstitutionsAccessBaseUrl } from '@/constants'
import { createRouter, createWebHistory } from 'vue-router'

/**
 * Router configuration for the institutions-access sibling app.
 * This router operates independently from the main app and widget app.
 */
const router = createRouter({
  history: createWebHistory(InstitutionsAccessBaseUrl),
  routes: [
    {
      path: '/',
      name: 'Login',
      component: () => import('../pages/LoginPage.vue')
    }
  ]
})

export default router
