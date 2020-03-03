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
    router.push({ name: 'searchNgrams', query })
      .catch((err) => {
        if (err.name !== 'NavigationDuplicated') {
          throw err;
        }
      });
  },
  /**
   * Update state from URL query parameters.
   */
  PULL_SEARCH_PARAMS({ commit, dispatch }, query) {
    try {
      commit('UPDATE_SEARCH_QUERY_FILTERS', JSON.parse(query.f));
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
    }
    commit('SET_UNIGRAM', query.unigram || 'impresso');
    dispatch('SEARCH');
  },
  ADD_FILTER({ commit }, { filter }) {
    commit('ADD_FILTER', filter);
  },
  REMOVE_FILTER({ commit }, { filter }) {
    commit('REMOVE_FILTER', filter);
  },
  RESET_FILTER({ commit }, { type }) {
    commit('RESET_FILTER', type);
  },
  UPDATE_FILTER({ commit }, message) {
    commit('UPDATE_FILTER', message);
  },
  UPDATE_FILTER_ITEM({ commit }, message) {
    commit('UPDATE_FILTER_ITEM', message);
  },
  SET_UNIGRAM({ commit }, unigram) {
    commit('SET_UNIGRAM', unigram);
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
      total: results.trends[0].total,
      timeInterval: results.timeInterval,
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
    const query = {
      ...router.currentRoute.query,
      unigram,
    };
    router.replace({ name: 'searchNgrams', query })
      .catch((err) => {
        if (err.name !== 'NavigationDuplicated') {
          throw err;
        }
      });
  },
  SET_TREND(state, trend) {
    Vue.set(state, 'trend', trend);
  },
  RESET_FILTER({ search }, type) {
    search.resetFilter(type);
  },
  UPDATE_FILTER_ITEM({ search }, { filter, item, uid }) {
    search.updateFilterItem({ filter, item, uid });
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
