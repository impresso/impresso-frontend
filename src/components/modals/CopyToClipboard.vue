<template>
  <b-modal
    hide-footer
    @shown="delayIframePreview"
    visible
    v-bind:title="$t('modal_title_share_article')"
  >
    <h2 class="sans font-weight-bold">{{ $t('embed') }}</h2>
    <b-form-textarea id="inputLink" ref="inputLink" readonly v-model="iframeCode" class="mb-2" />

    <b-button variant="outline-primary" size="sm" v-on:click="copyArticleUrlToClipboard()"
      >{{ $t('copy_to_clipboard') }}
    </b-button>

    <b-row no-gutters class="mt-4">
      <b-col cols="8">
        <div class="d-flex mr-2 shadow-sm" :style="getIframeWrapperStyle">
          <div v-if="isShown" class="h-100 w-100" v-html="iframeCode" />
        </div>
      </b-col>
      <b-col>
        <div class="ml-2" v-if="isShown">
          <h2 class="small-caps font-weight-bold">{{ $t('options_customise') }}</h2>
          <b-form>
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

            <!-- adapt to article region by default -->
            <b-form-checkbox id="form-input-ratio" v-model="fitCoords" class="mt-2 " switch inline>
              {{ $t('adapt_to_coords') }}
            </b-form-checkbox>

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

            <pre>{{ article.regions[0].coords }}</pre>
          </b-form>
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
export default {
  data: () => ({
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
      // if (this.computedCoords) {
      //   params.push(`coords=${this.computedCoords}`)
      // }
      return params.join('&')
    },
    iframeCode() {
      return [
        `<div style="padding:${this.computedRatio}% 0 0 0;position:relative;">`,
        `<iframe src="${this.widgetLink}" style="position:absolute;top:0;left:0;width:100%;height:100%;"
            frameborder="0" allow="autoplay; fullscreen"
            allowfullscreen><p>Your browser does not support iframes.</p></iframe>`,
        '</div>',
        `<p>${this.article.title}</p>`,
      ].join('')
    },
    computedCoords() {
      if (this.fitCoords) {
        return `${this.cx},${this.cy},${this.cw},${this.ch}`
      }
      let coords = this.article?.regions?.length ? this.article.regions[0].coords : null
      if (coords) {
        return `${coords.x},${coords.y},${coords.w},${coords.h}`
      }
      return null
    },
    computedRatio() {
      if (this.fitCoords && this.cw > 0) {
        return (
          (100 * (this.ch + this.coordsMargin * 2)) /
          (this.cw + this.coordsMargin * 2)
        ).toFixed(2)
      } else {
        return this.ratio
      }
    },
    getIframeWrapperStyle() {
      return {
        minHeight: '200px',
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
      const coords = this.article.regions[0].coords
      this.cx = coords.x
      this.cy = coords.y
      this.cw = coords.w
      this.ch = coords.h
    }
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
    copyArticleUrlToClipboard() {
      this.$refs.inputLink.select()
      document.execCommand('copy')

      const url = window.getSelection()

      const title = this.$t('url_copied_title')
      const message = this.$tc('url_copied_message', url)

      this.$bvToast.toast(message, {
        title: title,
        variant: 'success',
        toaster: 'b-toaster-bottom-center',
        solid: true,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.widgetLink {
  width: 100%;
  height: 400px;
}
</style>

<i18n>
{
  "en": {
    "copy_to_clipboard" : "Copy to clipboard",
    "url_copied_title" : "URL copied to clipboard",
    "url_copied_message" : "{n} copied to clipboard",
    "modal_title_share_article" : "Share newspaper article",
    "options_bgcolor": "background color",
    "options_bgcolor_help": "format hex RGB",
    "options_ovcolor": "highlight color",
    "options_ovcolor_help": "format hex RGB + alpha",
    "options_customise": "customize style",
    "adapt_to_coords": "Fit IIIF coords:"
  }
}
</i18n>
