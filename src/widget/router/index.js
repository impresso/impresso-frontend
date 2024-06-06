import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const propsFromRoute = ({ query }) => ({
  backgroundColor: query.backgroundColor,
  backgroundSize: query.backgroundSize,
  cssFilter: query.cssFilter,
  overlayBackgroundColor: query.overlayBackgroundColor,
  coordsMargin: query.coordsMargin,
  coords: query.coords,
})

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
  },
  {
    path: '/test/:path',
    name: 'TestFrame',
    component: () => import(/* webpackChunkName: "img" */ '../views/TestFrame.vue'),
  },
  {
    path: '/p/:pageUid/:coords/',
    name: 'StaticImage',
    component: () => import(/* webpackChunkName: "img" */ '../views/StaticImage.vue'),
    props: propsFromRoute,
  },
  {
    path: '/p/:pageUid/a/:articleUid/',
    name: 'ArticleViewer',
    component: () => import(/* webpackChunkName: "img" */ '../views/ArticleViewer.vue'),
    props: propsFromRoute,
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),

  },
];

const router = new VueRouter({
  base: import.meta.env.BASE_URL,
  routes,
});

export default router;
