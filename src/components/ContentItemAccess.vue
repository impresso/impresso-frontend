<template>
  <div
    class="ContentItemAccess mb-2 d-inline-flex align-items-center px-1"
    :class="{
      'with-full-access border-success text-success': accessLevel === FullAccessLevel,
      'with-partial-access': accessLevel === PartialAccessLevel,
      'with-no-access border-danger': accessLevel === 0
    }"
  >
    <div v-if="accessLevel === FullAccessLevel" class="d-inline-flex align-items-center px-1">
      <slot name="access-granted">
        <span class="px-1 very-small-caps" style="padding-bottom: 1px">{{
          $t('full_access')
        }}</span>
      </slot>
      <InfoButton
        :default-content="$t('full_access_description')"
        :name="$t('full_access')"
        trigger-class="text-success"
      ></InfoButton>
    </div>
    <div
      v-else-if="accessLevel === PartialAccessLevel"
      class="d-inline-flex align-items-center gap-2"
    >
      <slot name="partial-access">
        <div>
          <div class="very-small-caps">{{ $t('partial_access') }}</div>
          <div class="very-small">
            {{ $t(partialAccessTranslationKey) }}
          </div>
        </div>
      </slot>
      <InfoButton
        :default-content="$t(partialAccessTranslationKey + '_description')"
        :name="$t(partialAccessTranslationKey)"
        class="pt-1"
      ></InfoButton>
    </div>
    <div v-else class="d-inline-flex align-items-center gap-2">
      <slot name="access-denied">
        <div class="very-small-caps text-danger">{{ $t('no_access') }}</div>
      </slot>
      <InfoButton
        :default-content="$t('no_access_description')"
        :name="$t('no_access')"
      ></InfoButton>
    </div>
  </div>
</template>
<i18n lang="json">
{
  "en": {
    "full_access": "Full Access",
    "partial_access": "Partial Access",
    "partial_access_explore_description": "You have partial access to this content item. You can freely read its content on the Impresso App, but you cannot download it. Please check your subscription or contact support for more information.",
    "no_access": "No Access"
  }
}
</i18n>
<script setup lang="ts">
import type { ContentItem } from '@/models/generated/schemas/contentItem.d.ts'
import { useUserStore } from '@/stores/user'
import { base64ToBigInt, bigIntToBinaryString } from '@/util/bitmask'
import { computed } from 'vue'
import Icon from './base/Icon.vue'
import InfoButton from './base/InfoButton.vue'

const PartialAccessLevel = 1
const FullAccessLevel = 2

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
    return BigInt(0n) // Default to no access
  }
  return base64ToBigInt(userStore.userData.bitmap)
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

const partialAccessTranslationKey = computed(() => {
  if (hasExploreAccess.value && !hasFacsimileAccess.value && !hasTranscriptAccess.value) {
    return 'partial_access_explore'
  } else if (hasExploreAccess.value && !hasFacsimileAccess.value && hasTranscriptAccess.value) {
    return 'partial_access_explore_transcript'
  } else if (hasExploreAccess.value && hasFacsimileAccess.value && !hasTranscriptAccess.value) {
    return 'partial_access_explore_facsimile'
  } else {
    return 'partial_access_other'
  }
})

const accessLevel = computed<number>(() => {
  return +hasExploreAccess.value + +hasTranscriptAccess.value
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
  if (!props.item.access) {
    return {
      explore: BigInt(0n),
      transcript: BigInt(0n),
      facsimile: BigInt(0n)
    }
  }
  try {
    return {
      explore: props.item.access.explore
        ? base64ToBigInt(props.item.access.explore as string)
        : BigInt(0n),
      transcript: props.item.access.transcript
        ? base64ToBigInt(props.item.access.transcript as string)
        : BigInt(0n),
      facsimile: props.item.access.facsimile
        ? base64ToBigInt(props.item.access.facsimile as string)
        : BigInt(0n) // Not used currently
    }
  } catch (e) {
    console.error(
      'Error converting content item access bitmaps: original data:',
      props.item.access,
      "\nLet's set them all to false.\n error:",
      e
    )
    return {
      explore: BigInt(0n),
      transcript: BigInt(0n)
    }
  }
})

// only for debugging purposes
// const contentItemBitmapExploreAsString = computed(() => {
//   return bigIntToBinaryString(contentItemBitmapsAsBigInts.value.explore)
// })
// const contentItemBitmapTranscriptAsString = computed(() => {
//   return bigIntToBinaryString(contentItemBitmapsAsBigInts.value.transcript)
// })
// const userBitmapAsString = computed(() => {
//   return bigIntToBinaryString(userBitmapAsBigInt.value)
// })
</script>
