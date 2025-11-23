import { defineStore } from 'pinia'
import { Views } from '@/constants'

export interface State {
  view: (typeof Views)[number] | null
}

export const useViewsStore = defineStore('views', {
  state: (): State => ({
    view: null
  }),
  actions: {
    setView(newView: State['view']) {
      this.view = newView
    },
    resetView() {
      this.view = null
    }
  }
})
