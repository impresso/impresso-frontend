export default {
  namespaced: true,
  state: {
    isActive: false,
    // item that is currently selected
    item: null,
    // items that are currently selected
    items: [],
    // search query namespace
    context: 'search',
    scope: 'overview',
    type: null,
  },
  mutations: {
    SET_SELECTION(state, { item, type, context = 'search', scope = 'overview', items = [] }) {
      state.isActive = true
      state.item = item
      state.items = items
      state.context = context
      state.scope = scope
      state.type = type
    },
    CLEAR_SELECTION(state) {
      state.isActive = false
      state.item = null
      state.items = []
      state.context = 'search'
      state.scope = 'overview'
      state.type = null
    },
  },
  actions: {
    // context is the namespace of the search query.
    // see SupportedFiltersByContext
    show({ commit }, payload) {
      commit('SET_SELECTION', payload)
    },
    hide({ commit }) {
      commit('CLEAR_SELECTION')
    },
  },
}
