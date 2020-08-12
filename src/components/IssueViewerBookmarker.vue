<template lang="html">
  <div class="issue-viewer-bookmarker" :class="{ active, visible }">
    <div class="bg-dark p-2 drop-shadow d-flex">
      <div class="mr-2">
        {{$t('label_selected_article') }}
      </div>
      <div class="text-white font-weight-bold mr-2 text-ellipsis">{{ title }}</div>"
      <b-button class="mx-2" variant="outline-primary"
        size="sm"
        @click="$emit('click-full-text')">
        {{ $t('label_full_text') }}
      </b-button>
      <b-button pill class="dripicons-cross p-0"
        style="width:1.5em; height:1.5em; line-height: 1.75em"
        @click="handleRemoveSelection"
        variant="outline-primary">
      </b-button>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    active: false,
    title: '',
  }),
  props: {
    article: Object,
    visible: Boolean,
  },
  mounted() {
    if (this.visible) {
      this.show();
    }
  },
  computed: {
    articleId() {
      return this.article?.uid;
    },
  },
  watch: {
    articleId: {
      handler(uid) {
        this.active = false;
        if (uid) this.show();
      }
    }
  },
  methods: {
    show(delay=600) {
      setTimeout(() => {
        this.active = true;
        this.title = this.article?.title;
      }, delay);
    },
    handleRemoveSelection() {
      this.active = false;
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
  width: 100%;
  margin-left: -25%;
  bottom: -70px;
  color: white;
  height: 70px;
  overflow: hidden;
  & > div {
    background: #343b3f;
    border-radius: 5px;
    position: absolute;
    top: 10px;
    padding: 5px 50px;
    transform: translateY(-70px);
    transition: transform .6s cubic-bezier(.8,-.5,.2,1.4);
  }
  &.active > div {
    transform: translateY(0);
  }
}
</style>
<i18n>
  {
    "en": {
      "label_selected_article": "Selected article: ",
      "label_full_text": "read full text"
    }
  }
</i18n>
