<template>
  <div v-if="shouldBeRedacted">
    <slot name="redacted"> </slot>
    <div>{{ $t(redactedTranslationKey) }}</div>
    <slot name="actions"> </slot>
  </div>
  <div v-if="debug">
    <pre>{{ debugInfo }}</pre>
  </div>
</template>

<script setup lang="ts">
import { PlanGuest, PlanNone, PlanResearcherPlus, PlansAsBigInt } from '@/constants'
import type { ContentItem } from '@/models/generated/schemas/contentItem.d.ts'
import { base64BytesToBigInt, bigIntToBitString } from '@/util/bigint'
import { computed } from 'vue'

function last5Bits(bitString: string) {
  console.debug('bitString', bitString)
  console.debug('last5Bits', bitString.slice(-5).padStart(5, '0'))
  return bitString.slice(-6).padStart(6, '0')
}

const RedactorContexts = ['explore', 'audio', 'image', 'transcript', 'publicApi'] as const

export interface ContentItemRedactorProps {
  item: ContentItem
  userBitmap: string
  context: (typeof RedactorContexts)[number]
  debug?: boolean
}

const RedactorContextsToAccessLevels: Record<(typeof RedactorContexts)[number], string> = {
  audio: 'getImages',
  image: 'getImages',
  transcript: 'transcript',
  explore: 'explore',
  publicApi: 'transcript'
}

const props = defineProps<ContentItemRedactorProps>()

const shouldBeRedacted = computed(() => {
  return (contentItemAccessAsBigInt.value & userBitmapAsBigInt.value) === 0n
})

const contentItemAccessAsBigInt = computed(() => {
  const accessLevel = RedactorContextsToAccessLevels[props.context]
  if (typeof props.item.access?.accessBitmaps?.[accessLevel] !== 'string') {
    return 0n
  }
  return base64BytesToBigInt(props.item.access.accessBitmaps[accessLevel])
})

const contentItemAccessAsBitString = computed(() => {
  return bigIntToBitString(contentItemAccessAsBigInt.value)
})

const userBitmapAsBigInt = computed(() => {
  return base64BytesToBigInt(props.userBitmap)
})

const userBitmapAsBitString = computed(() => {
  return bigIntToBitString(userBitmapAsBigInt.value)
})

const userPlanFromBitString = computed(() => {
  const planAsBitString = last5Bits(userBitmapAsBitString.value)
  const planBitsToBigInt = BigInt('0b' + planAsBitString)

  for (const [key, value] of Object.entries(PlansAsBigInt)) {
    if (value === planBitsToBigInt) {
      return key
    }
  }
  return PlanNone
})

const contentItemAccessPlanFromBitString = computed(() => {
  const planAsBitString = last5Bits(contentItemAccessAsBitString.value)
  const planBitsToBigInt = BigInt('0b' + planAsBitString)
  for (const [key, value] of Object.entries(PlansAsBigInt)) {
    if ((value & planBitsToBigInt) !== 0n) {
      return key
    }
  }
  return PlanResearcherPlus
})

// special membership as integer specify the position index of the first 1 bit from right side
const contentItemAccessSpecialMembership = computed<number>(() => {
  const bitString = contentItemAccessAsBitString.value
  const firstSpecialMembership = 64 - bitString.indexOf('1')
  return firstSpecialMembership
})

// based on the bigInt, check if there is a specific plan needed or a special membership.
const redactedTranslationKey = computed(() => {
  if (!shouldBeRedacted.value) {
    return ''
  }

  let key = 'label_' + props.context + '_requires_'

  if (contentItemAccessSpecialMembership.value > 5) {
    key += 'special_membership'
  } else if (contentItemAccessPlanFromBitString.value !== PlanNone) {
    key += contentItemAccessPlanFromBitString.value
  } else {
    key += 'no_access'
  }
  if (userPlanFromBitString.value === PlanGuest || userPlanFromBitString.value === PlanNone) {
    key += '_please_login'
  }
  return key
})

const debugInfo = computed(() => {
  return {
    shouldBeRedacted: shouldBeRedacted.value,
    userBitmapAsBitString: userBitmapAsBitString.value,
    userPlanFromBitString: userPlanFromBitString.value,
    contentItemAccessAsBitString: contentItemAccessAsBitString.value,
    contentItemAccessPlanFromBitString: contentItemAccessPlanFromBitString.value,
    contentItemAccessSpecialMembership: contentItemAccessSpecialMembership.value,
    redactedTranslationKey: redactedTranslationKey.value
  }
})
</script>
<i18n lang="json">
{
  "en": {
    "label_explore_requires_plan-basic": "You need at least a Basic plan to access this content.",
    "label_explore_requires_plan-educational": "You need at least a Student plan to access this content.",
    "label_explore_requires_plan-researcher": "You need at least an Academic plan to access this content.",
    "label_explore_requires_special_membership": "You need a Special Membership to access this content.",
    "label_explore_requires_plan-no_access": "This content is not accessible. Please contact support for more information.",
    "label_explore_requires_plan-basic_please_login": "Please log in or sign up for a Basic plan to access this content.",
    "label_explore_requires_plan-educational_please_login": "Please log in or sign up for a Student plan to access this content.",
    "label_explore_requires_plan-researcher_please_login": "Please log in or sign up for a Academic plan to access this content.",
    "label_explore_requires_special_membership_please_login": "Please log in or sign up for a Special Membership to access this content.",
    "label_publicApi_requires_plan-basic": "You need at least a Basic plan to access this content in the Public API.",
    "label_publicApi_requires_plan-educational": "You need at least a Student plan to access this content in the Public API.",
    "label_publicApi_requires_plan-researcher": "You need at least an Academic plan to access this content in the Public API.",
    "label_publicApi_requires_special_membership": "You need a Special Membership to access this content."
  }
}
</i18n>
