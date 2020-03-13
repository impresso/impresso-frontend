import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

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
    props: ({ query }) => ({
      backgroundColor: query.backgroundColor,
      backgroundSize: query.backgroundSize,
    }),
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
  base: process.env.BASE_URL,
  routes,
});

export default router;
