<template>
  <section>
    <div class="d-flex mx-3">
      <!-- add two inputs to change range usong b form input-->
      <b-form-input v-model="rangeStart" type="number" placeholder="Min" size="sm" class="mr-2">
      </b-form-input>
      <b-form-input v-model="rangeEnd" type="number" placeholder="Max" size="sm" class="mr-2" />
    </div>
    <div class="mx-3">
      <b-button
        size="sm"
        variant="outline-secondary"
        class="btn btn-sm btn-outline"
        v-if="!pristine"
        @click="applyFilter"
      >
        {{ $t('actions.applyFilter') }}
      </b-button>
    </div>
  </section>
</template>
<script>
export default {
  name: 'SelectionMonitorFilter',
  data: {},
  props: {
    filter: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      rangeStart: 0,
      rangeEnd: 0,
    }
  },
  computed: {
    pristine() {
      return this.rangeStart === this.filter.q[0] && this.rangeEnd === this.filter.q[1]
    },
    range() {
      return [this.rangeStart, this.rangeEnd]
    },
  },
  watch: {
    filter: {
      handler() {
        this.rangeStart = this.filter.q[0]
        this.rangeEnd = this.filter.q[1]
      },
      immediate: true,
    },
  },
  methods: {
    applyFilter() {
      this.$emit('changeFilter', { ...this.filter, q: this.range.map(d => String(d)) })
    },
  },
}
</script>
