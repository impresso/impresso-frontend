<template>
  <Modal
    :show="isVisible"
    :dialogClass="dialogClass"
    modalClass="ShareContentItemModal"
    bodyClass="pt-0 px-3"
    @shown="delayIframePreview"
    @close="emit('dismiss')"
    :title="$t('titles.shareContentItemModal')"
  >
    <div class="container-fluid p-0 h-100">
      <div class="row h-100">
        <div class="col-8 d-flex flex-column h-100" style="min-height: 500px">
          <h5 class="my-3">{{ $t('labels.iFramePreview') }}</h5>

          <div
            class="flex-grow-1 position-relative border border-dark rounded-sm shadow-sm mt-1 mb-1"
            style="overflow: hidden"
          >
            <div
              :style="{
                height: `${form.height}px`,
                width: '100%',
                padding: 0,
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: `${form.backgroundColor}`
              }"
            >
              <iframe
                ref="iframePreviewRef"
                :src="iframeSrc"
                @load="onIframeLoad"
                :style="{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 1
                }"
                frameborder="0"
                allow="autoplay; fullscreen"
                allowfullscreen
              ></iframe>
              <div
                class="position-absolute top-0 start-0 left-0 w-100 h-100"
                :style="{
                  opacity: isIframeLoaded ? 0 : 1,
                  transition: isIframeLoaded
                    ? 'opacity .5s ease-in-out'
                    : 'opacity .15s ease-in-out',
                  transitionDelay: isIframeLoaded ? '.5s' : '0s',
                  zIndex: 2,
                  pointerEvents: 'none',
                  backgroundColor: `${form.backgroundColor}`
                }"
              ></div>
            </div>
            <div class="ShareContentItemModal__iframe-caption d-none" ref="iframeCaptionPreview">
              <ContentItem
                :item="props.item"
                showMeta
                :style="{
                  padding: form.captionPadding + 'px'
                }"
              ></ContentItem>
            </div>
          </div>
          <div v-if="iframeCaption.length" :style="{ padding: form.captionPadding + 'px' }">
            {{ iframeCaption }}
          </div>
          <div>
            <h5 class="my-3">{{ $t('labels.iFrameCode') }}</h5>
            <textarea
              ref="iframeCodeTextarea"
              readonly
              :value="iframeCode"
              class="mb-2 form-control shadow-sm rounded-sm border bg-light"
            ></textarea>
          </div>
        </div>
        <div class="col-4">
          <h5 class="my-3">{{ $t('labels.customizationOptions') }}</h5>
          <div class="row border-bottom pb-3 mb-3">
            <div class="col-12">
              <label>{{ $t('labels.alternativeTitle') }}</label>
              <bFormInput
                type="text"
                v-model="form['alternativeTitle']"
                :debounce="500"
                class="rounded-sm shadow-sm"
                :placeholder="props.item.text?.title ?? ''"
              />
            </div>
            <div class="col-12">
              <label>{{ $t('labels.page') }}</label>

              <b-form-select
                class="rounded-sm shadow-sm w-100"
                v-model="selectedPageId"
                :options="
                  (props.item.image?.pages ?? []).map(page => ({
                    value: page.id,
                    text: $t('pageNumber', { n: page.number })
                  }))
                "
              >
              </b-form-select>
            </div>

            <div class="col-12">
              <label>{{ $t(`labels.height`) }}</label>
              <bFormInput
                type="number"
                v-model="form.height"
                :debounce="500"
                class="rounded-sm shadow-sm"
              />
            </div>
          </div>
          <div class="row">
            <div class="col-12">
              <BFormCheckbox switch v-model="fitCoords">
                {{ $t('labels.fitCoords') }}
              </BFormCheckbox>
            </div>
          </div>
          <div class="row border-bottom pb-3 mb-3">
            <template v-if="availablePageRegions">
              <div v-for="(region, index) in availablePageRegions" :key="index" class="col-6">
                <label>{{ $t('labels.region') }} {{ index + 1 }}</label>
                <input type="checkbox" :value="index" v-model="selectedPageRegionsIndices" />
              </div>
              <hr class="my-2" />
            </template>
            <div class="col-6" v-for="coord in ['x', 'y', 'w', 'h']" :key="coord">
              <label>{{ $t(`labels.${coord}`) }}</label>
              <bFormInput
                :disabled="!fitCoords"
                type="number"
                v-model="form.coords[coord]"
                :debounce="500"
                class="rounded-sm shadow-sm"
              />
            </div>
          </div>
          <div class="row mt-2">
            <div
              class="col-6"
              v-for="field in ['backgroundColor', 'overlayBackgroundColor']"
              :key="field"
            >
              <label>{{ $t(`labels.${field}`) }}</label>
              <bFormInput
                type="color"
                v-model="form[field]"
                :debounce="300"
                class="rounded-sm shadow-sm"
              />
            </div>
          </div>

          <div class="row mt-2">
            <div class="col-6" v-for="field in ['coordsMargin', 'captionPadding']" :key="field">
              <label>{{ $t(`labels.${field}`) }}</label>
              <bFormInput
                type="number"
                v-model="form[field]"
                :debounce="500"
                class="rounded-sm shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #modal-footer="{ close }">
      <b-button variant="outline-primary" size="sm" v-on:click="copyIframeCodeToClipboard()"
        >{{ $t('copy_to_clipboard') }}
      </b-button>
      <b-button variant="outline-secondary" size="sm" @click="close()">
        {{ $t('close') }}
      </b-button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import type { ContentItem as ContentItemType } from '@/models/generated/schemas/contentItem'
import { computed, onUnmounted, reactive, ref, watch } from 'vue'
import { WebAppHost, WidgetBaseUrl } from '@/constants'
import BFormCheckbox from '../legacy/bootstrap/BFormCheckbox.vue'
import ContentItem from '../modules/lists/ContentItem.vue'

/** Content Item to share */
export type ShareContentItemModalProps = {
  item: ContentItemType
  dialogClass?: string
  isVisible?: boolean
}

export type ShareContentItemModalsFormPayload = {
  backgroundColor: string
  overlayBackgroundColor: string
  height: number
  coordsMargin: number
  captionPadding: number
  coords: { x: number; y: number; w: number; h: number }
  alternativeTitle: string
}

const fitCoords = ref(true)
const props = withDefaults(defineProps<ShareContentItemModalProps>(), {
  dialogClass: ' modal-xl p-0 modal-dialog-scrollable '
})
const selectedPageId = ref<string | null>(props.item.image?.pages?.[0]?.id ?? null)

const form = reactive<ShareContentItemModalsFormPayload>({
  backgroundColor: '#393939',
  overlayBackgroundColor: '#B7F1F8AA',
  height: 600,
  coordsMargin: 50,
  captionPadding: 8,
  coords: { x: 0, y: 0, w: 100, h: 100 },
  alternativeTitle: ''
})

const selectedPageRegionsIndices = ref<number[]>([])
/**
 * Available regions for the selected page. Can be null if no page is selected or if the page has no regions.
 */
const availablePageRegions = computed<null | [number, number, number, number][]>(() => {
  const page = props.item.image?.pages?.find(p => p.id === selectedPageId.value)
  return page?.regionCoordinates ?? null
})

const iframeSrcParams = computed<string[]>(() => {
  const params: string[] = [
    `backgroundColor=${form.backgroundColor.replace('#', '')}`,
    `overlayBackgroundColor=${fitCoords.value ? form.overlayBackgroundColor.replace('#', '') : 'ffffffff'}`,
    `coordsMargin=${form.coordsMargin}`
  ]
  if (fitCoords.value && form.coords.w > 0) {
    params.push(`fitCoords=true`)
    params.push(`coords=${form.coords.x},${form.coords.y},${form.coords.w},${form.coords.h}`)
  }
  if (form.alternativeTitle.trim().length > 0) {
    params.push(`alternativeTitle=${encodeURIComponent(form.alternativeTitle.trim())}`)
  }
  return params
})

const iframeSrc = computed(() => {
  const pageId = selectedPageId.value ?? ''
  return `${WebAppHost}${WidgetBaseUrl}p/${pageId}/a/${props.item.id}?${iframeSrcParams.value.join('&')}`
})

const isIframeLoaded = ref(false)
const iframeCode = computed(() => {
  return [
    `<div><div style="height:${form.height}px;width:100%;padding:0;position:relative;">`,
    `<iframe src="${iframeSrc.value}" style="position:absolute;top:0;left:0;width:100%;height:100%;"
            frameborder="0" allow="autoplay; fullscreen"
            allowfullscreen></iframe>`,
    '</div>',
    iframeCaption.value
      ? `<div style="padding:${form.captionPadding}px;">${iframeCaption.value}</div>`
      : '',
    '</div>'
  ].join('')
})

const iframeCodeTextarea = ref<HTMLTextAreaElement | null>(null)
const iframeCaptionPreview = ref<HTMLElement | null>(null)

const iframeCaption = computed(() => {
  const captionHtml = iframeCaptionPreview.value?.textContent ?? ''
  return captionHtml.trim()
})

const copyIframeCodeToClipboard = async () => {
  if (!iframeCodeTextarea.value) return

  try {
    await navigator.clipboard.writeText(iframeCodeTextarea.value.value)
    iframeCodeTextarea.value.select()
    // Show success notification
    // addNotification({ title: 'Copied!', message: 'Code copied to clipboard', type: 'success' })
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    // Optionally show error notification
    // addNotification({ title: 'Error', message: 'Failed to copy to clipboard', type: 'error' })
  }
}

const delayIframePreview = () => {
  // Placeholder for any logic needed when the modal is shown
}

const onIframeLoad = () => {
  console.log('Iframe preview is ready')
  // Your logic here
  isIframeLoaded.value = true
}

const emit = defineEmits(['dismiss'])

watch(selectedPageId, () => {
  selectedPageRegionsIndices.value = []
})

let selectedPageRegionsIndicesDebounceTimer: ReturnType<typeof setTimeout> | null = null
watch(selectedPageRegionsIndices, () => {
  if (selectedPageRegionsIndicesDebounceTimer) clearTimeout(selectedPageRegionsIndicesDebounceTimer)

  selectedPageRegionsIndicesDebounceTimer = setTimeout(() => {
    const regions = availablePageRegions.value
    if (!regions) return
    if (selectedPageRegionsIndices.value.length > 0) {
      const selectedRegions = selectedPageRegionsIndices.value.map(i => regions[i])

      const minX = Math.min(...selectedRegions.map(r => r[0]))
      const minY = Math.min(...selectedRegions.map(r => r[1]))
      const maxX = Math.max(...selectedRegions.map(r => r[0] + r[2]))
      const maxY = Math.max(...selectedRegions.map(r => r[1] + r[3]))
      form.coords = {
        x: minX,
        y: minY,
        w: maxX - minX,
        h: maxY - minY
      }
      if (!fitCoords.value) {
        fitCoords.value = true
      }
    } else {
      fitCoords.value = false
    }
  }, 300)
})

watch(
  fitCoords,
  v => {
    clearTimeout(selectedPageRegionsIndicesDebounceTimer)
    if (v && availablePageRegions.value && selectedPageRegionsIndices.value.length === 0) {
      // select all regions
      selectedPageRegionsIndices.value = availablePageRegions.value.map((_, index) => index)
    }
  },
  { immediate: true }
)

watch(iframeSrc, () => {
  isIframeLoaded.value = false
})
// Cleanup on unmount
onUnmounted(() => {
  if (selectedPageRegionsIndicesDebounceTimer) {
    clearTimeout(selectedPageRegionsIndicesDebounceTimer)
    selectedPageRegionsIndicesDebounceTimer = null
  }
})
</script>
<i18n lang="json">
{
  "en": {
    "titles": {
      "shareContentItemModal": "Share Content Item"
    },
    "labels": {
      "iFramePreview": "iFrame Preview",
      "iFrameCode": "iFrame Code",
      "customizationOptions": "Customization Options",
      "alternativeTitle": "Alternative Title",
      "height": "Height (px)",
      "fitCoords": "Fit Coords",
      "x": "X",
      "y": "Y",
      "w": "Width",
      "h": "Height",
      "region": "Region",
      "backgroundColor": "Background Color",
      "overlayBackgroundColor": "Overlay Background Color",
      "coordsMargin": "Coords Margin (px)",
      "captionPadding": "Caption Padding (px)"
    },
    "copy_to_clipboard": "Copy to Clipboard",
    "close": "Close"
  }
}
</i18n>
<style>
.ShareContentItemModal .modal-header {
  border-bottom: none;
  padding-right: var(--spacing-1);
  padding-bottom: var(--spacing-1);
}
.ShareContentItemModal .container-fluid {
  display: block;
}
.ShareContentItemModal__iframe-caption h2,
.ShareContentItemModal__iframe-caption h2 span,
.ShareContentItemModal__iframe-caption a,
.ShareContentItemModal__iframe-caption button {
  font-size: inherit;
  color: inherit;
}

@media (min-width: 576px) {
  .ShareContentItemModal .modal-dialog {
    max-width: 90vw;
  }
}
@media (min-width: 992px) {
  .ShareContentItemModal .modal-dialog {
    max-width: 900px;
  }
}
@media (min-width: 1200px) {
  .ShareContentItemModal .modal-dialog {
    max-width: 1000px;
  }
}
</style>
