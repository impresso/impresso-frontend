<template>
  <div class="ContentItemAccess d-inline-flex align-items-center">
    <div class="d-inline-flex align-items-center">
      <div class="very-small-caps m-1">{{ $t(accessTranslationKey) }}</div>
      <InfoButton
        style="margin-top: -2px"
        :default-content="$t(accessDescriptionTranslationKey)"
        :name="$t(accessTranslationKey)"
      ></InfoButton>
    </div>
  </div>
</template>

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
    return 1n // Default to basic access
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

const accessTranslationKey = computed(() => {
  let key = 'no_access'
  if (accessLevel.value === FullAccessLevel) {
    key = 'full_access'
  }
  if (accessLevel.value === 0) {
    key = 'no_access'
  }
  if (hasExploreAccess.value && !hasFacsimileAccess.value && !hasTranscriptAccess.value) {
    key = 'explore'
  } else if (hasExploreAccess.value && !hasFacsimileAccess.value && hasTranscriptAccess.value) {
    key = 'explore_transcript'
  } else if (hasExploreAccess.value && hasFacsimileAccess.value && !hasTranscriptAccess.value) {
    key = 'explore_facsimile'
  }
  if (!userStore.userData) {
    key += '_guest'
  }
  return key
})

const accessDescriptionTranslationKey = computed(() => {
  return accessTranslationKey.value + '_description'
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
<i18n lang="json">
{
  "en": {
    "full_access": "Web App & Datalab access",
    "full_access_description": "Your current user plan provides access to all elements of this content item - metadata, digital surrogate, semantic enrichments, and transcript - in the Web App. In the Datalab, you can access and export all elements except the digital surrogate.",
    "full_access_guest": "Web App access (Public Domain)",
    "full_access_guest_description": "You can view the complete content item (metadata, digital surrogate, semantic enrichments, and transcript) in the Web App. If you want to access this content in Datalab, please log in or create an account.",

    "no_access": "Annotation & semantic enrichment access",
    "no_access_description": "Your current user plan allows you to view only the metadata and semantic enrichments of this content item. You can also access and export them via the Web App (CSV export) and the Datalab (Impresso Python library).",
    "no_access_guest": "Annotation & semantic enrichment access",
    "no_access_guest_description": "You can view only the metadata and semantic enrichments of this content item. If you want to access this content in Datalab, please log in or create an account.",

    "explore": "Web App access",
    "explore_description": "Your current user plan allows you to view the complete content item (metadata, digital surrogate, semantic enrichments, and transcript) in the Web App. However, via CSV export and the Datalab (Impresso Python library), you can access only its metadata and semantic enrichments.",
    "explore_guest": "Web App access",
    "explore_guest_description": "You can view the complete content item (metadata, digital surrogate, semantic enrichments, and transcript) in the Web App. If you want to access this content in Datalab, please log in or create an account.",

    "explore_transcript": "Web App & transcript access",
    "explore_transcript_description": "Your current user plan allows you to view the complete content item (metadata, digital surrogate, semantic enrichments, and transcript) in the Web App. Additionally, you can access and export its metadata and transcript via CSV export and the Datalab (Impresso Python library). However, access to the digital surrogate is not included.",
    "explore_transcript_guest": "Web App & transcript access",
    "explore_transcript_guest_description": "You can view the complete content item (metadata, digital surrogate, semantic enrichments, and transcript) in the Web App. If you want to access this content in Datalab, please log in or create an account.",

    "explore_facsimile": "Web App & facsimile access",
    "explore_facsimile_description": "Your current user plan allows you to view the complete content item (metadata, digital surrogate, semantic enrichments, and transcript) in the Web App. Additionally, you can access and export its metadata and facsimile images via CSV export and the Datalab (Impresso Python library).",
    "explore_facsimile_guest": "Web App access",
    "explore_facsimile_guest_description": "You can view the complete content item (metadata, digital surrogate, semantic enrichments, and transcript) in the Web App. If you want to access this content in Datalab, please log in or create an account.",
    "other": "Limited Access",
    "other_description": "With your current user plan, you have partial access to this content item. In the Impresso Web App you can view the transcript and all metadata. You can access associated metadata, transcripts and facsimile images via API and csv export but are not permitted to download the transcript."
  }
}
</i18n>
