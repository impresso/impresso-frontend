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

export const ViewTermsOfUse = 'terms-of-use'
export const ViewChangePlanRequest = 'change-plan-request'
export const ViewConfirmChangePlanRequest = 'confirm-change-plan-request'
export const ViewInfoModal = 'info-modal'
export const ViewUserRequests = 'user-requests'
export const ViewPlans = 'plans'
export const ViewCorpusOverview = 'corpus-overview'
export const Views: string[] = [
  ViewTermsOfUse,
  ViewChangePlanRequest,
  ViewConfirmChangePlanRequest,
  ViewUserRequests,
  ViewPlans,
  ViewCorpusOverview
]

const FeedbackOptionContentItemMetadataIssue = 'ContentItemMetadataIssue'
const FeedbackOptionLayoutSegmentationIssue = 'LayoutSegmentationIssue'
const FeedbackOptionDocumentLoadingIssue = 'DocumentLoadingIssue'
const FeedbackOptionOtherIssue = 'OtherIssue'
export const AvailableFeedbackOptions = [
  FeedbackOptionContentItemMetadataIssue,
  FeedbackOptionLayoutSegmentationIssue,
  FeedbackOptionDocumentLoadingIssue,
  FeedbackOptionOtherIssue
]
