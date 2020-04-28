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

    <!-- remove fully mentioned -->
    <b-row>
      <b-col>
        <label>Drop entities already fully contained in the collection, as they are not useful</label>
      </b-col>
      <b-col>
        <b-form-checkbox v-model="dropFullyMentioned" />
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
      get() { return this.parameters.nb_to_keep ?? 10 },
      /** @param {number} toKeep */
      set(toKeep) {
        const parameters = {
          ...this.parameters,
          nb_to_keep: toKeep
        }
        this.$emit(ChangedEvent, parameters)
      }
    },
    dropFullyMentioned: {
      /** @returns {boolean} */
      get() { return this.parameters.remove_fully_mentioned ?? true },
      /** @param {boolean} remove */
      set(remove) {
        const parameters = {
          ...this.parameters,
          remove_fully_mentioned: remove
        }
        this.$emit(ChangedEvent, parameters)
      }
    }
  }
}
</script>
