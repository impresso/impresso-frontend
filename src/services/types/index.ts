import type { ServiceMethods } from '@feathersjs/feathers'
import { ImageService } from './images'
import { EmbeddingsService } from './embeddings'
import { DatalabSupportService } from './datalabSupport'
import { BaristaService } from './barista'
import { ContentItemsService } from './contentItems'
import { SearchFacetsService } from './searchFacets'
import { MentionsService } from './mentions'
import { ICollectableItemsService } from './collectableItems'

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

export interface SpecialMembershipAccess {
  id: number
  reviewerId?: number | null
  title: string
  bitmapPosition: number
  metadata?: {
    provider?: string
    note?: string
  }
}

export interface UserSpecialMembershipRequest {
  id: number
  reviewerId: number | null
  specialMembershipAccessId: number | null
  userId: number
  specialMembershipAccess?: SpecialMembershipAccess
  dateCreated: string
  dateLastModified: string
  status: 'pending' | 'approved' | 'rejected'
  changelog: UserSpecialMembershipRequestChangelogEntry[]
}

// new type from media endpoint

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
