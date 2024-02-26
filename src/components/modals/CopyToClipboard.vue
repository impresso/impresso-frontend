<template>
  <b-modal
    dialog-class="CopyToClipboard"
    content-class="CopyToClipboard__content drop-shadow rounded"
    scrollable
    @shown="delayIframePreview"
    visible
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
          <div class="d-flex CopyToClipboard__preview" :style="getIframeWrapperStyle">
            <div
              v-if="isShown"
              class="h-100 w-100"
              ref="iframeWrapper"
              v-html="[iframeCode, iframeCaptionCode].join('\n')"
            />
          </div>
          <hr />
          <label class="font-weight-bold mt-2">{{ $t('iframe_code') }}</label>

          <b-form-textarea
            id="inputLink"
            ref="inputLink"
            readonly
            :value="[iframeCode, iframeCaptionCode].join('\n')"
            class="mb-2"
          />

          <b-button variant="outline-primary" size="sm" v-on:click="copyArticleUrlToClipboard()"
            >{{ $t('copy_to_clipboard') }}
          </b-button>
        </div>
      </b-col>
      <b-col>
        <div class="ml-2" v-if="isShown">
          <label for="form-input-title">{{ $t('article_title') }}</label>
          <b-input-group size="sm" class="mb-2 mr-sm-2 mb-sm-0">
            <b-input
              id="form-input-title"
              :value="title"
              @input="debounceInput($event, 'title')"
            ></b-input>
          </b-input-group>
          <hr />
          <label for="form-input-bgcolor">{{ $t('options_bgcolor') }}</label>
          <b-input-group size="sm" prepend="#" class="mb-2 mr-sm-2 mb-sm-0">
            <b-input
              id="form-input-bgcolor"
              :value="backgroundColor"
              @input="debounceInput($event, 'backgroundColor')"
            ></b-input>
          </b-input-group>
          <small id="form-input-bgcolor-help" class="form-text text-muted">{{
            $t('options_bgcolor_help')
          }}</small>

          <label for="form-input-ovcolor" class="mt-2">{{ $t('options_ovcolor') }}</label>
          <b-input-group size="sm" prepend="#" class="mb-2 mr-sm-2 mb-sm-0">
            <b-input
              id="form-input-ovcolor"
              :value="overlayBackgroundColor"
              @input="debounceInput($event, 'overlayBackgroundColor')"
            ></b-input>
          </b-input-group>
          <small id="form-input-ovcolor-help" class="form-text text-muted">{{
            $t('options_ovcolor_help')
          }}</small>

          <label for="form-input-coords-x" class="mt-2">{{ $t('options_ovcoords') }}</label>
          <!-- printout coords in inut elements -->
          <b-input-group size="sm" class="mt-1">
            <b-input-group-prepend is-text>x</b-input-group-prepend>
            <b-input
              id="form-input-coords-x"
              type="number"
              :value="cx"
              @input="debounceInput($event, 'cx')"
            ></b-input>
          </b-input-group>
          <b-input-group size="sm" class="mt-1">
            <b-input-group-prepend is-text>y</b-input-group-prepend>
            <b-input
              id="form-input-coords-y"
              type="number"
              :value="cy"
              @input="debounceInput($event, 'cy')"
            ></b-input>
          </b-input-group>
          <b-input-group size="sm" class="mt-1">
            <b-input-group-prepend is-text>w</b-input-group-prepend>
            <b-input
              id="form-input-coords-w"
              type="number"
              :value="cw"
              @input="debounceInput($event, 'cw')"
            ></b-input>
          </b-input-group>
          <b-input-group size="sm" class="mt-1">
            <b-input-group-prepend is-text>h</b-input-group-prepend>
            <b-input
              id="form-input-coords-h"
              type="number"
              :value="ch"
              @input="debounceInput($event, 'ch')"
            >
            </b-input>
          </b-input-group>
          <hr />

          <label for="form-input-ratio" class="mt-2">{{ $t('options_customise_viewport') }}</label>
          <!-- adapt to article region by default -->

          <b-form-radio-group v-model="fitCoords" v-slot="{ ariaDescribedby }">
            <b-form-radio :value="true" :aria-describedby="ariaDescribedby" name="some-radios">
              {{ $t('fixed_ratio') }}
            </b-form-radio>
            <b-form-radio :value="false" :aria-describedby="ariaDescribedby" name="some-radios">
              {{ $t('fixed_height') }}
            </b-form-radio>
          </b-form-radio-group>

          <label for="form-input-max-height" class="mt-2">{{
            $t('options_customise_viewport_max_height')
          }}</label>

          <b-input-group size="sm" class="mt-1">
            <b-input-group-prepend is-text>px</b-input-group-prepend>
            <b-input
              id="form-input-max-height"
              type="number"
              :value="maxHeight"
              @input="debounceInput($event, 'maxHeight')"
            ></b-input>
          </b-input-group>
        </div>
      </b-col>
    </b-row>
    <!-- {{ widgetLink }}
    <b-input-group prepend="URL">
      <template v-slot:append>

      </template>
    </b-input-group> -->
  </b-modal>
</template>

<script>
import Partner from '@/models/Partner'
import { newspapers as NewspapersService } from '@/services'

export default {
  data: () => ({
    maxHeight: 400,
    isShown: false,
    coordsMargin: 20,
    captionHeight: 40,
    backgroundColor: 'e1e1e1',
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
  }),
  model: {
    prop: 'article',
  },
  props: {
    article: Object,
  },
  computed: {
    customisation() {
      const params = [
        `backgroundColor=${this.backgroundColor}`,
        `overlayBackgroundColor=${this.overlayBackgroundColor}`,
        `coordsMargin=${this.coordsMargin}`,
      ]
      if (this.fitCoords) {
        params.push(`coords=${this.cx},${this.cy},${this.cw},${this.ch}`)
      }
      return params.join('&')
    },
    iframeCaptionCode() {
      const date = this.$d(this.article.date, 'long')
      const url = `${process.env.VUE_APP_BASE_URL}/app/issue/${this.article.issue.uid}/view?p=${this.article.pages[0].num}`

      return [
        `<p style="padding: 0 10px; margin: 0; font-style: italic"><a href="${url}">${this.title}</a></p>`,
        `<p style="padding: 0 10px;  margin: 0; font-size: .8em"><b>${this.article.newspaper.name}</b> ${this.computedPartner}</p>`,
        `<p style="padding: 0 10px 10px;; margin: 0; font-size: .8em">${date}</p>`,
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
        '</div>',
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
        backgroundColor: `#${this.backgroundColor}`,
      }
    },
    widgetLink() {
      const { base: urlPrefix } = this.$router.options
      return `${window.location.origin}${urlPrefix}widget/#/p/${this.article.pages[0]?.uid}/a/${this.article.uid}/?${this.customisation}`
    },
  },
  mounted() {
    this.$root.$on('bv::modal::hidden', () => {
      this.$emit('closed')
    })
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

      this.$bvToast.toast(message + 'sticazzi', {
        title: title,
        variant: 'success',
        toaster: 'b-toaster-bottom-center',
        solid: true,
      })
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
        this.ch,
      )
    },
  },
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

<i18n>
{
  "en": {
    "title": "title",
    "article_title": "Article title",
    "copy_to_clipboard" : "Copy to clipboard",
    "iframe_preview": "iframe preview",
    "iframe_code" : "copy & paste html code",
    "url_copied_title" : "URL copied to clipboard",
    "url_copied_message" : "{n} copied to clipboard",
    "modal_title_share_article" : "share newspaper article",
    "options_bgcolor": "background color",
    "options_bgcolor_help": "format hex RGB",
    "options_ovcolor": "highlight area color",
    "options_ovcoords": "highlight area coords",
    "options_ovcolor_help": "format hex RGB + alpha",
    "options_customise": "customize style",
    "options_customise_viewport": "customize viewport",
    "options_customise_viewport_max_height": "max. height",
    "adapt_ratio_to_coords": "Fit highlight area",
    "fixed_ratio": "Fit highlight area",
    "fixed_height": "Fit maximum height"
  }
}
</i18n>
