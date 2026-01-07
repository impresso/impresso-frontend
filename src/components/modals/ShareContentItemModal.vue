<template>
  <Modal
    :show="isVisible"
    :dialogClass="dialogClass"
    bodyClass="pt-0 pe-4 ps-2"
    @shown="delayIframePreview"
    @close="emit('dismiss')"
    :title="$t('titles.shareContentItemModal')"
  >
    <div class="container-fluid h-100">
      <div class="row h-100">
        <div class="col-8 d-flex flex-column h-100" style="min-height: 500px">
          <label>{{ $t('labels.iFramePreview') }}</label>

          <div class="flex-grow-1 position-relative border rounded-sm shadow-sm mt-1 mb-2">
            <div v-html="iframeCode"></div>
          </div>
          <div>
            <label>{{ $t('labels.iFrameCode') }}</label>
            <textarea
              id="inputLink"
              ref="inputLink"
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
          <div class="row border-bottom pb-3 mb-3">
            <div class="col-12">
              <BFormCheckbox switch v-model="fitCoords">
                {{ $t('labels.fitCoords') }}
              </BFormCheckbox>
            </div>
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
              v-for="field in ['backgroundColor', 'textColor', 'overlayBackgroundColor']"
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
      <b-button variant="outline-primary" size="sm" v-on:click="copyArticleUrlToClipboard()"
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
import RadioGroup from '@/components/layout/RadioGroup.vue'
import type { ContentItem as ContentItemType } from '@/models/generated/schemas/contentItem'
import { computed, reactive, ref } from 'vue'
import { WebAppHost, WidgetBaseUrl } from '@/constants'
import BFormCheckbox from '../legacy/bootstrap/BFormCheckbox.vue'
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
  textColor: string
  coords: { x: number; y: number; w: number; h: number }
  alternativeTitle: string
  aspectRatio: number
}

const fitCoords = ref(false)
const props = withDefaults(defineProps<ShareContentItemModalProps>(), {
  dialogClass: ' modal-xl p-0 modal-dialog-scrollable '
})
const selectedPageId = ref<string | null>(props.item.image?.pages?.[0]?.id ?? null)

const form = reactive<ShareContentItemModalsFormPayload>({
  backgroundColor: '#FFFFFF',
  overlayBackgroundColor: '#FFFFFF',
  height: 600,
  coordsMargin: 20,
  captionPadding: 8,
  textColor: '#000000',
  coords: { x: 0, y: 0, w: 100, h: 100 },
  alternativeTitle: '',
  aspectRatio: 141.4
})

const iframeSrcParams = computed<string[]>(() => {
  const params: string[] = [
    `backgroundColor=${form.backgroundColor.replace('#', '')}`,
    `overlayBackgroundColor=${form.overlayBackgroundColor.replace('#', '')}`,
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

const iframeCode = computed(() => {
  return [
    `<div><div style="height:${form.height}px;width:100%;padding:0;position:relative;">`,
    `<iframe src="${iframeSrc.value}" style="position:absolute;top:0;left:0;width:100%;height:100%;"
            frameborder="0" allow="autoplay; fullscreen"
            allowfullscreen></iframe>`,
    '</div>'
  ].join('')
})

const copyArticleUrlToClipboard = async () => {
  // this.$refs.inputLink.select()
  // const text = [this.iframeCode, this.iframeCaptionCode].join('\n')
  // console.info('[CopyToClipboard] copyArticleUrlToClipboard', text)
  // await navigator.clipboard.writeText(text)
  // const title = this.$t('url_copied_title')
  // const message = this.$tc('url_copied_message')
  // this.addNotification({ title, message, type: 'success' })
}

const delayIframePreview = () => {
  // Placeholder for any logic needed when the modal is shown
}

const emit = defineEmits(['dismiss'])
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
      "backgroundColor": "Background Color",
      "overlayBackgroundColor": "Overlay Background Color",
      "textColor": "Text Color",
      "coordsMargin": "Coords Margin (px)",
      "captionPadding": "Caption Padding (px)"
    },
    "copy_to_clipboard": "Copy to Clipboard",
    "close": "Close"
  }
}
</i18n>
