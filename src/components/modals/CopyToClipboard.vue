<template lang="html">

  <b-modal hide-footer visible v-bind:title="$t('modal_title_share_article')">

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
      </template>
    </b-input-group>

  </b-modal>

</template>

<script>
export default {
  model: {
    prop: 'article',
  },
  props: ['article'],
  computed: {
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
    "modal_title_share_article" : "Share a link to this article"
  }
}
</i18n>
