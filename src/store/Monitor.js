import * as services from '@/services';
import Helpers from '@/plugins/Helpers';
import Entity from '@/models/Entity';
import Topic from '@/models/Topic';

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
    timeline: [],
    groupBy: 'articles',
  },
  getters: {
    getCurrentSearchFilters(state, getters, rootState, rootGetter) {
      return rootGetter['search/getSearch'].getFilters();
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
      console.log('mutation SET_ITEM_TIMELINE', timeline.length, timeline[0]);
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
  },
  actions: {
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
        query: {
          group_by: state.groupBy,
          filters,
          facets: 'year',
          limit: 0,
        },
        limit: 0,
      }).then((res) => {
        commit('SET_ITEM_COUNT_RELATED', res.total);
        commit('SET_ITEM_TIMELINE', Helpers.timeline.fromBuckets(res.info.facets.year.buckets));
      });
    },
    SET_ITEM({ state, commit, dispatch }, { item, type }) { // }, position }) {
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
    SET_VIEWPORT({ state, commit }, viewport) {
      commit('SET_VIEWPORT', viewport);
    },
    SET_SCROLLTOP({ commit }, scrollTop) {
      commit('SET_SCROLLTOP', scrollTop);
    },
  },
};
