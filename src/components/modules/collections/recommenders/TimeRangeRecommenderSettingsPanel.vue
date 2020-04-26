<template>
  <b-row>
    <b-col>
      <label>margin (Enlarge the detected time range by a number of years on both sides)</label>
      <b-form-input type="number" v-model="margin"></b-form-input>
    </b-col>
  </b-row>
</template>

<script>

const ChangedEvent = 'changed'

export default {
  model: {
    prop: 'parameters',
    event: ChangedEvent
  },
  props: {
    parameters: {
      type: Object,
      required: true
    }
  },
  computed: {
    margin: {
      /** @return {number} */
      get() { return this.parameters.margin ?? 0 },
      /** @param {string} margin */
      set(margin) {
        const parameters = {
          ...this.parameters,
          margin: parseInt(margin, 10)
        }
        this.$emit(ChangedEvent, parameters)
      }
    }
  }
}
</script>
