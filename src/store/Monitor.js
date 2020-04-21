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
    item: null,
    type: null,
    itemCountRelated: -1,
    uid: '',
    searchQueryNamespace: DEFAULT_SEARCH_NAMESPACE,
    timeline: [],
    groupBy: 'articles',
    subtitle: undefined,
    disableFilterModification: false,
    filters: []
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
    SET_APPLY_CURRENT_SEARCH_FILTERS(state, value) {
      state.applyCurrentSearchFilters = value;
    },
    SET_ITEM_TYPE(state, type) {
      state.type = type;
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
    HIDE({ commit }) { commit('SET_IS_ACTIVE', false) },
    SET_APPLY_CURRENT_SEARCH_FILTERS({ commit }, value) {
      commit('SET_APPLY_CURRENT_SEARCH_FILTERS', value);
    },
    LOAD_ITEM_TIMELINE({ state, commit }) {
      commit('RESET_TIMELINE');
      let filters = [
        {
          type: state.type,
          q: state.item.uid,
        },
      ];
      // if user asked to get details in current search:
      if (state.applyCurrentSearchFilters) {
        filters = filters.concat(state.filters);
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
    SET_ITEM({ commit, dispatch }, { item, type }) {
      commit('SET_IS_ACTIVE', true);
      commit('SET_PENDING_ITEM', item);
      commit('SET_ITEM_TYPE', type);
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
        if (type === 'monitor/HIDE') {
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
