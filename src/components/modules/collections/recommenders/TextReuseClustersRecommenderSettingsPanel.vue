<template>
  <div>
    <!-- entities to keep -->
    <b-row>
      <b-col>
        <label>{{ $t('param.numberToKeep') }}</label>
      </b-col>
      <b-col>
        <b-form-input v-model="numberToKeep" type="number" min="1" max="100"/>
      </b-col>
    </b-row>

    <!-- remove fully mentioned -->
    <b-row>
      <b-col>
        <label>{{ $t('param.dropFullyMentioned') }}</label>
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
      // NOTE: There is a typo in parameter name in the backend service:
      // mentionned insted of mentioned.
      /** @returns {boolean} */
      get() { return this.parameters.remove_fully_mentionned ?? true },
      /** @param {boolean} remove */
      set(remove) {
        const parameters = {
          ...this.parameters,
          remove_fully_mentionned: remove
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
      "numberToKeep": "Maximum number of entities to keep",
      "dropFullyMentioned": "Drop entities already fully contained in the collection, as they are not useful"
    }
  }
}
</i18n>
