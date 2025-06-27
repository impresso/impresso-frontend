import { Bucket } from './index.d'

export const isBucket = (bucket: any): bucket is Bucket => {
  return (
    bucket && ['string', 'number'].includes(typeof bucket.val) && typeof bucket.count === 'number'
  )
}
