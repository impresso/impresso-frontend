<template>
  <div v-if="shouldBeRedacted">
    REDACTED
    <slot>Redacted.</slot>
    <div>{{ $t(redactedTranslationKey) }}</div>
  </div>
  {{ userBitmapAsBitString }}
  <br />plan:
  {{ userPlanFromBitString }}
  <br />
  {{ contentItemAccessAsBitString }}
  {{ contentItemAccessPlanFromBitString }}
  {{ contentItemAccessSpecialMembership }}
</template>

<script setup lang="ts">
import { PlanGuest, PlanNone, PlansAsBigInt } from '@/constants'
import type { ContentItem } from '@/models/generated/schemas/contentItem.d.ts'
import { base64BytesToBigInt, bigIntToBitString } from '@/util/bigint'
import { computed } from 'vue'

function last5Bits(bitString: string) {
  return bitString.slice(-5).padStart(5, '0')
}

const RedactorContexts = ['audio', 'image', 'transcript'] as const

export interface ContentItemRedactorProps {
  item: ContentItem
  userBitmap: string
  context: (typeof RedactorContexts)[number]
}

const RedactorContextsToAccessLevels: Record<(typeof RedactorContexts)[number], string> = {
  audio: 'getImages',
  image: 'getImages',
  transcript: 'transcript'
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
  const plan = Object.entries(PlansAsBigInt).reduce((acc, [key, value]) => {
    if (value === planBitsToBigInt) {
      return key
    }
    return acc
  }, PlanNone)
  return plan
})

const contentItemAccessPlanFromBitString = computed(() => {
  const planAsBitString = last5Bits(contentItemAccessAsBitString.value)
  const planBitsToBigInt = BigInt('0b' + planAsBitString)
  const plan = Object.entries(PlansAsBigInt).reduce((acc, [key, value]) => {
    if (value === planBitsToBigInt) {
      return key
    }
    return acc
  }, PlanNone)
  return plan
})

// special membership as integer specify the position index of the first 1 bit from right side
const contentItemAccessSpecialMembership = computed<number>(() => {
  const bitString = contentItemAccessAsBitString.value
  const firstSpecialMembership = bitString.indexOf('1')

  return firstSpecialMembership
})

// based on the bigInt, check if there is a specific plan needed or a special membership.
const redactedTranslationKey = computed(() => {
  if (!shouldBeRedacted.value) {
    return ''
  }

  let key = 'label_' + props.context + '_requires_'

  if (contentItemAccessSpecialMembership.value > 4) {
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
</script>
