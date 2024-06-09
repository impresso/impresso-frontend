<template>
  <div class="row">
    <div class="col-6">
      <b-form-input v-model="startDate" @input.native="validateStart" :aria-invalid="!startIsValid" :state="startIsValid ? null : false"></b-form-input>
      <label>{{ $d(start, 'longUtc') }} </label>
    </div>
    <div class="col-6">
      <b-form-input v-model="endDate"  @input.native="validateEnd" :aria-invalid="!endIsValid"  :state="endIsValid ? null : false"></b-form-input>
      <label>{{ $d(end, 'longUtc') }}</label>
    </div>
  </div>
</template>

<script>
import Daterange from '@/models/Daterange';

const DateRegex = /^\d{4}-[0-1]\d-[0-3]\d$/;

const dateStringIsValid = date => DateRegex.test(date)

const dateIsValid = date => date instanceof Date && !isNaN(/** @type {any} */ (date))

export default {
  data: () => ({
    startIsValid: true,
    endIsValid: true
  }),
  props: {
    /** @type {import('vue').PropOptions<Date>} */
    start: { type: Date, required: true },
    /** @type {import('vue').PropOptions<Date>} */
    end: { type: Date, required: true }
  },
  /**
   * Both dates should be displayed in UTC.
   */
  computed: {
    startDate: {
      /** @returns {string} */
      get() {
        return this.start.toISOString().split('T')[0]
      },
      /** @param {string} value */
      set(value) {
        const start = new Date(`${value}T00:00:00Z`)
        if (dateIsValid(start)) this.updateDaterange({ start, end: this.end })
      },
    },
    endDate: {
      /** @returns {string} */
      get() {
        return this.end.toISOString().split('T')[0]
      },
      /** @param {string} value */
      set(value) {
        const end = new Date(`${value}T23:59:59Z`)
        if (dateIsValid(end)) this.updateDaterange({ start: this.start, end })
      }
    }
  },
  methods: {
    /** @param {{ start: Date, end: Date }} param */
    updateDaterange({ start, end }) {
      this.$emit('changed', {
        item: { start, end },
        q:  new Daterange({ start, end }).getValue()
      })
    },
    /** @param {string} value */
    validateStart(value) {
      this.startIsValid = dateStringIsValid(value)
    },
    /** @param {string} value */
    validateEnd(value) {
      this.endIsValid = dateStringIsValid(value)
    }
  }
}
</script>

<style lang="scss" scoped>
label{
  font-variant: none;
}
</style>
