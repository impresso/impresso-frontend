import { ClientService } from '@feathersjs/feathers'
import { BaseFind } from '../../models/generated/deprecated/internalApi'
import { MediaSource } from '../../models/generated/canonical'
import { ServiceFindParams } from '.'

interface FindResponse<T> extends Omit<BaseFind, 'data'> {
  data: T[]
}

export type MediaSourcesService = Pick<
  ClientService<MediaSource, unknown, unknown, FindResponse<MediaSource>, ServiceFindParams>,
  'find' | 'get'
>
