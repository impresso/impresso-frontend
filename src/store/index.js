import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

import settings from './Settings';
import collections from './Collections';
import user from './User';
import search from './Search';
import autocomplete from './Autocomplete';
import issue from './Issue';

Vue.use(Vuex);

let processing; // timeout object
let processings = 0; // counter for the amount of async processes

export default new Vuex.Store({
  modules: {
    settings,
    search,
    autocomplete,
    user,
    issue,
    collections,
  },
  state: {
    processing_status: false,
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
    SET_PROCESSING(state, status) {
      if (status === true) {
        processings += 1;
        if (processings === 1) {
          processing = setTimeout(() => {
            state.processing_status = true;
          }, 500);
        }
      } else {
        processings -= 1;
        if (processings === 0) {
          clearTimeout(processing);
          state.processing_status = false;
        }
      }
    },
  },
  plugins: [createPersistedState({
    key: 'impresso',
    paths: [
      'settings.language_code',
      'settings.sidebar_userdata_expanded',
      'search.facets',
      'search.search',
      'search.results',
      'search.searches',
      'search.displaySortBy',
      'search.displaySortOrder',
      'search.displayStyle',
      'search.paginationPerPage',
      'search.paginationCurrentPage',
      'search.paginationTotalRows',
      'user.rememberCredetials',
      'user.userData',
      'collections.collections',
      'collections.collectionsSortOrder',
    ],
  })],
});
