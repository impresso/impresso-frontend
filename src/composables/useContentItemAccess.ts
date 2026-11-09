import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { ContentItemAccessBitmaps } from '@/models/generated/canonical/contentItem'
import { useUserStore } from '@/stores/user'
import { base64BytesToBigInt } from '@/util/bigint'

export interface ContentItemAccessSource {
  access?: {
    accessBitmaps?: ContentItemAccessBitmaps
  }
}

export type ContentItemAccessType =
  | 'none'
  | 'explore'
  | 'transcript'
  | 'facsimile'
  | 'explore-transcript'
  | 'explore-facsimile'
  | 'transcript-facsimile'
  | 'full'

export function useContentItemAccess(item: MaybeRefOrGetter<ContentItemAccessSource>) {
  const userStore = useUserStore()

  const userBitmapAsBigInt = computed(() => {
    if (!userStore.userData) {
      return 1n
    }
    return base64BytesToBigInt(userStore.bitmap)
  })

  const contentItemBitmapsAsBigInts = computed(() => {
    const accessBitmaps = toValue(item).access?.accessBitmaps
    if (!accessBitmaps) {
      return {
        explore: 0n,
        transcript: 0n,
        facsimile: 0n
      }
    }

    try {
      const { explore, getTranscript, getImages } = accessBitmaps
      return {
        explore: explore ? base64BytesToBigInt(explore) : 0n,
        transcript: getTranscript ? base64BytesToBigInt(getTranscript) : 0n,
        facsimile: getImages ? base64BytesToBigInt(getImages) : 0n
      }
    } catch (error) {
      console.error('Error converting content item access bitmaps:', accessBitmaps, error)
      return {
        explore: 0n,
        transcript: 0n,
        facsimile: 0n
      }
    }
  })

  const hasExploreAccess = computed(
    () => (userBitmapAsBigInt.value & contentItemBitmapsAsBigInts.value.explore) !== 0n
  )
  const hasTranscriptAccess = computed(
    () => (userBitmapAsBigInt.value & contentItemBitmapsAsBigInts.value.transcript) !== 0n
  )
  const hasFacsimileAccess = computed(
    () => (userBitmapAsBigInt.value & contentItemBitmapsAsBigInts.value.facsimile) !== 0n
  )

  const accessLevel = computed(
    () => +hasExploreAccess.value + +hasTranscriptAccess.value + +hasFacsimileAccess.value
  )

  const accessType = computed<ContentItemAccessType>(() => {
    if (accessLevel.value === 3) return 'full'
    if (hasExploreAccess.value && hasTranscriptAccess.value) return 'explore-transcript'
    if (hasExploreAccess.value && hasFacsimileAccess.value) return 'explore-facsimile'
    if (hasTranscriptAccess.value && hasFacsimileAccess.value) return 'transcript-facsimile'
    if (hasExploreAccess.value) return 'explore'
    if (hasTranscriptAccess.value) return 'transcript'
    if (hasFacsimileAccess.value) return 'facsimile'
    return 'none'
  })

  return {
    accessLevel,
    accessType,
    contentItemBitmapsAsBigInts,
    hasExploreAccess,
    hasTranscriptAccess,
    hasFacsimileAccess
  }
}
