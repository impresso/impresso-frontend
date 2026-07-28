<template>
  <div class="ContentItemAccess d-flex align-items-center gap-3">
    <div class="d-flex align-items-center gap-2 flex-wrap">
      <ContentItemAccessBadge
        v-for="dimension in accessDimensions"
        :key="dimension.key"
        :label="dimension.label"
        :description="dimension.description"
        :granted="dimension.granted"
      />
    </div>
    <template v-if="isSpecialMembershipsEnabled && contentItemRequiresSpecialMembershipAccess">
      <ContentItemAccessButton
        :currentAccessLevel="accessLevel"
        :specialMembershipAccessBitPositions="
          normalizedContentItemSpecialMembershipBitmapBitsPositions
        "
      />
    </template>
  </div>
</template>
<script setup lang="ts">
import type { ContentItem } from '@/models/generated/canonical/contentItem'
import { useUserStore } from '@/stores/user'
import { base64BytesToBigInt } from '@/util/bigint'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ContentItemAccessButton from './ContentItemAccessButton.vue'
import ContentItemAccessBadge from './ContentItemAccessBadge.vue'
import { MaxPlanBitPosition } from '@/constants'
import { Features } from '@/init'

const FullAccessLevel = 3

export interface ContentItemAccessProps {
  item: ContentItem
}

const props = defineProps<ContentItemAccessProps>()
const userStore = useUserStore()
const { t } = useI18n()

const isLoggedIn = computed(() => !!userStore.userData)
const isSpecialMembershipsEnabled = computed(() => {
  if (!isLoggedIn.value) {
    return false
  }
  return (window as any as { impressoFeatures: Features }).impressoFeatures?.specialMemberships
    ?.enabled
})
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

/**
 * Computed property that extracts the positions of bits set to 1 in
 * the content item's access bitmaps (explore, transcript, facsimile).
 */
const contentItemBitmapBitsPositions = computed<number[]>(() => {
  const positions: number[] = []
  let position = 0n
  const combinedBitmap =
    contentItemBitmapsAsBigInts.value.explore |
    contentItemBitmapsAsBigInts.value.transcript |
    (contentItemBitmapsAsBigInts.value.facsimile ?? 0n)
  while (combinedBitmap >> position) {
    if ((combinedBitmap >> position) & 1n) {
      positions.push(Number(position))
    }
    position++
  }
  return positions
})
const normalizedContentItemSpecialMembershipBitmapBitsPositions = computed(() => {
  return contentItemBitmapBitsPositions.value.filter(pos => pos > MaxPlanBitPosition)
})

/**
 * Returns true if the given bitmap has any bit set above MaxPlanBitPosition,
 * i.e. it encodes a special-membership requirement rather than just a plan-level one.
 */
const exceedsMaxPlanBitPosition = (bitmap: bigint): boolean => {
  return bitmap >> BigInt(MaxPlanBitPosition + 1) > 0n
}

/**
 * Computed property that checks if the **contentItem** demands **special membership access**.
 * It doesn't check if the user has the required access.
 */
const contentItemRequiresSpecialMembershipAccess = computed<boolean>(() => {
  return (
    exceedsMaxPlanBitPosition(contentItemBitmapsAsBigInts.value.explore) ||
    exceedsMaxPlanBitPosition(contentItemBitmapsAsBigInts.value.transcript) ||
    exceedsMaxPlanBitPosition(contentItemBitmapsAsBigInts.value.facsimile ?? 0n)
  )
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

/**
 * Computed property that determines the user's access level to the content item
 * based on the presence of explore, transcript, and facsimile access.
 * Still used to drive ContentItemAccessButton in the special-membership branch.
 */
const accessLevel = computed<number>(() => {
  return +hasExploreAccess.value + +hasTranscriptAccess.value + +hasFacsimileAccess.value
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

/**
 * Per-dimension breakdown used to render the 3 access badges
 * (Web App / Transcript / Facsimile) in the non-special-membership case.
 */
const accessDimensions = computed(() => {
  const guestSuffix = isLoggedIn.value ? '' : '_guest'

  const buildDescriptionKey = (dimensionKey: string, granted: boolean) =>
    `badge_${dimensionKey}_${granted ? 'granted' : 'denied'}${guestSuffix}_description`

  return [
    {
      key: 'explore',
      label: t('badge_explore_label'),
      granted: hasExploreAccess.value,
      description: t(buildDescriptionKey('explore', hasExploreAccess.value))
    },
    {
      key: 'transcript',
      label: t('badge_transcript_label'),
      granted: hasTranscriptAccess.value,
      description: t(buildDescriptionKey('transcript', hasTranscriptAccess.value))
    },
    {
      key: 'facsimile',
      label: t('badge_facsimile_label'),
      granted: hasFacsimileAccess.value,
      description: t(buildDescriptionKey('facsimile', hasFacsimileAccess.value))
    }
  ]
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

    "explore": "Web App access only",
    "explore_description": "Your current user plan allows you to view the complete content item (metadata, digital surrogate, semantic enrichments, and transcript) in the Web App. However, via CSV export and the Datalab (Impresso Python library), you can access only its metadata and semantic enrichments.",
    "explore_guest": "Web App access only",
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
    "other_description": "With your current user plan, you have partial access to this content item. In the Impresso Web App you can view the transcript and all metadata. You can access associated metadata, transcripts and facsimile images via API and csv export but are not permitted to download the transcript.",

    "badge_explore_label": "Web App",
    "badge_explore_granted_description": "You can view this item's digital surrogate, metadata, and semantic enrichments in the Web App.",
    "badge_explore_denied_description": "Your current user plan does not include Web App access to this item's digital surrogate.",
    "badge_explore_granted_guest_description": "You can view this item's digital surrogate in the Web App (Public Domain content).",
    "badge_explore_denied_guest_description": "Log in or create an account to check whether you can view this item's digital surrogate in the Web App.",

    "badge_transcript_label": "Transcript",
    "badge_transcript_granted_description": "You can access and export this item's transcript via CSV export and the Datalab (Impresso Python library).",
    "badge_transcript_denied_description": "Your current user plan does not include transcript access via CSV export or the Datalab.",
    "badge_transcript_granted_guest_description": "You can view this item's transcript in the Web App. Log in to also access it via the Datalab.",
    "badge_transcript_denied_guest_description": "Log in or create an account to check whether you can access this item's transcript.",

    "badge_facsimile_label": "Facsimile",
    "badge_facsimile_granted_description": "You can access and export this item's facsimile images via CSV export and the Datalab (Impresso Python library).",
    "badge_facsimile_denied_description": "Your current user plan does not include facsimile image access via CSV export or the Datalab.",
    "badge_facsimile_granted_guest_description": "You can view this item's facsimile images in the Web App. Log in to also access them via the Datalab.",
    "badge_facsimile_denied_guest_description": "Log in or create an account to check whether you can access this item's facsimile images."
  }
}
</i18n>
