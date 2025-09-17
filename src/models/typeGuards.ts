import { SearchFacetBucket, SearchFacetRangeBucket } from './generated/schemas'
import { Bucket } from '.'

export const isTermBucket = (bucket: any): bucket is SearchFacetBucket => {
  return bucket && typeof bucket.val === 'string' && typeof bucket.count === 'number'
}

export const isRangeBucket = (bucket: any): bucket is SearchFacetRangeBucket => {
  return bucket && typeof bucket.val === 'number' && typeof bucket.count === 'number'
}

export const isTermOrRangeBucket = (
  bucket: any
): bucket is SearchFacetBucket | SearchFacetRangeBucket => {
  return isTermBucket(bucket) || isRangeBucket(bucket)
}

export const isBucket = (bucket: any): bucket is Bucket => {
  return isTermOrRangeBucket(bucket)
}
