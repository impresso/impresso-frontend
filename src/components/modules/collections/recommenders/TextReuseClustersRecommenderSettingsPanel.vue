<template>
  <div>
    <!-- entities to keep -->
    <b-row class="mb-2">
      <b-col>
        <label>{{ $t('param.numberToKeep') }}</label>
      </b-col>
      <b-col>
        <b-form-input size="sm" v-model="numberToKeep" type="number" min="1" max="100"/>
      </b-col>
    </b-row>
    <!-- remove fully mentioned -->
    <b-form-checkbox v-model="dropFullyMentioned">
      <label>{{ $t('param.dropFullyMentioned') }}</label>
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
    numberToKeep: {
      /** @returns {number} */
      get() { return this.parameters.numberToKeep ?? 10 },
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
    }
  }
}
</script>

<i18n lang="json">
{
  "en": {
    "param": {
      "numberToKeep": "Maximum number of entities to keep",
      "dropFullyMentioned": "Drop entities already fully contained in the collection, as they are not useful"
    }
  }
}
</i18n>
