<template>
  <div class="ContentItemAccess d-flex align-items-center gap-3">
    <ContentItemAccessDimensions
      :explore-granted="hasExploreAccess"
      :transcript-granted="hasTranscriptAccess"
      :facsimile-granted="hasFacsimileAccess"
    />
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
import { useFeaturesStore } from '@/stores/features'
import { useUserStore } from '@/stores/user'
import { computed } from 'vue'
import ContentItemAccessButton from './ContentItemAccessButton.vue'
import ContentItemAccessDimensions from './ContentItemAccessDimensions.vue'
import { MaxPlanBitPosition } from '@/constants'
import {
  useContentItemAccess,
  type ContentItemAccessSource
} from '@/composables/useContentItemAccess'

const FullAccessLevel = 3

export interface ContentItemAccessProps {
  item: ContentItemAccessSource
}

const props = defineProps<ContentItemAccessProps>()
const userStore = useUserStore()
const featuresStore = useFeaturesStore()
const {
  accessLevel,
  contentItemBitmapsAsBigInts,
  hasExploreAccess,
  hasTranscriptAccess,
  hasFacsimileAccess
} = useContentItemAccess(() => props.item)

const isLoggedIn = computed(() => !!userStore.userData)
const isSpecialMembershipsEnabled = computed(() => {
  if (!isLoggedIn.value) {
    return false
  }
  return featuresStore.isSpecialMembershipsEnabled
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
    "other_description": "With your current user plan, you have partial access to this content item. In the Impresso Web App you can view the transcript and all metadata. You can access associated metadata, transcripts and facsimile images via API and csv export but are not permitted to download the transcript."

  }
}
</i18n>
