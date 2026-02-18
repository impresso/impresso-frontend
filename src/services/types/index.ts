import type { ServiceMethods } from '@feathersjs/feathers'
import { ImageService } from './images'
import { EmbeddingsService } from './embeddings'
import { DatalabSupportService } from './datalabSupport'
import { BaristaService } from './barista'
import { ContentItemsService } from './contentItems'
import { SearchFacetsService } from './searchFacets'
import { MentionsService } from './mentions'
import { ICollectableItemsService } from './collectableItems'
import { AdminService } from './admin'

interface ErrorsCollectorPayload {
  id: string
  url: string
  errorMessage: string
  stackTrace?: string
  origin?: string
  className?: string
  type?: string
}
export interface ErrorsCollectorService
  extends Pick<ServiceMethods<{}, ErrorsCollectorPayload>, 'create'> {}

type UntypedService = Partial<ServiceMethods<any, any, any, any>>

/**
 * Generic interface for Feathers service find method parameters.
 * Includes query object for filtering, pagination, and other options.
 */
export interface ServiceFindParams {
  query: {
    offset?: number
    limit?: number
    [key: string]: any
  }
  [key: string]: any
}

interface UntypedServices {
  [key: string]: UntypedService
}

export interface Services extends UntypedServices {
  ['errors-collector']: ErrorsCollectorService
  ['datalab-support']: DatalabSupportService
  admin: AdminService
  images: ImageService
  embeddings: EmbeddingsService
  ['barista-proxy']: BaristaService
  ['content-items']: ContentItemsService
  ['search-facets/search']: SearchFacetsService
  mentions: MentionsService
  ['/collections/:collection_id/items']: ICollectableItemsService
}

export interface Group {
  id: number
  name: string
}

export interface ChangelogEntry {
  date: string
  plan: string
  notes: string
  status: string
}

export interface UserSpecialMembershipRequestChangelogEntry {
  subscription: string
  date: string
  reviewer: string
  status: string
  notes?: string
}

export interface UserChangePlanRequest {
  id: number
  dateCreated: string
  dateLastModified: string
  status: 'pending' | 'approved' | 'rejected'
  changelog: ChangelogEntry[]
  notes: string | null
  planId: number
  userId: number
  plan: Group
}

export interface TermsOfUse {
  id: number
  bitmap: string
  dateAcceptedTerms: string | null
}

/**
 * Special Membership Access item interface,
 * it defines the structure of a special membership access item, with bitmap position.
 * It could handle optionally a associated list of UserSpecialMembershipRequest items.
 */
export interface SpecialMembershipAccess {
  id: number
  reviewerId?: number | null
  title: string
  bitmapPosition: number
  metadata?: {
    provider?: string
    note?: string
  }
  requests?: UserSpecialMembershipRequest[]
}

export interface UserSpecialMembershipRequest {
  id: number
  reviewerId: number | null
  specialMembershipAccessId: number
  userId: number
  specialMembershipAccess: SpecialMembershipAccess
  dateCreated: string
  dateLastModified: string
  status: 'pending' | 'approved' | 'rejected'
  changelog: UserSpecialMembershipRequestChangelogEntry[]
}

export interface UserSpecialMembershipRequestReview {
  // new type from media endpoint
  // { "id": 80, "reviewerId": null, "userId": 1, "specialMembershipAccessId": 37, "dateCreated": "2026-01-28T07:38:09.000Z", "dateLastModified": "2026-01-28T07:38:09.000Z", "status": "pending", "changelog": [ { "date": "2026-01-28T07:38:09.206Z", "notes": "This is a message for the reviewer", "status": "pending", "reviewer": "", "subscription": "Domain of CNA archive" } ], "specialMembershipAccess": { "id": 37, "reviewerId": 1, "title": "Domain of CNA archive", "bitmapPosition": 36, "metadata": {} }, "requester": { "id": 1, "email": "daniele.guido@uni.lu", "firstname": "Daniele", "lastname": "Guido", "groups": [ { "id": 2, "name": "plan-researcher", "auth_user_groups": { "user_id": 1, "group_id": 2 } }, { "id": 3, "name": "plan-educational", "auth_user_groups": { "user_id": 1, "group_id": 3 } }, { "id": 4, "name": "NoRedaction", "auth_user_groups": { "user_id": 1, "group_id": 4 } } ], "profile": { "id": 2, "uid": "local-dg", "provider": "local", "displayName": "Daniele Guido", "pattern": "#588c7e,#f2e394,#96ceb4,#677e96,#677e96", "picture": null, "user_id": 1, "emailAccepted": false, "maxLoopsAllowed": 200, "maxParallelJobs": 2, "institutionalUrl": "", "affiliation": "University of Luxembourg", "profileId": 1 } } }
  id: number
  reviewerId: number | null
  specialMembershipAccessId: number
  userId: number
  specialMembershipAccess: SpecialMembershipAccess
  dateCreated: string
  dateLastModified: string
  status: 'pending' | 'approved' | 'rejected'
  changelog: UserSpecialMembershipRequestChangelogEntry[]
  requester: {
    id: number
    email: string
    firstname: string
    lastname: string
    groups: Group[]
    profile: {
      id: number
      uid: string
      provider: string
      displayName: string
      pattern: string
      picture: string | null
      user_id: number
      emailAccepted: boolean
      maxLoopsAllowed: number
      maxParallelJobs: number
      institutionalUrl: string
      affiliation: string
      profileId: number
    }
    bitmap: string
  }
}

export type DataRelease = {
  id: string
  releaseVersion: string
  releaseName: string
  impressoCorpusOverview: {
    npsStats: {
      titles: number
      issues: number
      pages: number
      contentItems: number
      images: number
      tokens: number
    }
  }
}
export type DataReleaseModel = {
  taskName: string
  modelId: string
  huggingFaceLink: string
}

export interface DataReleaseExtended extends DataRelease {
  impressoEnrichments?: {
    lingproc?: { models: DataReleaseModel[] }
    langident?: { models: DataReleaseModel[] }
    textreuse?: { models: DataReleaseModel[] }
    entities?: { models: DataReleaseModel[] }
    newsagencies?: { models: DataReleaseModel[] }
    topics?: { models: DataReleaseModel[] }
    ocrqa?: { models: DataReleaseModel[] }
    embImages?: { models: DataReleaseModel[] }
    embDocs?: { models: DataReleaseModel[] }
  }
}
