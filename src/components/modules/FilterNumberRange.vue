<template>
  <div class="FilterNumberRange d-flex align-items-center">
    <b-form-input v-model="startValue" type="number" class="px-2 py-0 rounded"></b-form-input>
    <div class="mx-2 text-small">and</div>
    <b-form-input v-model="endValue" type="number" class="px-2 py-0 rounded"></b-form-input>
  </div>
</template>

<script>
export default {
  name: 'FilterNumberRange',
  data: () => ({
    startValue: 0,
    endValue: 0,
  }),
  props: {
    start: Number,
    end: Number,
  },
  mounted() {
    this.startValue = +this.start
    this.endValue = +this.end
  },
  computed: {
    range() {
      return [String(this.startValue), String(this.endValue)]
    },
  },
  watch: {
    range: {
      handler() {
        this.$emit('changed', {
          item: { start: this.startValue, end: this.endValue },
          q: this.range,
        })
        // this.update({ start: this.startValue, end: this.endValue })
        console.debug('FilterNumberRange: range changed', this.range)
      },
    },
  },
}
</script>

<style lang="scss" scoped>
label {
  font-variant: none;
}
</style>
