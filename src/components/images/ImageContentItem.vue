<template>
  <div class="ImageContentItem" v-bind="attrs">
    <div v-if="shouldShowPreview" class="mb-2">
      <AuthImg
        :src="image.previewUrl"
        class="ImageContentItem__preview d-block rounded-sm border"
        :style="{
          aspectRatio: previewAspectRatio,
          width: '100%',
          maxHeight: '300px',
          objectFit: 'cover'
        }"
      />
    </div>
    <div class="d-flex align-items-start gap-2">
      <Icon v-if="showIcon" name="mediaImage" />
      <h2
        v-if="showTitle || contentItem?.text?.title"
        class="m-0 font-size-inherit font-weight-bold line-height-inherit"
      >
        <RouterLink v-if="showLink" :to="routerLinkUrl">{{ image.caption || image.id }}</RouterLink>
        <span v-else>{{ image.caption || image.id }}</span>
        <span v-if="contentItem?.text?.title" class="font-weight-normal">
          &mdash; {{ contentItem.text.title }}
        </span>
      </h2>
    </div>

    <div
      v-if="shouldShowMediaSource || shouldShowDate || shouldShowPages || showId"
      class="d-flex align-items-center gap-2 flex-wrap"
    >
      <MediaSourceLabel
        v-if="shouldShowMediaSource"
        :item="{
          id: image.mediaSourceRef?.id,
          name: image.mediaSourceRef?.name,
          type: image.mediaSourceRef?.type
        }"
        show-link
        class="d-inline-block"
      >
        {{ ' ' }}
        <span v-if="shouldShowDate">
          {{ shouldShowMediaSource ? '&mdash;' : '' }}
          {{ $d(new Date(image.date as Date), 'long') }}
          {{ '  ' }}
        </span>
        <span v-if="shouldShowPages">
          {{ shouldShowMediaSource || shouldShowDate ? '&mdash;' : '' }}
          <span v-html="pagesLabel"></span>
        </span>
      </MediaSourceLabel>
      {{ '  ' }}

      <ContentItemIdLabel v-if="showId" :id="image.id" />
    </div>

    <div class="d-flex align-items-center gap-2 flex-wrap">
      <template v-if="shouldShowImageTypes">
        <div
          v-for="(imageType, index) in image.imageTypes"
          :key="index"
          class="small-caps"
          style="margin-top: 2px"
        >
          {{ imageType }}
        </div>
      </template>
      {{ '  ' }}
      <!-- copyright and provider -->
      <template v-if="image.access.copyright">
        <span>
          &mdash;
          <span>{{ $t(`buckets.copyright.${image.access.copyright}`) }}</span>
        </span>
      </template>
      <ContentItemAccess
        v-if="props.showContentItemAccess"
        :item="props.image as unknown as ContentItem"
      >
      </ContentItemAccess>
    </div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { useI18n } from 'vue-i18n'
import { IImage } from '@/models'
import type { ContentItem } from '@/models/generated/canonical/contentItem'
import Icon from '@/components/base/Icon.vue'
import MediaSourceLabel from '@/components/modules/lists/MediaSourceLabel.vue'
import ContentItemIdLabel from '@/components/ContentItemIdLabel.vue'
import ContentItemAccess from '../ContentItemAccess.vue'
import { Routes } from '@/router/routes'
import { RouteLocationRaw } from 'vue-router'
import AuthImg from '@/components/AuthImg.vue'
import Image from '@/models/Image.js'

defineOptions({ inheritAttrs: false })

export interface ImageContentItemProps {
  image: IImage
  contentItem?: ContentItem | null
  showIcon?: boolean
  showTitle?: boolean
  showMediaSource?: boolean
  showDate?: boolean
  showPages?: boolean
  showContentItemAccess?: boolean
  showImageTypes?: boolean
  showId?: boolean
  showLink?: boolean
  showPreview?: boolean
}

const props = withDefaults(defineProps<ImageContentItemProps>(), {
  showIcon: true,
  showTitle: true,
  showMediaSource: true,
  showDate: true,
  showPages: true,
  showId: false,
  showContentItemAccess: false,
  showImageTypes: false,
  showLink: false,
  showPreview: false
})

const attrs = useAttrs()
const { t } = useI18n()

const hasCaption = computed(() => (props.image.caption?.length ?? 0) > 0)

const routerLinkUrl = computed(
  () =>
    ({
      name: Routes.viewImage.children.facsimile.name,
      params: { image_id: props.image.id }
    }) as RouteLocationRaw
)

const shouldShowMediaSource = computed(
  () => props.showMediaSource && !!props.image.mediaSourceRef?.id
)

const shouldShowDate = computed(() => props.showDate && !!props.image.date)

const shouldShowPages = computed(() => props.showPages && !!props.image.pageNumbers?.length)

const shouldShowImageTypes = computed(
  () => props.showImageTypes && !!Object.keys(props.image.imageTypes || {}).length
)

const shouldShowPreview = computed(() => props.showPreview && !!props.image.previewUrl)

// Fallback for when the previewUrl's IIIF region isn't pixel coords (e.g. "full" or "pct:...").
const DEFAULT_PREVIEW_ASPECT_RATIO = 3 / 4

/**
 * previewUrl is a IIIF Image API url (`.../{region}/{size}/{rotation}/{quality}.{format}`).
 * When the region is expressed in pixel coords (`x,y,w,h`), derive the crop's aspect ratio
 * so the thumbnail reserves the right amount of space before it loads.
 */
const previewAspectRatio = computed(() => {
  const url = props.image.previewUrl
  if (!url) return DEFAULT_PREVIEW_ASPECT_RATIO
  const region = url.match(/\/([^/]+)\/[^/]+\/[^/]+\/[^/]+$/)?.[1]
  const pixelMatch = region?.match(/^(\d+),(\d+),(\d+),(\d+)$/)
  if (!pixelMatch) return DEFAULT_PREVIEW_ASPECT_RATIO
  const [, , , w, h] = pixelMatch
  const width = Number(w)
  const height = Number(h)
  return width > 0 && height > 0 ? width / height : DEFAULT_PREVIEW_ASPECT_RATIO
})

const pagesLabel = computed(() =>
  t('pp', { pages: props.image.pageNumbers?.join(',') ?? '' }, props.image.pageNumbers?.length ?? 0)
)
</script>
