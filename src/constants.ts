export const PlanGuest = 'guest'
export const PlanImpressoUser = 'plan-basic'
// IMPRESSO_GROUP_USER_PLAN_EDUCATIONAL = "plan-educational"
// IMPRESSO_GROUP_USER_PLAN_RESEARCHER = "plan-researcher"
export const PlanEducational = 'plan-educational'
export const PlanResearcher = 'plan-researcher'
export const PlanResearcherPlus = 'academic-user-plus'
export const PlanNone = 'no-plan'
export const PlanLabels: Record<string, string> = {
  [PlanGuest]: 'Guest',
  [PlanImpressoUser]: 'Basic User',
  [PlanEducational]: 'Student User',
  [PlanResearcher]: 'Academic User',
  [PlanResearcherPlus]: 'Academic User +',
  [PlanNone]: 'No Plan'
}
export const Plans: string[] = [
  PlanGuest,
  PlanImpressoUser,
  PlanEducational,
  PlanResearcher,
  PlanResearcherPlus,
  PlanNone
]

export const AvailablePlans = [PlanImpressoUser, PlanEducational, PlanResearcher]

export const AvailablePlansWithLabels = [
  {
    name: PlanImpressoUser,
    label: PlanLabels[PlanImpressoUser],
    description: 'Select if not enrolled in an academic institution',
    requireAffiliation: false,
    requireInstitutionalUrl: false
  },
  {
    name: PlanEducational,
    label: PlanLabels[PlanEducational],
    description: 'Select if you are enrolled as a student in an academic institution',
    requireAffiliation: true,
    requireInstitutionalUrl: false
  },
  {
    name: PlanResearcher,
    label: PlanLabels[PlanResearcher],
    description: 'Select if you are research staff in an academic institution',
    requireAffiliation: true,
    requireInstitutionalUrl: true
  }
]

export const ViewTermsOfUse = 'terms-of-use'
export const ViewChangePlanRequest = 'change-plan-request'
export const ViewChangePassword = 'change-password'
export const ViewChangePasswordSuccess = 'change-password-success'
export const ViewConfirmChangePlanRequest = 'confirm-change-plan-request'
export const ViewInfoModal = 'info-modal'
export const ViewSpecialMembership = 'special-membership'
export const ViewCreateSpecialMembershipRequest = 'create-special-membership-request'
export const ViewCreateSpecialMembershipRequestSuccess = 'create-special-membership-request-success'
export const ViewPlans = 'plans'
export const ViewCorpusOverview = 'corpus-overview'
export const ViewDataRundown = 'data-rundown'
export const ViewFeedback = 'feedback'
export const ViewShareContentItem = 'share-content-item'
export const Views: string[] = [
  ViewTermsOfUse,
  ViewChangePlanRequest,
  ViewChangePassword,
  ViewChangePasswordSuccess,
  ViewConfirmChangePlanRequest,
  ViewInfoModal,
  ViewPlans,
  ViewCorpusOverview,
  ViewFeedback,
  ViewDataRundown,
  ViewSpecialMembership,
  ViewCreateSpecialMembershipRequest,
  ViewCreateSpecialMembershipRequestSuccess,
  ViewShareContentItem
]

const FeedbackOptionContentItemMetadataIssue = 'ContentItemMetadataIssue'
const FeedbackOptionContentItemFacsimileIssue = 'ContentItemFacsimileIssue'
const FeedbackOptionContentItemTranscriptionIssue = 'ContentItemTranscriptionIssue'
const FeedbackOptionLayoutSegmentationIssue = 'LayoutSegmentationIssue'
const FeedbackOptionDocumentLoadingIssue = 'DocumentLoadingIssue'
export const FeedbackOptionOtherIssue = 'OtherIssue'
export const FeedbackOptionInterfaceIssue = 'InterfaceIssue'
export const FeedbackOptionDataIssue = 'DataIssue'
export const FeedbackOptionTermsOfUseIssue = 'TermsOfUseIssue'
export const FeedbackOptionDataAvailabilityIssue = 'DataAvailabilityIssue'
export const FeedbackOptionUnkownIssue = 'UnknownIssue'

export const AvailableFeedbackOptions = [
  FeedbackOptionContentItemMetadataIssue,
  FeedbackOptionContentItemFacsimileIssue,
  FeedbackOptionContentItemTranscriptionIssue,
  FeedbackOptionLayoutSegmentationIssue,
  FeedbackOptionDocumentLoadingIssue,
  FeedbackOptionOtherIssue
]

export const DatalabPublicApiUrl =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_DATALAB_PUBLIC_API_URL
    ? import.meta.env.VITE_DATALAB_PUBLIC_API_URL
    : ''

export const PlansJsonUrl: string =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_PLANS_JSON_URL
    ? import.meta.env.VITE_PLANS_JSON_URL
    : ''

export const WebAppHost: string =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_HOST
    ? import.meta.env.VITE_APP_HOST
    : 'http://localhost:5173'

export const WebAppBaseUrl: string =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_BASE_URL
    ? import.meta.env.VITE_APP_BASE_URL
    : '/'

export const WidgetBaseUrl: string =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_WIDGET_BASE_URL
    ? import.meta.env.VITE_WIDGET_BASE_URL
    : '/widget/'
