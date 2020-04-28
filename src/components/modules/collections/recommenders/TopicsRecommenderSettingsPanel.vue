<template>
  <div>
    <!-- entities to keep -->
    <b-row>
      <b-col>
        <label>Maximum number of entities to keep</label>
      </b-col>
      <b-col>
        <b-form-input v-model="numberToKeep" type="number" min="1" max="100"/>
      </b-col>
    </b-row>

    <!-- scaling factor -->
    <b-row>
      <b-col>
        <label>Scaling the distribution for the query</label>
      </b-col>
      <b-col>
        <b-form-input v-model="scalingFactor" type="number" min="1" max="20"/>
      </b-col>
    </b-row>

    <!-- normalize max score -->
    <b-row>
      <b-col>
        <label>Normalize so the score of the top entity is 1.0</label>
      </b-col>
      <b-col>
        <b-form-checkbox v-model="normalizeMaxScore" />
      </b-col>
    </b-row>

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
