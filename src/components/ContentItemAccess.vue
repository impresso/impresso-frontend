<template>
  <div
    class="ContentItemAccess d-inline-flex align-items-center"
    :class="{
      'border-success text-success': accessLevel === FullAccessLevel
    }"
  >
    <div v-if="accessLevel === FullAccessLevel" class="d-inline-flex align-items-center">
      <slot name="access-granted">
        <span class="px-1 very-small-caps">{{ $t('full_access') }}</span>
      </slot>
      <InfoButton
        :default-content="$t('full_access_description')"
        :name="$t('full_access')"
        trigger-class="text-success"
      ></InfoButton>
    </div>
    <div
      v-else-if="accessLevel < FullAccessLevel && accessLevel > 0"
      class="d-inline-flex align-items-center gap-2"
    >
      <slot name="limited-access">
        <div class="very-small-caps">{{ $t('limited_access') }}</div>
        <div class="very-small">
          {{ $t(limitedAccessTranslationKey) }}
        </div>
      </slot>
      <InfoButton
        :default-content="$t(limitedAccessTranslationKey + '_description')"
        :name="$t(limitedAccessTranslationKey)"
      ></InfoButton>
    </div>
    <div v-else class="d-inline-flex align-items-center gap-2">
      <slot name="access-denied">
        <div class="very-small-caps text-danger">{{ $t('no_access') }}</div>
      </slot>
      <InfoButton
        :default-content="$t('no_access_description') + JSON.stringify(contentItemBitmapsAsPlans)"
        :name="$t('no_access')"
      ></InfoButton>
    </div>
  </div>
</template>
<i18n lang="json">
{
  "en": {
    "full_access": "Full Access",
    "full_access_description": "With your current user plan, you have full access to this content item. You can view the transcript and all metadata in the Impresso Web App. You can access both metadata and transcripts via  Impresso Public API, CSV export and Impresso Python library.",
    "limited_access": "Limited Access",
    "limited_access_explore": "Explore only",
    "limited_access_explore_description": "With your current user plan, you have limited access to this content item. You can view the transcript and all metadata in the Impresso Web App. You can access metadata via Impresso Public API, CSV export and Impresso Python library, but cannot download the transcript.",
    "no_access": "Metadata only access",
    "no_access_description": "With your current user plan, you have metadata-only access to this content item. You can view and access metadata via the Impresso Web App, Impresso Public API, CSV export and Impresso Python library. You cannot view or download the transcript.",
    "limited_access_explore_transcript": "Explore and get transcript",
    "limited_access_explore_transcript_description": "With your current user plan, you have partial access to this content item. In the Impresso Web App you can view the transcript and all metadata. You can access associated metadata and transcripts via API, but are not permitted to download the transcript.",
    "limited_access_explore_facsimile": "Explore and view facsimile",
    "limited_access_explore_facsimile_description": "With your current user plan, you have partial access to this content item. In the Impresso Web App you can view the transcript and all metadata. You can access associated metadata and facsimile images via API and csv export but are not permitted to download the transcript.",
    "limited_access_other": "Limited Access",
    "limited_access_other_description": "With your current user plan, you have partial access to this content item. In the Impresso Web App you can view the transcript and all metadata. You can access associated metadata, transcripts and facsimile images via API and csv export but are not permitted to download the transcript."
  }
}
</i18n>
<script setup lang="ts">
import type { ContentItem } from '@/models/generated/schemas/contentItem.d.ts'
import { useUserStore } from '@/stores/user'
import { base64BytesToBigInt, bigIntToBitString } from '@/util/bigint'
import { computed } from 'vue'
import InfoButton from './base/InfoButton.vue'

const FullAccessLevel = 3

export interface ContentItemAccessProps {
  item: ContentItem
}

const props = defineProps<ContentItemAccessProps>()
const userStore = useUserStore()

/**
 * Computed property that converts the user's access bitmap from base64 to BigInt.
 *
 * @returns {ComputedRef<bigint>} The user's access bitmap as a BigInt value.
 * Returns 0n if user data is not available, indicating no access permissions.
 */
const userBitmapAsBigInt = computed(() => {
  if (!userStore.userData) {
    return 0n // Default to no access
  }
  return base64BytesToBigInt(userStore.bitmap)
})

const hasExploreAccess = computed(() => {
  return (userBitmapAsBigInt.value & contentItemBitmapsAsBigInts.value.explore) !== 0n
})

const hasTranscriptAccess = computed(() => {
  return (userBitmapAsBigInt.value & contentItemBitmapsAsBigInts.value.transcript) !== 0n
})

const hasFacsimileAccess = computed(() => {
  return (userBitmapAsBigInt.value & (contentItemBitmapsAsBigInts.value.facsimile ?? 0n)) !== 0n
})

const limitedAccessTranslationKey = computed(() => {
  if (hasExploreAccess.value && !hasFacsimileAccess.value && !hasTranscriptAccess.value) {
    return 'limited_access_explore'
  } else if (hasExploreAccess.value && !hasFacsimileAccess.value && hasTranscriptAccess.value) {
    return 'limited_access_explore_transcript'
  } else if (hasExploreAccess.value && hasFacsimileAccess.value && !hasTranscriptAccess.value) {
    return 'limited_access_explore_facsimile'
  } else {
    return 'limited_access_other'
  }
})

const accessLevel = computed<number>(() => {
  return +hasExploreAccess.value + +hasTranscriptAccess.value + +hasFacsimileAccess.value
})
/**
 * Computed property that converts content item access bitmaps from base64 to BigInt format.
 *
 * @returns {ComputedRef<{explore: bigint, transcript: bigint}>} Object containing:
 * - explore: BigInt representation of explore access bitmap, or 0n if not available
 * - transcript: BigInt representation of transcript access bitmap, or 0n if not available
 *
 * If the item has no access property, both values default to 0n indicating no access.
 */
const contentItemBitmapsAsBigInts = computed<{
  explore: bigint
  transcript: bigint
  facsimile?: bigint
}>(() => {
  if (!props.item.access || !props.item.access.accessBitmaps) {
    return {
      explore: 0n,
      transcript: 0n,
      facsimile: 0n
    }
  }

  try {
    const { explore, getTranscript, getImages } = props.item.access.accessBitmaps
    return {
      explore: explore ? base64BytesToBigInt(explore as string) : 0n,
      transcript: getTranscript ? base64BytesToBigInt(getTranscript as string) : 0n,
      facsimile: getImages ? base64BytesToBigInt(getImages as string) : 0n // Not used currently
    }
  } catch (e) {
    console.error(
      'Error converting content item access bitmaps: original data:',
      props.item.access,
      "\nLet's set them all to false.\n error:",
      e
    )
    return {
      explore: 0n,
      transcript: 0n,
      facsimile: 0n
    }
  }
})

const userBitmapAsPlan = computed(() => {
  // Helper to get last 5 bits as string, padded to 5 bits
  return bigIntToBitString(userBitmapAsBigInt.value)
})

const contentItemBitmapsAsPlans = computed(() => {
  // Helper to get last 5 bits as string, padded to 5 bits
  function last5Bits(bitString: string) {
    return bitString.slice(-5).padStart(5, '0')
  }
  return {
    explore: last5Bits(bigIntToBitString(contentItemBitmapsAsBigInts.value.explore)),
    transcript: last5Bits(bigIntToBitString(contentItemBitmapsAsBigInts.value.transcript)),
    facsimile: last5Bits(bigIntToBitString(contentItemBitmapsAsBigInts.value.facsimile ?? 0n))
  }
})
</script>
