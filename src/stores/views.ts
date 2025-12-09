import { defineStore } from 'pinia'
import { ViewCreateSpecialMembershipRequest, Views, ViewSpecialMembership } from '@/constants'
import { SpecialMembershipAccess } from '@/services/types'

export interface State {
  view: (typeof Views)[number] | null
  specialMembershipAccessItem: SpecialMembershipAccess | null
}

export const useViewsStore = defineStore('views', {
  state: (): State => ({
    view: null,
    // Modal item - stored as plain value since options API doesn't use refs in state
    specialMembershipAccessItem: null as SpecialMembershipAccess | null
  }),

  actions: {
    setView(newView: State['view']) {
      this.view = newView
    },

    resetView() {
      this.view = null
    },

    /**
     * Opens Special Membership modal.
     * Centralized to prevent duplicate modal instances in lists.
     * If an item is provided, opens the modal to view that item; otherwise, opens the modal to create a new request.
     * @param item Optional SpecialMembershipAccess item to view
     */
    openSpecialMembershipModal(item?: SpecialMembershipAccess) {
      this.specialMembershipAccessItem = item || null
      this.setView(item ? ViewCreateSpecialMembershipRequest : ViewSpecialMembership)
    }
  }
})
