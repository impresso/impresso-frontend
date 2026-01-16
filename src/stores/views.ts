import { defineStore } from 'pinia'
import {
  ViewCreateSpecialMembershipRequest,
  Views,
  ViewShareContentItem,
  ViewSpecialMembership
} from '@/constants'
import { SpecialMembershipAccess } from '@/services/types'
import { ContentItem } from '@/models/generated/schemas'

export interface State {
  view: (typeof Views)[number] | null
  specialMembershipAccessItem: SpecialMembershipAccess | null
  contentItem: ContentItem | null
}

export const useViewsStore = defineStore('views', {
  state: (): State => ({
    view: null,
    // Modal item - stored as plain value since options API doesn't use refs in state
    specialMembershipAccessItem: null as SpecialMembershipAccess | null,
    contentItem: null as ContentItem | null
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
    },

    /**
     * Opens Share Content Item modal.
     * Centralized to prevent duplicate modal instances in lists.
     * @param item
     */
    openShareContentItemModal(item?: State['contentItem']) {
      this.contentItem = item
      this.setView(item ? ViewShareContentItem : null)
    }
  }
})
