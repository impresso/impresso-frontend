/* eslint-disable no-shadow */
// @ts-check

import Vue from 'vue';
import SearchQuery from '../models/SearchQuery';
import Facet from '../models/Facet';
import router from '../router';
import { ngramTrends as ngramTrendsService } from '../services';

const AvailableFacets = [
  'year',
  'language',
  'newspaper',
  'type',
  'country',
  'topic',
];

const FacetsOperators = {
  person: ['OR', 'AND'],
  location: ['OR', 'AND'],
  topic: ['OR', 'AND'],
};

/**
 * @typedef {object} State
 * @property {SearchQuery} search - has to be named "search". Required by SearchFacets
 * @property {Facet[]} facets - list of facets to render. Required
 * @property {String} groupBy - required by SearchFacets
 * @property {String} unigram - unigram
 * @property {object} trend - trend values
 */
const state = {
  search: new SearchQuery({
    filters: [{ type: 'hasTextContents' }],
  }),
  facets: AvailableFacets.map(type => new Facet({ type, operators: FacetsOperators[type] })),
  groupBy: 'articles',
  unigram: undefined,
  trend: {},
};

/** @type {import("vuex").ActionTree<State>} */
const actions = {
  /**
   * Update URL query parameters.
   */
  PUSH_SEARCH_PARAMS({ state }) {
    const query = {
      f: JSON.stringify(state.search.getFilters()),
      unigram: state.unigram,
    };
    router.push({ name: 'searchNgrams', query });
  },
  /**
   * Update state from URL query parameters.
   */
  PULL_SEARCH_PARAMS({ commit, dispatch }, query) {
    commit('UPDATE_SEARCH_QUERY_FILTERS', JSON.parse(query.f));
    dispatch('SEARCH');
  },
  ADD_FILTER({ commit }, { filter }) {
    commit('ADD_FILTER', filter);
  },
  REMOVE_FILTER({ commit }, { filter }) {
    commit('REMOVE_FILTER', filter);
  },
  UPDATE_FILTER({ commit }, message) {
    commit('UPDATE_FILTER', message);
  },
  UPDATE_FILTER_ITEM({ commit }, message) {
    commit('UPDATE_FILTER_ITEM', message);
  },
  async SEARCH({ state, commit }) {
    if (state.unigram === undefined) return;
    const query = {
      ngrams: [state.unigram],
      filters: state.search.getFilters(),
      facets: AvailableFacets,
    };
    const results = await ngramTrendsService.create(query);
    commit('SET_TREND', {
      values: results.trends[0].values,
      domain: results.domainValues,
    });

    AvailableFacets.forEach((type) => {
      if (results.info.facets[type]) {
        commit('UPDATE_FACET', {
          type,
          buckets: results.info.facets[type].buckets,
          numBuckets: results.info.facets[type].numBuckets,
        });
      }
    });
  },
};

/** @type {import("vuex").GetterTree<State>} */
const getters = {
  searchQuery: state => state.search,
  trend: state => state.trend,
};

/** @type {import("vuex").MutationTree<State>} */
const mutations = {
  UPDATE_SEARCH_QUERY_FILTERS({ search }, filters) {
    search.updateFilters(filters);
  },
  UPDATE_FACET({ facets }, { type, numBuckets, buckets }) {
    const facet = facets.find(d => d.type === type);
    if (facet) {
      facet.numBuckets = numBuckets;
      if (type === 'year') {
        const sortedBuckets = buckets.sort((a, b) => parseInt(a.val, 10) - parseInt(b.val, 10));
        facet.setBuckets(sortedBuckets);
      } else {
        facet.setBuckets(buckets);
      }
    } else {
      console.error('Could not find any `facet` having type:', type);
    }
  },
  ADD_FILTER({ search }, filter) {
    search.addFilter({ ...filter });
  },
  UPDATE_FILTER({ search }, { filter, q, op, context, precision, distance }) {
    search.updateFilter({
      filter, q, op, context, precision, distance, items: undefined,
    });
  },
  SET_UNIGRAM(state, unigram) {
    state.unigram = unigram;
  },
  SET_TREND(state, trend) {
    Vue.set(state, 'trend', trend);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
