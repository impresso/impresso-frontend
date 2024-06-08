<template>
  <div>
    <!-- n of topics to keep -->
    <b-row>
      <b-col>
        <label :for="`input-numberToKeep-${id}`">{{ $t('param.numberToKeep') }}</label>
      </b-col>
      <b-col>
        <b-form-input
          :id="`input-numberToKeep-${id}`"
          size="sm" v-model="numberToKeep"
          type="number" min="1" max="100"/>
      </b-col>
    </b-row>
    <!-- scaling factor -->
    <b-row class="my-2">
      <b-col>
        <label :for="`input-scalingFactor-${id}`">{{ $t('param.scalingFactor') }}</label>
      </b-col>
      <b-col>
        <b-form-input
          :id="`input-scalingFactor-${id}`"
          size="sm" v-model="scalingFactor"
          type="number" min="1" max="20"/>
      </b-col>
    </b-row>
    <!-- normalize max score -->
    <b-form-checkbox v-model="normalizeMaxScore">
      <label>{{ $t('param.normalizeMaxScore') }}</label>
    </b-form-checkbox>
  </div>
</template>

<script>

const ChangedEvent = 'update:modelValue'

export default {
  props: {
    modelValue: {
      type: Object,
      required: true
    }
  },
  emits: ['update:modelValue'],
  computed: {
    parameters() { return this.modelValue },
    /** @return {string} */
    id() { return this['_uid']; },
    numberToKeep: {
      /** @returns {number} */
      get() { return this.parameters.numberToKeep ?? 5 },
      /** @param {number} numberToKeep */
      set(numberToKeep) {
        const parameters = {
          ...this.parameters,
          numberToKeep
        }
        this.$emit(ChangedEvent, parameters)
      }
    },
    scalingFactor: {
      /** @returns {number} */
      get() { return this.parameters.scalingFactor ?? 3 },
      /** @param {number} scalingFactor */
      set(scalingFactor) {
        const parameters = {
          ...this.parameters,
          scalingFactor
        }
        this.$emit(ChangedEvent, parameters)
      }
    },
    normalizeMaxScore: {
      /** @returns {boolean} */
      get() { return this.parameters.normalizeMaxScore ?? true },
      /** @param {boolean} normalizeMaxScore */
      set(normalizeMaxScore) {
        const parameters = {
          ...this.parameters,
          normalizeMaxScore
        }
        this.$emit(ChangedEvent, parameters)
      }
    }
  }
}
</script>

<i18n lang="json">
{
  "en": {
    "param": {
      "numberToKeep": "Maximum number of topics to keep",
      "scalingFactor": "Scaling the distribution for the query",
      "normalizeMaxScore": "Normalize so the score of the top topic is 1.0"
    }
  }
}
</i18n>
