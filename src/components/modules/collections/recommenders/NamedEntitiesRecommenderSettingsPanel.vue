<template>
  <div>
    <!-- count method -->
    <b-row>
      <b-col>
        <label>{{ $t('param.countType') }}</label>
      </b-col>
      <b-col>
        <b-form-select size="sm"
          v-model="countType"
          :options="countTypes">
        </b-form-select>
      </b-col>
    </b-row>
    <!-- occurrences -->
    <b-row class="mt-2">
      <b-col>
        <label>{{ $t('param.minOccurrences') }}</label>
      </b-col>
      <b-col>
        <b-form-input size="sm"
          v-model="minOccurrences"
          type="number" min="1" max="100"/>
      </b-col>
    </b-row>
    <!-- entities to keep -->
    <b-row class="my-2">
      <b-col>
        <label>{{ $t('param.numberToKeep') }}</label>
      </b-col>
      <b-col>
        <b-form-input size="sm"
          v-model="numberToKeep"
          type="number" min="1" max="100"/>
      </b-col>
    </b-row>
    <!-- remove fully mentioned -->
    <b-form-checkbox v-model="dropFullyMentioned">
      <label>{{ $t('param.dropFullyMentioned') }}</label>
    </b-form-checkbox>
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
    countType: {
      /** @return {string} */
      get() { return this.parameters.countType ?? 'article' },
      /** @param {string} countType */
      set(countType) {
        const parameters = {
          ...this.parameters,
          countType
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
    minOccurrences: {
      /** @returns {number} */
      get() { return this.parameters.minOccurrences ?? 1 },
      /** @param {number} minOccurrences */
      set(minOccurrences) {
        const parameters = {
          ...this.parameters,
          minOccurrences
        }
        this.$emit(ChangedEvent, parameters)
      }
    },
    numberToKeep: {
      /** @returns {number} */
      get() { return this.parameters.numberToKeep ?? 12 },
      /** @param {number} numberToKeep */
      set(numberToKeep) {
        const parameters = {
          ...this.parameters,
          numberToKeep
        }
        this.$emit(ChangedEvent, parameters)
      }
    },
    dropFullyMentioned: {
      /** @returns {boolean} */
      get() { return this.parameters.removeFullyMentioned ?? true },
      /** @param {boolean} removeFullyMentioned */
      set(removeFullyMentioned) {
        const parameters = {
          ...this.parameters,
          removeFullyMentioned
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
      "countType": "Count method",
      "minOccurrences": "Minimum number of occurrences",
      "numberToKeep": "Maximum number of entities to keep",
      "dropFullyMentioned": "Drop entities already fully contained in the collection, as they are not useful",
      "normalizeMaxScore": "Normalize so the score of the top entity is 1.0"
    }
  }
}
</i18n>
