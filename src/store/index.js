import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

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
  },
  state: {
    processing_status: false,
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
  },
  plugins: [createPersistedState({
    key: 'impresso',
    paths: [
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
