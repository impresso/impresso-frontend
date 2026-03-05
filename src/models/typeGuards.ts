import { SearchFacetBucket, SearchFacetRangeBucket } from './generated/deprecated/models'
import { Bucket } from '.'

export const isTermBucket = (bucket: any): bucket is SearchFacetBucket => {
  return bucket && typeof bucket.value === 'string' && typeof bucket.count === 'number'
}

export const isRangeBucket = (bucket: any): bucket is SearchFacetRangeBucket => {
  return bucket && typeof bucket.value === 'number' && typeof bucket.count === 'number'
}

export const isTermOrRangeBucket = (
  bucket: any
): bucket is SearchFacetBucket | SearchFacetRangeBucket => {
  return isTermBucket(bucket) || isRangeBucket(bucket)
}

export const isBucket = (bucket: any): bucket is Bucket => {
  return isTermOrRangeBucket(bucket)
}
