<template>
  <section class="mx-3">
    Between
    <div class="d-flex align-items-center">
      <!-- add two inputs to change range usong b form input-->
      <b-form-input v-model="rangeStart" type="number" placeholder="Min" size="sm" class="px-2 py-0 rounded">
      </b-form-input>
      <div data-v-6546ca54="" class="mx-2 text-small">and</div>
      <b-form-input v-model="rangeEnd" type="number" placeholder="Max" size="sm" class="px-2 py-0 rounded" />
    </div>
    <div v-if="!pristine" class="m-3 text-center">
      <b-button size="sm" variant="outline-secondary" class="px-5 btn btn-sm btn-outline" @click="applyFilter">
        {{ $t('actions.previewFilter') }}
      </b-button>
    </div>
  </section>
</template>
<script>
export default {
  name: 'SelectionMonitorFilter',
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
