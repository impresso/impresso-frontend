import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import { errorCollector } from '@/services';

import settings from './Settings';
import collections from './Collections';
import user from './User';
import search from './Search';
import searchImages from './SearchImages';
import autocomplete from './Autocomplete';
import issue from './Issue';
import newspapers from './Newspapers';
import articles from './Articles';
import topics from './Topics';
import jobs from './Jobs';
import entities from './Entities';
import embeddings from './Embeddings';
import monitor from './Monitor';
import explorer from './Explorer';
import buckets from './Buckets';
import queryComparison from './QueryComparison';

Vue.use(Vuex);

let processing; // timeout object
let processings = 0; // counter for the amount of async processes

export default new Vuex.Store({
  modules: {
    articles,
    settings,
    search,
    searchImages,
    autocomplete,
    user,
    issue,
    collections,
    topics,
    jobs,
    newspapers,
    entities,
    embeddings,
    monitor,
    buckets,
    explorer,
    queryComparison,
  },
  state: {
    processing_status: false,
    processing_locked: false,
    processing_message: '',
    error_message: '',
    header_title: '',
    header_subtitle: '',
  },
  getters: {
    headerTitle(state) {
      let title = '';

      if (state.header_title.length > 0 && state.header_subtitle.length > 0) {
        title = `<span class="title">${state.header_title}</span> / <span class="subtitle">${state.header_subtitle}</span>`;
      } else if (state.header_subtitle.length > 0) {
        title = `<span class="subtitle">${state.header_subtitle}</span>`;
      } else if (state.header_title.length > 0) {
        title = `<span class="title">${state.header_title}</span>`;
      }

      return title;
    },
  },
  mutations: {
    SET_HEADER_TITLE(state, payload) {
      state.header_title = String(payload.title || '');
      state.header_subtitle = String(payload.subtitle || '');
    },
    LOCK_SCREEN(state, status) {
      state.processing_locked = status;
    },
    SET_PROCESSING(state, status) {
      if (status === true) {
        processings += 1;
        if (processings === 1) {
          processing = setTimeout(() => {
            state.processing_status = true;
          }, 100);
        }
      } else {
        processings -= 1;
        if (processings === 0) {
          clearTimeout(processing);
          state.processing_status = false;
        }
      }
    },
    SET_ERROR_MESSAGE(state, message) {
      state.error_message = message;
    },
  },
  actions: {
    async DISPLAY_ERROR({ commit }, error) {
      const errorRoute = [];
      // get error route if possible
      try {
        errorRoute.push(error.hook.path);
        errorRoute.push(error.hook.method);
      } catch (e) {
        console.warn(e);
      }
      console.error(`[Unexpected error ${error.name}]: ${errorRoute.join('.')}`,
        error.code,
        error.name,
        error.message,
        error.stack,
      );
      commit('SET_ERROR_MESSAGE', error.message);
      // do not force if BadGateway or polling error (risk of having endless and useless loops)
      if (['BadGateway'].includes(error.name)) {
        console.info('Error', error.name, 'at', errorRoute, 'hasn\'t been dispatched, risk of loopholes');
      } else {
        await errorCollector.create({
          uri: errorRoute.join('.'),
          ...error,
        }).catch((err) => {
          console.error('[Unexpected error in sending the error]', err);
        });
      }
    },
  },
  plugins: [createPersistedState({
    key: 'impresso',
    paths: [
      'settings.termsAgreed',
      'settings.lastNotificationDate',
      'settings.language_code',
      'search.searches',
      'search.displaySortBy',
      'search.displaySortOrder',
      'search.displayStyle',
      'search.filterFacetYearExpanded',
      'user.rememberCredetials',
      'user.userData',
      'collections.collectionsSortOrder',
      'issue.viewerMode',
      'newspapers.orderBy',
    ],
  })],
});
