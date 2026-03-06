import { SearchFacetBucket, SearchFacetRangeBucket } from './generated/deprecated/models'
import type { Bucket, Entity } from '.'

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

export const isBucket = (bucket: any): bucket is Bucket<any> => {
  return isTermOrRangeBucket(bucket)
}

/**
 * Below is a compatibility layer for the old FilterWithItems type, which is still used in some places.
 * It should eventually be removed in favor of using Entities directly.
 */

export type EntityWithName = Entity & { name: string }
export const isEntityWithName = (item: Entity | undefined): item is EntityWithName => {
  return typeof (item as EntityWithName | undefined)?.name === 'string'
}

export type EntityWithLanguageAndExcerpt = Entity & { language?: string; htmlExcerpt?: string }
export const isEntityWithLanguageAndExcerpt = (
  item: Entity | undefined
): item is EntityWithLanguageAndExcerpt => {
  if (!item) return false
  const maybeTopic = item as EntityWithLanguageAndExcerpt
  return typeof maybeTopic.language === 'string' || typeof maybeTopic.htmlExcerpt === 'string'
}

export type EntityWithYearValue = Entity & { y: string }
export const isEntityWithYearValue = (item: Entity | undefined): item is EntityWithYearValue => {
  return typeof (item as EntityWithYearValue | undefined)?.y === 'string'
}

export type EntityWithDateRange = Entity & {
  start?: string | number | Date
  end?: string | number | Date
}
export const isEntityWithDateRange = (item: Entity | undefined): item is EntityWithDateRange => {
  if (!item) return false
  const maybeRange = item as EntityWithDateRange
  return maybeRange.start != null || maybeRange.end != null
}
