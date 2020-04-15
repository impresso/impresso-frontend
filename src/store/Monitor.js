import * as services from '@/services';
import Helpers from '@/plugins/Helpers';
import Entity from '@/models/Entity';
import Topic from '@/models/Topic';

const DEFAULT_SEARCH_NAMESPACE = 'search';

const serviceByType = {
  person: 'entities',
  location: 'entities',
};

export default {
  namespaced: true,
  state: {
    isActive: false,
    isPending: false,
    isPendingTimeline: false,
    applyCurrentSearchFilters: true,
    position: {
      top: 0,
      left: 0,
    },
    viewport: {
      height: 0,
      width: 0,
    },
    scrolltop: 0,
    item: null,
    type: null,
    itemCountRelated: -1,
    uid: '',
    searchQueryId: undefined,
    searchQueryNamespace: DEFAULT_SEARCH_NAMESPACE,
    timeline: [],
    groupBy: 'articles',
    subtitle: undefined,
    disableFilterModification: false,
    filters: []
  },
  getters: {
    // getCurrentSearchQuery(state, getters, rootState, rootGetter) {
    //   if (state.searchQueryId.length) {
    //     return rootGetter[`${state.searchQueryNamespace}/getSearchQuery`](state.searchQueryId);
    //   }
    //   return rootGetter[`${state.searchQueryNamespace}/getSearch`];
    // },
    getCurrentSearchFilters(state) {
      return state.filters
      // return getters.getCurrentSearchQuery.getFilters();
    },
  },
  mutations: {
    SET_IS_ACTIVE(state, value) {
      state.isActive = !!value;
    },
    SET_ITEM(state, item) {
      state.item = item; // update item
      state.isPending = false;
    },
    SET_ITEM_TIMELINE(state, timeline) {
      console.info('mutation SET_ITEM_TIMELINE', timeline.length, timeline[0]);
      state.timeline = timeline;
      state.isPendingTimeline = false;
    },
    SET_ITEM_COUNT_RELATED(state, n) {
      state.itemCountRelated = parseInt(n, 10);
    },
    SET_PENDING_ITEM(state, item) {
      state.item = item;
      state.isPending = true;
    },
    RESET_TIMELINE(state) {
      state.timeline = [];
      state.isPendingTimeline = true;
    },
    SET_POSITION(state, { top, left }) {
      state.position.top = top;
      state.position.left = left;
      // check the position related to viewport and scrolltop values
    },
    SET_VIEWPORT(state, { height, width }) {
      state.viewport.height = height;
      state.viewport.width = width;
    },
    SET_SCROLLTOP(state, scrollTop) {
      state.scrolltop = parseInt(scrollTop, 10);
    },
    SET_APPLY_CURRENT_SEARCH_FILTERS(state, value) {
      state.applyCurrentSearchFilters = value;
    },
    SET_ITEM_TYPE(state, type) {
      state.type = type;
    },
    SET_SEARCH_QUERY_ID(state, searchQueryId = '') {
      if (searchQueryId.length) {
        const parts = searchQueryId.split('/');
        state.searchQueryId = parts.length > 1 ? parts[1] : searchQueryId;
        state.searchQueryNamespace = parts.length > 1 ? parts[0] : DEFAULT_SEARCH_NAMESPACE;
      } else {
        state.searchQueryId = '';
        state.searchQueryNamespace = DEFAULT_SEARCH_NAMESPACE;
      }
      console.info('Monitor/SET_SEARCH_QUERY_ID', searchQueryId);
    },
    /**
     * @param {object} state
     * @param {{
     *  subtitle: string | undefined
     *  disableFilterModification: boolean
     *  filters: import('@/models').Filter[]
     * }} param
     */
    SET_ACTIVATION_PARAMETERS(state, { subtitle, disableFilterModification, filters }) {
      state.subtitle = subtitle
      state.disableFilterModification = disableFilterModification
      state.filters = filters
    },
    UPDATE_FILTERS(state, filters) {
      state.filters = filters
    }
  },
  actions: {
    // FORWARD_FILTER_TO_CURRENT_SEARCH({ getters }, filter) {
    //   getters.getCurrentSearchQuery.addFilter(filter);
    //   // dispatch(`${state.searchQueryNamespace}/ADD_FILTER`, {
    //   //   searchQueryId: state.searchQueryId,
    //   //   filter,
    //   // }, {
    //   //   root: true,
    //   // });
    // },
    SET_IS_ACTIVE({ commit }, value) {
      commit('SET_IS_ACTIVE', value);
    },
    SET_APPLY_CURRENT_SEARCH_FILTERS({ commit }, value) {
      commit('SET_APPLY_CURRENT_SEARCH_FILTERS', value);
    },
    LOAD_ITEM_TIMELINE({ state, commit, getters }) {
      commit('RESET_TIMELINE');
      let filters = [
        {
          type: state.type,
          q: state.item.uid,
        },
      ];
      // if user asked to get details in current search:
      if (state.applyCurrentSearchFilters) {
        filters = filters.concat(getters.getCurrentSearchFilters);
      }
      // fetch article timeline related to the given type
      return services.search.find({
        lock: false,
        query: {
          group_by: state.groupBy,
          filters,
          facets: 'year',
          limit: 0,
        },
        limit: 0,
      }).then((res) => {
        commit('SET_ITEM_COUNT_RELATED', res.total);
        if (res.info.facets && res.info.facets.year) {
          commit('SET_ITEM_TIMELINE', Helpers.timeline.fromBuckets(res.info.facets.year.buckets));
        }
      });
    },
    SET_ITEM({ commit, dispatch }, { item, type, searchQueryId }) { // }, position }) {
      commit('SET_IS_ACTIVE', true);
      commit('SET_PENDING_ITEM', item);
      commit('SET_ITEM_TYPE', type);
      commit('SET_SEARCH_QUERY_ID', searchQueryId);
      // add item resolution promise to the promise chain
      if (serviceByType[type]) {
        return Promise.all([
          dispatch('LOAD_ITEM_TIMELINE'),
          services[serviceByType[type]].get(item.uid).then((res) => {
            if (['location', 'person'].indexOf(type) !== -1) {
              commit('SET_ITEM', new Entity(res));
            } else if (type === 'topic') {
              commit('SET_ITEM', new Topic(res));
            } else {
              commit('SET_ITEM', res);
            }
          }),
        ]).catch((err) => {
          console.error(err);
        });
      }
      // if there is no item to fetch, just get the timeline data.
      commit('SET_ITEM', item);
      return dispatch('LOAD_ITEM_TIMELINE');
    },
    SET_VIEWPORT({ commit }, viewport) {
      commit('SET_VIEWPORT', viewport);
    },
    SET_SCROLLTOP({ commit }, scrollTop) {
      commit('SET_SCROLLTOP', scrollTop);
    },
    /**
     * @typedef {{
     *  item: import('@/models').Entity,
     *  type: string,
     *  filters: import('@/models').Filter[]
     *  filtersUpdatedCallback: (filters: import('@/models').Filter) => void
     *  subtitle?: string
     *  disableFilterModification?: boolean
     * }} ActivateParams
     * @param {import('vuex').ActionContext} param0
     * @param {ActivateParams} param1
     */
    ACTIVATE({ commit, dispatch }, {
      item,
      type,
      filters = [],
      filtersUpdatedCallback = () => {},
      subtitle = undefined,
      disableFilterModification = false
    }) {
      const unsubscribe = this.subscribeAction(({ type, payload }) => {
        if (type === 'monitor/UPDATE_FILTERS') filtersUpdatedCallback(payload)
        if (type === 'monitor/SET_IS_ACTIVE' && payload === false) {
          unsubscribe()
        }
      })
      commit('SET_ACTIVATION_PARAMETERS', {
        subtitle,
        disableFilterModification,
        filters
      })
      return dispatch('SET_ITEM', { item, type })
    },
    UPDATE_FILTERS({ commit }, filters) {
      commit('UPDATE_FILTERS', filters)
    }
  },
};
