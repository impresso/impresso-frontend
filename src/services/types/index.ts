import type { ServiceMethods } from '@feathersjs/feathers'
import { ImageService } from './images'
import { EmbeddingsService } from './embeddings'
import { DatalabSupportService } from './datalabSupport'

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
