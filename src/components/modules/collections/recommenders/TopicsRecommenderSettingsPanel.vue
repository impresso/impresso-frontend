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
    /** @return {string} */
    id() { return this['_uid']; },
    numberToKeep: {
      /** @returns {number} */
      get() { return this.parameters.nb_to_keep ?? 5 },
      /** @param {number} toKeep */
      set(toKeep) {
        const parameters = {
          ...this.parameters,
          nb_to_keep: toKeep
        }
        this.$emit(ChangedEvent, parameters)
      }
    },
    scalingFactor: {
      /** @returns {number} */
      get() { return this.parameters.scaling_factor ?? 3 },
      /** @param {number} factor */
      set(factor) {
        const parameters = {
          ...this.parameters,
          scaling_factor: factor
        }
        this.$emit(ChangedEvent, parameters)
      }
    },
    normalizeMaxScore: {
      /** @returns {boolean} */
      get() { return this.parameters.normalize_max_score ?? true },
      /** @param {boolean} normalize */
      set(normalize) {
        const parameters = {
          ...this.parameters,
          normalize_max_score: normalize
        }
        this.$emit(ChangedEvent, parameters)
      }
    }
  }
}
</script>

<i18n>
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
