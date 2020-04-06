<template lang="html">
    <div class="row">
      <div class="col-6">
        <b-form-input v-model="startDate" ></b-form-input>
        <label>{{ $d(start, 'long') }} </label>
      </div>
      <div class="col-6">
        <b-form-input v-model="endDate"></b-form-input>
        <label>{{ $d(end, 'long') }}</label>
      </div>
    </div>
</template>

<script>
import Daterange from '@/models/Daterange';

const DateRegex = /^\d{4}-[0-1]\d-[0-3]\d$/;

const parseDate = date => {
  if (DateRegex.test(date)) return new Date(date)
}

export default {
  props: {
    start: Date,
    end: Date,
  },
  computed: {
    startDate: {
      get() {
        return this.start.toISOString().split('T').shift();
      },
      set(value) {
        const start = parseDate(value);
        if (start instanceof Date && !isNaN(start)) {
          this.updateDaterange({ start, end: this.end });
        }
      },
    },
    endDate: {
      get() {
        return this.end.toISOString().split('T').shift();
      },
      set(value) {
        const end = parseDate(value);
        if (end instanceof Date && !isNaN(end)) {
          this.updateDaterange({ start: this.start, end });
        }
      },
    },
  },
  methods: {
    updateDaterange({ start, end }) {
      this.$emit('changed', {
        item: { start, end },
        q:  new Daterange({ start, end }).getValue()
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
