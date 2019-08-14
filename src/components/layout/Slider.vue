<template>
  <section class="i-layout-slider">
    <transition name="slide-right">
      <i-layout-section v-if="activeSlide === 'left'">
        <slot name="left"></slot>
      </i-layout-section>
    </transition>
    <transition name="slide-left">
      <i-layout-section v-if="activeSlide === 'right'">
        <slot name="right"></slot>
      </i-layout-section>
    </transition>
  </section>
</template>

<script>
export default {
  props: {
    activeSlide: {
      default: 'left', // either left or right
      type: String,
    },
  },
  model: {
    prop: 'activeSlide',
  },
  methods: {
    onClickBack() {
      this.$emit('input', 'left');
    },
  },
};
</script>

<style lang="scss" scoped>
  /*
  ***********
  * EXAMPLE *
  ***********

  <i-layout-section width="400px">
    <i-layout-slider v-model="activeSlide">
      <i-layout-section slot="left">
        <b-btn slot="header" on:click="show('right')">Show second screen</b-btn>
        <h1>This is the first screen</h1>
      </i-layout-section>
      <i-layout-section slot="right" class="bg-dark>
        <b-btn slot="footer" on:click="show('left')">Show first screen</b-btn>
        <h1>This is the second screen</h1>
      </i-layout-section>
    </i-layout-slider>
  </i-layout-section>

  <script>
  export default {
    data: () => ({
      activeSlide: 'left',
    }),
    methods: {
      show(side) {
        this.activeSlide = side;
      },
    },
  };
</script>

  */

section.i-layout-slider{
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-right-enter-active,
  .slide-right-leave-active {
    transition: transform 200ms;
    position: absolute;
    z-index: -1;
    width:100%;
  }
  .slide-left-enter, .slide-left-leave-to /* .fade-leave-active below version 2.1.8 */ {
    transform: translateX(400px);
  }

  .slide-right-enter, .slide-right-leave-to /* .fade-leave-active below version 2.1.8 */ {
    transform: translateX(-400px);
  }
}
</style>
