import { defineStore } from 'pinia'

export const ViewTermsOfUse = 'terms-of-use'
export const ViewChangePlanRequest = 'change-plan-request'
export const ViewConfirmChangePlanRequest = 'confirm-change-plan-request'
export const Views: string[] = [ViewTermsOfUse, ViewChangePlanRequest, ViewConfirmChangePlanRequest]

export interface State {
  view: (typeof Views)[number] | null
}

export const useViewsStore = defineStore('views', {
  state: (): State => ({
    view: ViewTermsOfUse
  })
})
