<template lang="html">

  <b-modal hide-footer @shown="delayIframePreview" visible v-bind:title="$t('modal_title_share_article')">
    <h2 class="sans font-weight-bold">{{ $t('embed')}}</h2>
    <b-form-textarea id="inputLink" ref="inputLink" readonly v-model="iframeCode" class="mb-2"/>

    <iframe :src="widgetLink"
      class="widgetLink border">
      <p>Your browser does not support iframes.</p>
    </iframe>
    <b-input-group prepend="URL">
      <b-form-input id="inputLink" ref="inputLink" readonly v-model="widgetLink" />
      <template v-slot:append>
        <b-button
          variant="outline-primary" size="sm"
          v-on:click="copyArticleUrlToClipboard()"
          >{{ $t('copy_to_clipboard') }}
        </b-button>

    <b-row no-gutters class="mt-4">
      <b-col cols="8">
        <div class="d-flex mr-2" :style="getIframeWrapperStyle">
          <div v-if="isShown" class="h-100 w-100" v-html="iframeCode" />
        </div>
      </b-col>
      <b-col>
        <div class="ml-2" v-if="isShown">
          <h2 class="small-caps font-weight-bold">{{ $t('options_customise') }}</h2>
          <b-form>
            <label for="form-input-bgcolor">{{ $t('options_bgcolor') }}</label>
            <b-input-group size="sm" prepend="#" class="mb-2 mr-sm-2 mb-sm-0">
              <b-input id="form-input-bgcolor" :value="backgroundColor"
                @input="debounceInput($event, 'backgroundColor')"></b-input>
    </b-input-group>
            <small id="form-input-bgcolor-help" class="form-text text-muted">{{ $t('options_bgcolor_help') }}</small>

            <label for="form-input-ovcolor" class="mt-2">{{ $t('options_ovcolor') }}</label>
            <b-input-group size="sm" prepend="#" class="mb-2 mr-sm-2 mb-sm-0">
              <b-input id="form-input-ovcolor" :value="overlayBackgroundColor"
                @input="debounceInput($event, 'overlayBackgroundColor')"></b-input>
            </b-input-group>
            <small id="form-input-ovcolor-help" class="form-text text-muted">{{ $t('options_ovcolor_help') }}</small>

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
    backgroundColor: 'e1e1e1',
    overlayBackgroundColor: 'ff00ff44',
  }),
  model: {
    prop: 'article',
  },
  props: {
    article: Object,
  },
  computed: {
    customisation() {
      return [
        `backgroundColor=${this.backgroundColor}`,
        `overlayBackgroundColor=${this.overlayBackgroundColor}`
      ].join('&');
    },
    iframeCode() {
      return [
        '<div style="padding:141.4% 0 0 0;position:relative;">',
        `<iframe src="${this.widgetLink}" style="position:absolute;top:0;left:0;width:100%;height:100%;"
            frameborder="0" allow="autoplay; fullscreen"
            allowfullscreen><p>Your browser does not support iframes.</p></iframe>`,
        '</div>',
      ].join('');
    },
    getIframeWrapperStyle() {
      return {
        minHeight: '200px',
        backgroundColor: `#${this.backgroundColor}`,
      }
    },
    widgetLink() {
      const baseURL = window.location.origin + this.publicPath;
      return baseURL + `widget/#/p/${this.article.pages[0].uid}/a/${this.article.uid}/`;
    },
  },
  mounted() {
    this.$root.$on('bv::modal::hidden', () => {
      this.$emit('closed');
    })
  },
  methods: {
    debounceInput(value, prop) {
      clearTimeout(this.delayTimer);
      this.delayTimer = setTimeout(() => {
        this[prop] = value;
      }, 1000);
    },
    delayIframePreview() {
      setTimeout(() => {
        this.isShown = true;
      }, 1000);
    },
    copyArticleUrlToClipboard() {

      this.$refs.inputLink.select();
      document.execCommand('copy');

      const url = window.getSelection();

      const title = this.$t('url_copied_title');
      const message = this.$tc('url_copied_message', url);

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
    width:100%;
    height: 400px;
  }
</style>

<i18n>
{
  "en": {
    "copy_to_clipboard" : "Copy to clipboard",
    "url_copied_title" : "URL copied to clipboard",
    "url_copied_message" : "{n} copied to clipboard",
    "modal_title_share_article" : "Share a link to this article",
    "options_bgcolor": "background color",
    "options_bgcolor_help": "format hex RGB",
    "options_ovcolor": "highlight color",
    "options_ovcolor_help": "format hex RGB + alpha",
    "options_customise": "Custom style"
  }
}
</i18n>
