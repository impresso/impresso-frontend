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

export type UserChangePlanRequest = {
  plan: string
  status: string
  dateLastModified: string
}
