<template lang="html">
  <div class="h-100 v-100" :style="getBackgroundStyle">
    <div class="position-fixed h-100 v-100"></div>
    <div class="image h-100 v-100" :style="getImageStyle"></div>
  </div>
</template>

<script>
const options = {
  backgroundColor: {
    default: 'transparent',
    validate: (d) => /#\d6/.test(d),
  },
  backgroundSize: {
    default: 'normal',
    validate: (d) => ['contain', 'normal', 'cover'].indexOf(d) !== -1,
  },
};

export default {
  props: {
    backgroundSize: String,
    backgroundColor: String,
  },
  methods: {
    validateOrIgnore(prop) {
      if (options[prop].validate(this[prop])) {
        return this[prop];
      }
      return options[prop].default;
    },
  },
  computed: {
    getBackgroundStyle() {
      return {
        backgroundColor: this.validateOrIgnore('backgroundColor'),
      };
    },
    getImageStyle() {
      return {
        backgroundSize: this.validateOrIgnore('backgroundSize'),
        backgroundImage: 'url(https://live.staticflickr.com/7821/32349026587_077df84709_w_d.jpg)',
      };
    },
  },
};
</script>

<style lang="scss" scoped>
  .image{
    background-repeat: no-repeat;
    background-position: center;
  }
</style>
