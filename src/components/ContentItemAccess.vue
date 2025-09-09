<template>
  <button>
    {{ userStore.userPlan }}
  </button>
  {{ contentItemBitmapBinaryString }}
  <div v-if="hasAccess">
    <slot name="access-granted" />
  </div>
  <div v-else class="alert alert-warning">
    <slot name="access-denied">
      {{ $t('no_access') }}
    </slot>
  </div>
</template>

<script setup lang="ts">
import type { ContentItem } from '@/models/generated/schemas/contentItem.d.ts'
import { useUserStore } from '@/stores/user'
import { computed } from 'vue'

export interface ContentItemAccessProps {
  item: ContentItem
}

const props = defineProps<ContentItemAccessProps>()

const userStore = useUserStore()

/**
 * Decodes a Base64 string representing a 64-bit integer into both a BigInt
 * and its 64-bit binary string representation.
 * @param base64Str The Base64 encoded string.
 * @param littleEndian True for little-endian byte order, false for big-endian.
 * @returns An object containing the decoded BigInt and its binary string.
 */
function base64ToBigIntAndBinary(
  base64Str: string,
  littleEndian: boolean = false
): { bigIntValue: BigInt; binaryString: string } {
  // Decode the Base64 string to a binary string
  const binaryStr: string = atob(base64Str)

  // Create a Uint8Array from the binary string's character codes
  const bytes = new Uint8Array(binaryStr.length)
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i)
  }

  // Create a DataView to interpret the bytes as a number
  const dataView = new DataView(bytes.buffer)

  // Read the 64-bit signed integer using getBigInt64
  const bigIntValue: BigInt = dataView.getBigInt64(0, littleEndian)

  // Convert the byte array to a 64-bit binary string
  let binaryString = ''
  // The order of bytes for the binary string must match the endianness
  if (littleEndian) {
    for (let i = bytes.length - 1; i >= 0; i--) {
      binaryString += bytes[i].toString(2).padStart(8, '0')
    }
  } else {
    for (let i = 0; i < bytes.length; i++) {
      binaryString += bytes[i].toString(2).padStart(8, '0')
    }
  }

  return { bigIntValue, binaryString }
}

const contentItemBitmapBinaryString = computed(() => {
  if (props.item.access && props.item.access.explore) {
    const { binaryString } = base64ToBigIntAndBinary(props.item.access.explore as string, true)
    return binaryString
  }
  return '0000000000000000' // Default to no access
})

const hasAccess = computed(() => {
  if (!userStore.bitmap || !props.item.access || !props.item.access.explore) {
    return false
  }
  try {
    // Convert base64 strings to BigInt for bitwise operations
    const { bigIntValue: contentBitmap, binaryString: contentBinary } = base64ToBigIntAndBinary(
      props.item.access.explore as string,
      true
    )
    const { bigIntValue: userBitmap, binaryString: userBinary } = base64ToBigIntAndBinary(
      userStore.bitmap as string,
      true
    )

    console.log('Content Bitmap:', contentBitmap)
    console.log('User Bitmap:', userBitmap)
    console.log('Content Binary:', contentBinary)
    console.log('User Binary:', userBinary)

    // Check access: (userBitmap & contentBitmap) != 0n
    const accessAllowed = BigInt(userBitmap & contentBitmap) !== BigInt(0)
    return accessAllowed
  } catch (error) {
    console.error('Error checking access:', error)
    return false
  }
})
</script>
