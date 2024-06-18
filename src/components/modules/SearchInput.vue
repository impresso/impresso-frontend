<template lang="html">
  <div class="input-group">
    <b-form-input
    class="border-primary"
    :placeholder="placeholder"
    v-model.trim="q"
    @keyup.enter="submit"
    @input="change"
    @keyup="change" />
    <div class="input-group-append">
      <button type="button" class="btn btn-outline-primary px-2" @click="submit">
        <div class="search-submit dripicons-search"></div>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    q: '',
  }),
  props: {
    placeholder: {
      type: String,
      default: 'search in image captions ...',
    },
    initial: {
      type: String,
      default: '',
    },
  },
  watch: {
    initial: {
      handler(val) {
        this.q = val;
      },
      immediate: true,
    },
  },
  methods: {
    change() {
      this.$emit('change', {
        q: this.q,
      });
    },
    submit() {
      this.$emit('submit', {
        q: this.q,
      });
    },
  },
};
</script>

<style scoped lang="css">
  .input-group > .form-control{
    border-top-width: 0;
    border-left-width: 0;
  }
</style>
