import { ClientService } from '@feathersjs/feathers'
import { Filter, FindResponse, IImage as Image } from '../../models/index.d'

const OrderByParams = ['date', '-date']
type OrderByParam = keyof typeof OrderByParams
export const OrderByChoices: OrderByParam[] = Object.keys(OrderByParams) as OrderByParam[]

export interface FindQuery {
  similar_to_image_id?: string
  term?: string
  limit?: number
  offset?: number
  filters?: Filter[]
  order_by?: OrderByParam
}

export type ImageService = Pick<
  ClientService<Image, unknown, unknown, FindResponse<Image>>,
  'find' | 'get'
>
