import { defineStore } from 'pinia'

export interface State {
  isActive: boolean
  applyCurrentSearchFilters: boolean
  item: any
  items: any[]
  searchIndex: string
  scope: string
  type: string | null
  displayTimeline: boolean
  displayActionButtons: boolean
  debug: boolean
  displayCurrentSearchFilters: boolean
}

export const useSelectionMonitorStore = defineStore('selectionMonitor', {
  state: (): State => ({
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
    displayCurrentSearchFilters: false
  }),
  getters: {},
  actions: {
    show(payload?: Partial<State>) {
      this.isActive = payload?.isActive ?? true;
      this.item = payload?.item ?? null;
      this.items = payload?.items ?? [];
      this.searchIndex = payload?.searchIndex ?? 'search';
      this.scope = payload?.scope ?? 'overview';
      this.type = payload?.type ?? null;
      this.applyCurrentSearchFilters = payload?.applyCurrentSearchFilters ?? false;
      this.displayTimeline = payload?.displayTimeline ?? true;
      this.displayActionButtons = payload?.displayActionButtons ?? true;
      this.displayCurrentSearchFilters = payload?.displayCurrentSearchFilters ?? false;
    },
    hide() {
      this.isActive = false
      this.item = null
      this.items = []
      this.searchIndex = 'search'
      this.scope = 'overview'
      this.type = null
      this.applyCurrentSearchFilters = false
      this.displayTimeline = true
      this.displayActionButtons = true
      this.displayCurrentSearchFilters = true
    },
  },
  persist: {
    paths: [],
  },
})
