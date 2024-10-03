import { createRouter, createWebHashHistory } from 'vue-router'

const propsFromRoute = ({ query }) => ({
  backgroundColor: query.backgroundColor,
  backgroundSize: query.backgroundSize,
  cssFilter: query.cssFilter,
  overlayBackgroundColor: query.overlayBackgroundColor,
  coordsMargin: query.coordsMargin,
  coords: query.coords
})

const router = createRouter({
  history: createWebHashHistory(import.meta.env.VITE_WIDGET_BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/About.vue')
    },
    {
      path: '/test/:path',
      name: 'TestFrame',
      component: () => import('../views/TestFrame.vue')
    },
    {
      path: '/p/:pageUid/:coords/',
      name: 'StaticImage',
      component: () => import('../views/StaticImage.vue'),
      props: propsFromRoute
    },
    {
      path: '/p/:pageUid/a/:articleUid/',
      name: 'ArticleViewer',
      component: () => import('../views/ArticleViewer.vue'),
      props: propsFromRoute
    },
    {
      path: '/about',
      name: 'About',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/About.vue')
    }
  ]
})

export default router
