import type { ServiceMethods } from '@feathersjs/feathers'

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

type UntypedService = Partial<ServiceMethods<any, any>>

interface UntypedServices {
  [key: string]: UntypedService
}

export interface Services extends UntypedServices {
  ['errors-collector']: ErrorsCollectorService
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
