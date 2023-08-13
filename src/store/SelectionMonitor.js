export default {
  namespaced: true,
  state: {
    isActive: false,
    applyCurrentSearchFilters: false,
    // item that is currently selected
    item: null,
    // items that are currently selected
    items: [],
    // search query namespace, see SupportedFiltersByContext
    searchIndex: 'search',
    // `overview` or `filter` or `detail` or very specific scopes, like `comparePassages`
    // they are used to compose the title label
    scope: 'overview',
    type: null,
    displayTimeline: true,
    displayActionButtons: true,
    debug: false,
  },
  mutations: {
    SET_SELECTION(
      state,
      {
        item,
        type,
        searchIndex = 'search',
        scope = 'overview',
        items = [],
        applyCurrentSearchFilters = false,
        displayTimeline = true,
        displayActionButtons = true,
        displayCurrentSearchFilters = true,
      },
    ) {
      state.isActive = true
      state.item = item
      state.items = items
      state.searchIndex = searchIndex
      state.scope = scope
      state.type = type
      state.applyCurrentSearchFilters = applyCurrentSearchFilters
      state.displayTimeline = displayTimeline
      state.displayActionButtons = displayActionButtons
      state.displayCurrentSearchFilters = displayCurrentSearchFilters
    },
    CLEAR_SELECTION(state) {
      state.isActive = false
      state.item = null
      state.items = []
      state.searchIndex = 'search'
      state.scope = 'overview'
      state.type = null
      state.applyCurrentSearchFilters = false
      state.displayTimeline = true
      state.displayActionButtons = true
      state.displayCurrentSearchFilters = true
    },
  },
  actions: {
    // searchIndex is the namespace of the search query.
    // see SupportedFiltersBysearchIndex
    show({ commit }, payload) {
      // eslint-disable-next-line no-console
      console.debug('store.SelectionMonitor.show', payload)
      commit('SET_SELECTION', payload)
    },
    hide({ commit }) {
      commit('CLEAR_SELECTION')
    },
  },
}
