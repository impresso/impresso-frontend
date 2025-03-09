import { ClientService } from '@feathersjs/feathers'

export type SupportAspect = 'impresso-py-function'

interface ImpressoPyFunction {
  code: string
}

export interface GetQuery {
  filters?: string
  resource?: string
  functionName?: string
}

type Result = ImpressoPyFunction

export type DatalabSupportService = Pick<ClientService<Result, unknown, unknown, unknown>, 'get'>
