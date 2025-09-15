export const PlanGuest = 'guest'
export const PlanImpressoUser = 'plan-basic'
// IMPRESSO_GROUP_USER_PLAN_EDUCATIONAL = "plan-educational"
// IMPRESSO_GROUP_USER_PLAN_RESEARCHER = "plan-researcher"

export const PlanEducational = 'plan-educational'
export const PlanResearcher = 'plan-researcher'
export const PlanResearcherPlus = 'academic-user-plus'
export const PlanNone = 'no-plan'

// USER_PLAN_GUEST = 0b1
// USER_PLAN_AUTH_USER = 0b11
// USER_PLAN_EDUCATIONAL = 0b111
// USER_PLAN_RESEARCHER = 0b1011
export const PlanEducationalAsBigInt = BigInt(0b111)
export const PlanImpressoUserAsBigInt = BigInt(0b10)
export const PlanResearcherAsBigInt = BigInt(0b1011)
export const PlanResearcherPlusAsBigInt = BigInt(0b10011)
export const PlanGuestAsBigInt = BigInt(0b1)
export const PlanNoneAsBigInt = BigInt(0b0)

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

export const PlansAsBigInt: Record<string, bigint> = {
  [PlanNone]: PlanNoneAsBigInt,
  [PlanGuest]: PlanGuestAsBigInt,
  [PlanImpressoUser]: PlanImpressoUserAsBigInt,
  [PlanEducational]: PlanEducationalAsBigInt,
  [PlanResearcher]: PlanResearcherAsBigInt,
  [PlanResearcherPlus]: PlanResearcherPlusAsBigInt
}

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
export const ViewUserRequests = 'user-requests'
export const ViewPlans = 'plans'
export const ViewCorpusOverview = 'corpus-overview'
export const ViewDataRundown = 'data-rundown'
export const ViewFeedback = 'feedback'
export const Views: string[] = [
  ViewTermsOfUse,
  ViewChangePlanRequest,
  ViewChangePassword,
  ViewChangePasswordSuccess,
  ViewConfirmChangePlanRequest,
  ViewUserRequests,
  ViewPlans,
  ViewCorpusOverview,
  ViewFeedback,
  ViewDataRundown
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
