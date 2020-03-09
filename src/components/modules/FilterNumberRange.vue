<template lang="html">
    <div class="row">
      <div class="col-6">
        <b-form-input v-model="startValue" :type="'number'"></b-form-input>
      </div>
      <div class="col-6">
        <b-form-input v-model="endValue" :type="'number'"></b-form-input>
      </div>
    </div>
</template>

<script>

export default {
  props: {
    start: Number,
    end: Number,
  },
  computed: {
    startValue: {
      get() { return this.start },
      set(start) {
        this.update({ start: parseInt(start, 10), end: this.end });
      },
    },
    endValue: {
      get() { return this.end },
      set(end) {
        this.update({ start: this.end, end: parseInt(end, 10) });
      },
    },
  },
  methods: {
    update({ start, end }) {
      this.$emit('changed', {
        item: { start, end },
        q:  [String(start), String(end)]
      })
    },
  }
}
</script>

<style lang="scss" scoped>
label{
  font-variant: none;
}
</style>
