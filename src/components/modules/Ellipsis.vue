<template lang="html">
  <div class="ellipsis">
    <div
      class="contents"
      ref="contents"
      :data-h="contentHeight"
      v-bind:style="`max-height:${height}px;overflow:${overflow}`"
    >
      <slot></slot>
    </div>
    <div class="more" v-bind:style="gradientStyle" v-if="contentHeight > initialHeight">
      <b-button size="sm" variant="outline-primary" v-on:click.prevent.stop="onClick">
        {{ $t(this.isCollapsed ? 'more' : 'less') }}</b-button
      >
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    isCollapsed: true,
    height: 0,
    collapsedHeight: 0,
    contentHeight: 0,
  }),
  props: {
    initialHeight: {
      type: Number,
      default: 50,
    },
    maxHeight: {
      type: Number,
      default: 0,
    },
    backgroundColor: {
      type: String,
      default: '#f8f9fa',
    },
  },
  updated() {
    if (this.$refs && this.$refs.contents) {
      this.contentHeight = this.$refs.contents.scrollHeight
    }
  },
  mounted() {
    this.height = +this.initialHeight
  },
  computed: {
    overflow() {
      if (!this.isCollapsed) {
        return 'auto'
      }
      return 'scroll'
    },
    gradientStyle() {
      if (!this.isCollapsed) {
        return {
          background: 'transparent',
        }
      }
      return {
        background: `linear-gradient(${this.backgroundColor}00 20%, ${this.backgroundColor})`,
      }
    },
  },
  methods: {
    onClick() {
      this.isCollapsed = !this.isCollapsed

      if (!this.collapsedHeight) {
        this.collapsedHeight = this.$refs.contents.clientHeight
      }
      if (this.isCollapsed) {
        this.height = +this.collapsedHeight
      } else {
        this.height =
          this.maxHeight !== 0
            ? Math.min(+this.$refs.contents.scrollHeight, this.maxHeight)
            : +this.$refs.contents.scrollHeight
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.ellipsis {
  position: relative;

  .contents {
    height: 100%;
    overflow: hidden;
  }
  .btn {
    background-color: #f8f9fa;
  }
  > .more {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 150px;
    text-align: right;
    background: linear-gradient(#f8f9fa00 20%, #f8f9fa);
  }
}
</style>

<i18n>
{
  "en": {
    "more": "(more ...)",
    "less": "less ..."
  },
  "it": {
    "more": "(espandi ...)",
    "less": "less ..."
  }
}
</i18n>
