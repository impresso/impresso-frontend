<template>
  <div class="ImageContentItem" v-bind="attrs">
    <div class="d-flex align-items-start gap-2">
      <Icon v-if="showIcon" name="journalPage" />
      <h2
        v-if="showTitle && hasCaption"
        class="m-0 font-size-inherit font-weight-bold line-height-inherit"
      >
        {{ image.caption }}
      </h2>
    </div>

    <div
      v-if="shouldShowMediaSource || shouldShowDate || shouldShowPages"
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
      />
      {{ ' ' }}
      <div v-if="shouldShowDate">
        {{ shouldShowMediaSource ? '&mdash;' : '' }}
        {{ $d(new Date(image.date as Date), 'long') }}
        {{ '  ' }}
      </div>
      <div v-if="shouldShowPages">
        {{ shouldShowMediaSource || shouldShowDate ? '&mdash;' : '' }}
        <span v-html="pagesLabel"></span>
      </div>

      <ContentItemIdLabel :id="image.id" />
    </div>
    <div class="mt-2 d-flex align-items-center gap-2 flex-wrap">
      <div v-if="shouldShowImageTypes" class="d-flex align-items-center gap-2 flex-wrap">
        <span v-for="(imageType, index) in image.imageTypes" :key="index" class="small-caps">
          {{ imageType }}
        </span>
      </div>
      <ContentItemAccess v-if="props.showContentItemAccess" :item="props.image as ContentItem">
      </ContentItemAccess>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { useI18n } from 'vue-i18n'
import { IImage } from '@/models'
import Icon from '@/components/base/Icon.vue'
import MediaSourceLabel from '@/components/modules/lists/MediaSourceLabel.vue'
import ContentItemIdLabel from '@/components/ContentItemIdLabel.vue'
import ContentItemAccess from '../ContentItemAccess.vue'
import { ContentItem } from '@/models/generated/canonical/contentItem.js'

defineOptions({ inheritAttrs: false })

export interface ImageContentItemProps {
  image: IImage
  showIcon?: boolean
  showTitle?: boolean
  showMediaSource?: boolean
  showDate?: boolean
  showPages?: boolean
  showContentItemAccess?: boolean
  showImageTypes?: boolean
  showId?: boolean
}

const props = withDefaults(defineProps<ImageContentItemProps>(), {
  showIcon: true,
  showTitle: true,
  showMediaSource: true,
  showDate: true,
  showPages: true,
  showId: false,
  showContentItemAccess: false,
  showImageTypes: false
})

const attrs = useAttrs()
const { t } = useI18n()

const hasCaption = computed(() => (props.image.caption?.length ?? 0) > 0)

const shouldShowMediaSource = computed(
  () => props.showMediaSource && !!props.image.mediaSourceRef?.id
)

const shouldShowDate = computed(() => props.showDate && !!props.image.date)

const shouldShowPages = computed(() => props.showPages && !!props.image.pageNumbers?.length)

const shouldShowImageTypes = computed(
  () => props.showImageTypes && !!props.image.imageTypes?.length
)

const pagesLabel = computed(() =>
  t('pp', { pages: props.image.pageNumbers?.join(',') ?? '' }, props.image.pageNumbers?.length ?? 0)
)
</script>
