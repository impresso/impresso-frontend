<template lang="html">
  <div class="issue-viewer-bookmarker" :class="{ active, visible }">
    <div
      class="bg-dark p-2 drop-shadow d-flex align-items-center"
      style="background: black !important"
    >
      <div class="mr-2">
        {{ $t('label_selected_article') }}
      </div>
      <div class="text-white font-weight-bold mr-2 text-ellipsis">{{ title }}</div>
      <b-button
        size="sm"
        class="mx-2 text-white"
        variant="outline-primary"
        @click="$emit('click-full-text')"
      >
        <div class="d-flex align-items-center">
          {{ $t('closeReadingView') }}
          <div class="d-flex dripicons dripicons-align-justify ml-2" />
        </div>
      </b-button>
      <b-button
        pill
        class="dripicons-cross p-0"
        style="width: 1.5em; height: 1.5em; line-height: 1.75em"
        @click="handleRemoveSelection"
        variant="outline-primary"
      >
      </b-button>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    active: false,
    title: ''
  }),
  props: {
    article: Object,
    visible: Boolean
  },
  mounted() {
    if (this.visible) {
      this.show()
    }
  },
  computed: {
    articleId() {
      return this.article?.uid
    }
  },
  watch: {
    articleId: {
      handler(uid) {
        this.active = false
        if (uid) this.show()
      }
    }
  },
  methods: {
    show(delay = 600) {
      if (!this.articleId) return
      setTimeout(() => {
        this.active = true
        this.title = this.article?.title
      }, delay)
    },
    handleRemoveSelection() {
      this.active = false
      this.$emit('remove-selection')
    }
  }
}
</script>

<style lang="scss" scoped>
.issue-viewer-bookmarker {
  position: absolute;
  left: 50%;
  z-index: 2;
  width: 50%;
  margin-left: -25%;
  top: 0px;
  color: white;
  height: 70px;
  overflow: hidden;
  display: none;
  z-index: 100;
  & > div {
    background: #343b3f;
    border-radius: 5px;
    position: absolute;
    top: 10px;
    padding: 5px 50px;
    transform: translateY(-70px);
    transition: transform 0.6s cubic-bezier(0.8, -0.5, 0.2, 1.4);
  }
  &.active > div {
    transform: translateY(0);
  }
  &.visible {
    display: flex;
  }
}
</style>
<i18n lang="json">
{
  "en": {
    "label_selected_article": "Selected article: ",
    "label_full_text": "read full text"
  }
}
</i18n>
