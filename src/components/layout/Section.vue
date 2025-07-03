<template>
  <section v-bind:style="style" class="i-layout-section" :class="{ 'border-left': main }">
    <div v-if="this.$slots.header" class="header" :class="{ scroll: scrollTop }">
      <slot name="header"></slot>
    </div>
    <div class="body" :class="variant" ref="body">
      <slot></slot>
    </div>
    <div v-if="this.$slots.footer" class="footer">
      <slot name="footer"> </slot>
    </div>
  </section>
</template>

<script>
/*
<i-layout-section width="400px" />
*/
export default {
  data: () => ({
    scrollTop: 0
  }),
  props: {
    main: Boolean,
    width: {
      default: 'auto'
    },
    variant: {
      type: String,
      default: ''
    }
  },
  computed: {
    style() {
      if (this.width === 'auto') {
        return {
          flex: 'auto',
          maxWidth: this.main ? 'auto' : '400px'
        }
      }
      return {
        flex: `0 0 ${this.width}`
      }
    }
  },
  methods: {
    onScroll() {
      this.scrollTop = this.$refs.body.scrollTop
      this.$emit('scroll', { scrollTop: this.scrollTop })
    }
  },
  beforeUnmount() {
    this.$refs.body.removeEventListener('scroll', this.onScroll)
  },
  mounted() {
    this.$refs.body.addEventListener('scroll', this.onScroll)
  }
}
</script>

<style scoped lang="scss">
section.i-layout-section {
  position: relative;
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: min-content auto min-content;
  grid-template-areas: 'header' 'body' 'footer';
  height: 100%;
  background-color: transparent;
  > .header {
    grid-area: header;
    position: relative;
    background-color: transparent;
    &::after {
      content: '';
      position: absolute;
      bottom: -4px;
      height: 5px;
      left: 0;
      right: 0;
      pointer-events: none;
      z-index: 2;
      opacity: 0.25;
      background: rgb(255, 255, 255);
      background: -moz-linear-gradient(
        0deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(198, 204, 210, 0.21) 100%
      );
      background: -webkit-linear-gradient(
        0deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(198, 204, 210, 0.21) 100%
      );
      background: linear-gradient(0deg, rgba(255, 255, 255, 0) 0%, rgba(198, 204, 210, 0.21) 100%);
      filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#ffffff",endColorstr="#c6ccd2",GradientType=1);
      border-top: 1px solid #c6ccd2;
      transition: opacity 0.2s ease-in-out;
    }
    &.scroll::after {
      opacity: 1;
    }
  }
  > .body {
    grid-area: body;
    overflow-y: auto;
    &::-webkit-scrollbar {
      display: none;
    }
  }
  > .footer {
    grid-area: footer;
  }
}
</style>
