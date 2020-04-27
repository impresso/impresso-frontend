<template>
  <div>
    <!-- count method -->
    <b-row>
      <b-col>
        <label>Count method</label>
      </b-col>
      <b-col>
        <b-form-select
          v-model="countType"
          :options="countTypes">
        </b-form-select>
      </b-col>
    </b-row>

    <!-- occurences -->
    <b-row>
      <b-col>
        <label>Minimum number of occurences</label>
      </b-col>
      <b-col>
        <b-form-input v-model="minOccurences" type="number" min="1" max="100"/>
      </b-col>
    </b-row>

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
    countType: {
      /** @return {string} */
      get() { return this.parameters.count_type ?? 'article' },
      /** @param {string} countType */
      set(countType) {
        const parameters = {
          ...this.parameters,
          count_type: countType
        }
        this.$emit(ChangedEvent, parameters)
      }
    },
    countTypes() {
      return [
        { value: 'article', text: 'Number of articles' },
        { value: 'mention', text: 'Number of mentions' }
      ]
    },
    minOccurences: {
      /** @returns {number} */
      get() { return this.parameters.min_occurences ?? 1 },
      /** @param {number} minOccurences */
      set(minOccurences) {
        const parameters = {
          ...this.parameters,
          min_occurences: minOccurences
        }
        this.$emit(ChangedEvent, parameters)
      }
    },
    numberToKeep: {
      /** @returns {number} */
      get() { return this.parameters.nb_to_keep ?? 12 },
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
