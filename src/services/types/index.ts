import type { ServiceMethods } from '@feathersjs/feathers'
import { ImageService } from './images'
import { EmbeddingsService } from './embeddings'
import { DatalabSupportService } from './datalabSupport'
import { BaristaService } from './barista'

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

interface UntypedServices {
  [key: string]: UntypedService
}

export interface Services extends UntypedServices {
  ['errors-collector']: ErrorsCollectorService
  ['datalab-support']: DatalabSupportService
  images: ImageService
  embeddings: EmbeddingsService
  ['barista-proxy']: BaristaService
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

export interface UserRequestChangelogEntry {
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

export interface SubscriptionDataset {
  id: number
  reviewerId?: number | null
  name: string
  bitmapPosition: number
  metadata?: object
}

export interface UserRequest {
  id: number
  reviewerId: number | null
  subscriberId: number
  subscription: SubscriptionDataset | null
  dateCreated: Date
  dateLastModified: Date
  status: 'pending' | 'approved' | 'rejected'
  changelog: UserRequestChangelogEntry[]
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
