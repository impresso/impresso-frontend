<template>
  <WithTooltip
    :is-html="true"
    :content="$t(ocrQualityInfo.text, { rating: $n(ocrQualityInfo.rating) })"
    :placement="placement"
    :shiftOptions="{ padding: -5 }"
    strategy="fixed"
  >
    <div class="ContentItemOcrQuality" :style="{ backgroundColor: ocrQualityInfo.color }"></div>
  </WithTooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ContentItem } from '@/models/generated/canonical/contentItem'
import WithTooltip from '@/components/base/WithTooltip.vue'
import type { TooltipPlacement } from '@/components/base/WithTooltip.vue'

export interface ContentItemOcrQualityProps {
  contentItem: ContentItem
  goodThreshold?: number // Point where color becomes fully green (default 0.8)
  mediumThreshold?: number // Midpoint color (default 0.4)
  placement?: TooltipPlacement
}

const props = withDefaults(defineProps<ContentItemOcrQualityProps>(), {
  goodThreshold: 0.8,
  mediumThreshold: 0.4,
  placement: 'top'
})

const ocrQualityText = {
  good: 'Good OCR quality',
  medium: 'Medium OCR quality',
  bad: 'Bad OCR quality',
  unknown: 'Unknown OCR quality'
}

// Helper function to interpolate hues linearly between two points
const interpolateHue = (
  val: number,
  minVal: number,
  maxVal: number,
  minHue: number,
  maxHue: number
): number => {
  const percentage = (val - minVal) / (maxVal - minVal)
  return minHue + percentage * (maxHue - minHue)
}

const ocrQualityInfo = computed(() => {
  const rating = props.contentItem.semanticEnrichments?.ocrQuality

  if (rating === undefined || rating === null) {
    return {
      rating: 0,
      key: 'unknown',
      color: 'hsl(0, 0%, 50%)', // Gray
      text: ocrQualityText.unknown
    }
  }

  // HSL Hues: 0 = Red, 35 = Orange, 120 = Green
  let hue = 0
  let key: 'good' | 'medium' | 'bad'

  if (rating >= props.goodThreshold) {
    key = 'good'
    hue = 120 // Pure green for anything at or above the good threshold
  } else if (rating >= props.mediumThreshold) {
    key = 'medium'
    // Smoothly transition from Orange (35) to Green (120)
    hue = interpolateHue(rating, props.mediumThreshold, props.goodThreshold, 35, 120)
  } else {
    key = 'bad'
    // Smoothly transition from Red (0) to Orange (35)
    hue = interpolateHue(rating, 0, props.mediumThreshold, 0, 35)
  }

  return {
    rating,
    key,
    color: `hsl(${hue}, 85%, 40%)`, // Using fixed saturation & lightness for accessible contrast
    text: ocrQualityText[key]
  }
})
</script>

<i18n lang="json">
{
  "en": {
    "Good OCR quality": "Good OCR quality: <br/>{rating}",
    "Medium OCR quality": "Medium OCR quality: <br/>{rating}",
    "Bad OCR quality": "Bad OCR quality: <br/>{rating}",
    "Unknown OCR quality": "Unknown OCR quality: <br/>{rating}"
  }
}
</i18n>
<style>
.ContentItemOcrQuality {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  position: relative;
}
.ContentItemOcrQuality > span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
