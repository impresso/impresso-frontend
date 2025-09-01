<template>
  <Modal
    :show="isModalVisible"
    dialog-class="CopyToClipboard"
    content-class="CopyToClipboard__content drop-shadow rounded"
    @shown="delayIframePreview"
    @close="handleModalClosed"
  >
    <template #modal-header="{ close }">
      <!-- Emulate built in modal header close button action -->

      <h5 class="small-caps font-weight-bold">{{ $t('modal_title_share_article') }}</h5>
      <b-button size="sm" class="pe-0 pr-0" variant="transparent" @click="close()">
        <span class="dripicons-cross" v-on:click="close()" />
      </b-button>
    </template>

    <template #modal-footer="{ close }">
      <b-button variant="outline-primary" size="sm" v-on:click="copyArticleUrlToClipboard()"
        >{{ $t('copy_to_clipboard') }}
      </b-button>
      <b-button variant="outline-secondary" size="sm" @click="close()">
        {{ $t('close') }}
      </b-button>
    </template>

    <b-row no-gutters>
      <b-col cols="8">
        <div class="mr-2 me-2">
          <label>{{ $t('iframe_preview') }}</label>
          <div class="CopyToClipboard__preview" :style="getIframeWrapperStyle">
            <div v-if="isShown" class="h-100 w-100" ref="iframeWrapper" v-html="iframeCode" />
            <div v-html="iframeCaptionCode" />
          </div>
          <hr />
          <label class="font-weight-bold mt-2">{{ $t('iframe_code') }}</label>

          <textarea
            id="inputLink"
            ref="inputLink"
            readonly
            :value="[iframeCode, iframeCaptionCode].join('\n')"
            class="mb-2 form-control"
          ></textarea>

          <b-button variant="outline-primary" size="sm" v-on:click="copyArticleUrlToClipboard()"
            >{{ $t('copy_to_clipboard') }}
          </b-button>
        </div>
      </b-col>
      <b-col>
        <div class="ml-2" v-if="isShown">
          <label for="form-input-title">{{ $t('article_title') }}</label>
          <div class="input-group input-group-sm">
            <b-input
              id="form-input-title"
              :modelValue="title"
              @update:modelValue="debounceInput($event, 'title')"
            ></b-input>
          </div>
          <hr class="my-2" />
          <b-row>
            <b-col>
              <label for="form-input-bgcolor">{{ $t('options_bgcolor') }}</label>
              <div class="input-group input-group-sm">
                <div class="input-group-prepend">
                  <div
                    class="border border-dark text-center"
                    :style="{
                      backgroundColor: `#${backgroundColor}`,
                      height: '100%',
                      zIndex: 1,
                      width: '30px'
                    }"
                  >
                    #
                  </div>
                </div>
                <b-input
                  id="form-input-bgcolor"
                  :modelValue="backgroundColor"
                  @update:modelValue="debounceInput($event, 'backgroundColor')"
                ></b-input>
              </div>

              <small id="form-input-bgcolor-help" class="form-text text-muted">{{
                $t('options_bgcolor_help')
              }}</small>
            </b-col>
            <b-col>
              <label for="form-input-text-color">{{ $t('options_text_color') }}</label>
              <div class="input-group input-group-sm">
                <div class="input-group-prepend">
                  <div
                    class="border border-dark text-center"
                    :style="{
                      backgroundColor: `#${backgroundColor}`,
                      color: textColor,
                      height: '100%',
                      zIndex: 1,
                      width: '30px'
                    }"
                  >
                    css
                  </div>
                </div>
                <b-input
                  id="form-input-bgcolor"
                  :modelValue="textColor"
                  @update:modelValue="debounceInput($event, 'textColor')"
                ></b-input>
              </div>

              <small
                id="form-input-bgcolor-help"
                class="form-text text-muted"
                v-html="$t('options_text_color_help')"
              />
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <label for="form-input-ovcolor">{{ $t('options_ovcolor') }}</label>
              <div class="input-group input-group-sm">
                <div class="input-group-prepend">
                  <div
                    class="border border-dark text-center"
                    :style="{
                      backgroundColor: `#${overlayBackgroundColor}`,
                      height: '100%',
                      zIndex: 1,
                      width: '30px'
                    }"
                  >
                    #
                  </div>
                </div>
                <b-input
                  id="form-input-ovcolor"
                  :modelValue="overlayBackgroundColor"
                  @update:modelValue="debounceInput($event, 'overlayBackgroundColor')"
                ></b-input>
              </div>
              <small id="form-input-ovcolor-help" class="form-text text-muted">{{
                $t('options_ovcolor_help')
              }}</small>
            </b-col>
          </b-row>
          <label for="form-input-coords-x" class="mt-2">{{ $t('options_ovcoords') }}</label>
          <!-- printout coords in inut elements -->
          <b-row>
            <b-col>
              <div class="input-group input-group-sm mt-1">
                <div class="input-group-prepend"><div class="input-group-text">x</div></div>
                <b-input
                  id="form-input-coords-x"
                  type="number"
                  :modelValue="cx"
                  @update:modelValue="debounceInput($event, 'cx')"
                ></b-input>
              </div>
            </b-col>
            <b-col>
              <div class="input-group input-group-sm mt-1">
                <div class="input-group-prepend"><div class="input-group-text">y</div></div>
                <b-input
                  id="form-input-coords-y"
                  type="number"
                  :modelValue="cy"
                  @update:modelValue="debounceInput($event, 'cy')"
                ></b-input>
              </div>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <div class="input-group input-group-sm mt-1">
                <div class="input-group-prepend"><div class="input-group-text">w</div></div>
                <b-input
                  id="form-input-coords-w"
                  type="number"
                  :modelValue="cw"
                  @update:modelValue="debounceInput($event, 'cw')"
                ></b-input>
              </div>
            </b-col>
            <b-col>
              <div class="input-group input-group-sm mt-1">
                <div class="input-group-prepend"><div class="input-group-text">h</div></div>
                <b-input
                  id="form-input-coords-h"
                  type="number"
                  :modelValue="ch"
                  @update:modelValue="debounceInput($event, 'ch')"
                >
                </b-input>
              </div>
            </b-col>
          </b-row>

          <hr />

          <label for="form-input-ratio" class="mt-2">{{ $t('options_customise_viewport') }}</label>
          <!-- adapt to article region by default -->

          <radio-group
            :modelValue="String(fitCoords)"
            :options="fitCoordsOptions"
            @update:modelValue="fitCoords = $event == 'true'"
            type="radio"
          />

          <label for="form-input-max-height" class="mt-2">{{
            $t('options_customise_viewport_max_height')
          }}</label>

          <div class="input-group input-group-sm">
            <div class="input-group-prepend"><div class="input-group-text">px</div></div>
            <b-input
              id="form-input-max-height"
              type="number"
              :modelValue="maxHeight"
              @update:modelValue="debounceInput($event, 'maxHeight')"
            ></b-input>
          </div>
          <b-row class="mt-2">
            <b-col>
              <label for="form-input-caption-padding">{{
                $t('options_customise_caption_padding')
              }}</label>

              <div class="input-group input-group-sm">
                <div class="input-group-prepend"><div class="input-group-text">px</div></div>
                <b-input
                  id="form-input-caption-padding"
                  type="number"
                  :modelValue="captionPadding"
                  @update:modelValue="debounceInput($event, 'captionPadding')"
                ></b-input>
              </div>
              <small id="form-input-caption-padding-help" class="form-text text-muted">{{
                $t('options_customise_caption_padding_help')
              }}</small>
            </b-col>
            <b-col>
              <label for="form-input-viewport-coords-margin">
                {{ $t('options_customise_viewport_coords_margin') }}
              </label>
              <div class="input-group input-group-sm">
                <div class="input-group-prepend"><div class="input-group-text">px</div></div>
                <b-input
                  id="form-input-viewport-coords-margin"
                  type="number"
                  :modelValue="coordsMargin"
                  @update:modelValue="debounceInput($event, 'coordsMargin')"
                ></b-input>
              </div>
            </b-col>
          </b-row>
        </div>
      </b-col>
    </b-row>
  </Modal>
</template>

<script>
import { mapActions } from 'pinia'
import { useNotificationsStore } from '@/stores/notifications'
import Partner from '@/models/Partner'
import { newspapers as NewspapersService } from '@/services'
import RadioGroup from '@/components/layout/RadioGroup.vue'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'

export default {
  data: () => ({
    maxHeight: 400,
    captionPadding: 10,
    isShown: false,
    coordsMargin: 20,
    backgroundColor: 'e1e1e1',
    textColor: 'inherit',
    overlayBackgroundColor: 'ff00ff33',
    ratio: 141.4,
    fitCoords: true,
    cx: 0,
    cy: 0,
    cw: 0,
    ch: 0,
    title: '',
    newspaper: null,
    partner: null,
    isModalVisible: false
  }),
  props: {
    article: Object
  },
  computed: {
    fitCoordsOptions() {
      return [
        { value: 'true', text: this.$t('fixed_ratio') },
        { value: 'false', text: this.$t('fixed_height') }
      ]
    },
    customisation() {
      const params = [
        `backgroundColor=${this.backgroundColor}`,
        `overlayBackgroundColor=${this.overlayBackgroundColor}`,
        `coordsMargin=${this.coordsMargin}`
      ]
      if (this.fitCoords) {
        params.push(`coords=${this.cx},${this.cy},${this.cw},${this.ch}`)
      }
      return params.join('&')
    },
    iframeCaptionCode() {
      const date = this.$d(this.article.date, 'long')
      const url = `${import.meta.env.BASE_URL}/app/issue/${this.article.issue.uid}/view?p=${this.article.pages[0].num}`
      return [
        `<div style="color: ${this.textColor}">`,
        `<p style="padding: ${this.captionPadding}px ${this.captionPadding}px 0; margin: 0; font-style: italic"><a href="${url}">${this.title}</a></p>`,
        `<p style="padding: 0 ${this.captionPadding}px;  margin: 0; font-size: .8em"><b>${this.article.newspaper.name}</b> ${this.computedPartner}</p>`,
        `<p style="padding: 0 ${this.captionPadding}px ${this.captionPadding}px; margin: 0; font-size: .8em">${date}</p>`,
        '</div>'
      ].join('')
    },
    iframeCode() {
      return [
        this.fitCoords
          ? `<div style="padding:${this.computedRatio}% 0 0 0;position:relative;">`
          : `<div style="height:${this.maxHeight}px;width:100%;padding:0;position:relative;">`,
        `<iframe src="${this.widgetLink}" style="position:absolute;top:0;left:0;width:100%;height:100%;"
            frameborder="0" allow="autoplay; fullscreen"
            allowfullscreen><p>Your browser does not support iframes.</p></iframe>`,
        '</div>'
      ].join('')
    },
    computedCoords() {
      return `${this.cx},${this.cy},${this.cw},${this.ch}`
    },
    computedRatio() {
      if (this.fitCoords && parseInt(this.cw, 10) > 0) {
        const h = Math.min(this.maxHeight, parseInt(this.ch, 10) + this.coordsMargin * 2)
        return ((100 * h) / (parseInt(this.cw, 10) + this.coordsMargin * 2)).toFixed(2)
      } else {
        return this.ratio
      }
    },
    computedPartner() {
      return this.partner ? '<br>' + this.partner.toHtml() : ''
    },
    getIframeWrapperStyle() {
      return {
        // minHeight: '200px',
        backgroundColor: `#${this.backgroundColor}`
      }
    },
    widgetLink() {
      const { base: urlPrefix } = this.$router.options.history
      const formattedUrlPrefix = urlPrefix.startsWith('/') ? urlPrefix : `/${urlPrefix}`
      return `${window.location.origin}${formattedUrlPrefix}/widget/#/p/${this.article.pages[0]?.uid}/a/${this.article.uid}/?${this.customisation}`
    }
  },
  mounted() {
    setTimeout(() => {
      this.isModalVisible = true
    }, 0)
    // set initial coord value from article
    if (this.article?.regions?.length) {
      this.setCoordsFromArticleRegions()
    }
    if (this.article?.title) {
      this.title = this.article.title
    }
    this.maxHeight = window.innerHeight - 200
    // load nespaper from article using services
    NewspapersService.get(this.article.newspaper.uid).then(newspaper => {
      this.newspaper = newspaper
      this.partner = this.newspaper.properties.reduce((acc, d) => {
        if (d.name === 'partnerUid') {
          acc.uid = d.value
        }
        if (d.name === 'institutionNames') {
          acc.name = d.value
        }
        if (d.name === 'institutionLinks') {
          acc.links = d.value.split('\n')
          acc.url = acc.links[0]
        }
        return acc
      }, new Partner())
    })
  },
  methods: {
    handleModalClosed() {
      this.isModalVisible = false
      this.$emit('closed')
    },
    ...mapActions(useNotificationsStore, ['addNotification']),
    debounceInput(value, prop) {
      clearTimeout(this.delayTimer)
      this.delayTimer = setTimeout(() => {
        this[prop] = value
      }, 100)
    },
    delayIframePreview() {
      setTimeout(() => {
        this.isShown = true
      }, 100)
    },
    async copyArticleUrlToClipboard() {
      this.$refs.inputLink.select()
      const text = [this.iframeCode, this.iframeCaptionCode].join('\n')
      console.info('[CopyToClipboard] copyArticleUrlToClipboard', text)
      await navigator.clipboard.writeText(text)

      const title = this.$t('url_copied_title')
      const message = this.$tc('url_copied_message')

      this.addNotification({ title, message, type: 'success' })
    },
    setCoordsFromArticleRegions() {
      let x0 = Infinity
      let x1 = 0
      let y0 = Infinity
      let y1 = 0

      this.article.regions.forEach(d => {
        if (d.coords.x < x0) {
          x0 = d.coords.x
        }
        if (d.coords.y < y0) {
          y0 = d.coords.y
        }
        if (d.coords.x + d.coords.w > x1) {
          x1 = d.coords.x + d.coords.w
        }
        if (d.coords.y + d.coords.h > y1) {
          y1 = d.coords.y + d.coords.h
        }
      })
      this.cx = x0
      this.cy = y0
      this.cw = x1 - x0
      this.ch = y1 - y0
      console.info(
        '[CopyToClipboard] setCoordsFromArticleRegions',
        this.cx,
        this.cy,
        this.cw,
        this.ch
      )
    }
  },
  components: {
    RadioGroup,
    Modal
  }
}
</script>

<style lang="scss">
.CopyToClipboard__content {
  border: 1px solid #343a40;
  .widgetLink {
    width: 100%;
    height: 400px;
  }

  .modal-header {
    border-bottom: 0px solid transparent;
    padding-bottom: 0px;
  }
}
.CopyToClipboard__preview a {
  text-decoration: underline;
}
.CopyToClipboard label {
  margin-bottom: 0;
}
.CopyToClipboard hr {
  margin-top: 0.5rem;
  margin-bottom: 0.25rem;
}

.CopyToClipboard label {
  text-transform: uppercase;
  font-size: var(--impresso-font-size-smallcaps);
  font-variant: normal;
  letter-spacing: var(--impresso-letter-spacing-smallcaps);
  font-weight: var(--impresso-wght-smallcaps);
  font-variation-settings: 'wght' var(--impresso-wght-smallcaps);
}
@media (min-width: 992px) {
  .CopyToClipboard.modal-dialog {
    max-width: 800px;
  }
}
@media (min-width: 1200px) {
  .CopyToClipboard.modal-dialog {
    max-width: 1000px;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "title": "title",
    "article_title": "Article title",
    "copy_to_clipboard": "Copy to clipboard",
    "iframe_preview": "iframe preview",
    "iframe_code": "copy & paste html code",
    "url_copied_title": "URL copied to clipboard",
    "url_copied_message": "{n} copied to clipboard",
    "modal_title_share_article": "share newspaper article",
    "options_bgcolor": "background color",
    "options_bgcolor_help": "format hex RGB",
    "options_text_color": "text color",
    "options_text_color_help": "All <a href='https://developer.mozilla.org/en-US/docs/Web/CSS/color_value' target='_blank'>css color</a> formats",
    "options_ovcolor": "highlight area color",
    "options_ovcoords": "highlight area coords",
    "options_ovcolor_help": "format hex RGB + alpha",
    "options_customise": "customize style",
    "options_customise_viewport": "customize viewport",
    "options_customise_viewport_max_height": "max. height",
    "options_customise_caption_padding_help": "padding around caption",
    "options_customise_caption_padding": "caption padding",
    "options_customise_viewport_coords_margin": "highlight padding",
    "adapt_ratio_to_coords": "Fit highlight area",
    "fixed_ratio": "Fit highlight area",
    "fixed_height": "Fit maximum height"
  }
}
</i18n>
