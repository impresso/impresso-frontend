<template>
  <div>
    <spinner v-if="isLoading"/>
    <b-container v-if="!isLoading">
      <b-row v-for="entity in suggestedEntities" :key="entity.uid" class="p-2 justify-content-between">
        <b-col cols="10" class="text-align-left">
          <b-button
            variant="link"
            class="text-align-left suggest-button"
            @click="handleEntityClicked(entity)">
            {{ entity.name }}
          </b-button>
        </b-col>
        <b-col cols="2" class="text-align-right align-self-center">
          <span :class="`dripicons-${getEntityIcon(entity)}`"/>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import Spinner from '@/components/layout/Spinner'

/**
 * @typedef {import('@/models').Entity} Entity
 * @typedef {import('@/models').SuggestedEntity} SuggestedEntity
 * @typedef {(entities: Entity[]) => Promise<SuggestedEntity[]>} SuggestionsProvider
 */

export default {
  components: {
    Spinner
  },
  data: () => ({
    suggestedEntities: /** @type {Entity[]} */ ([]),
    isLoading: false
  }),
  props: {
    /** @type {import('vue').PropOptions<Entity[]>} */
    entities: {
      type: Array
    },
    /** @type {import('vue').PropOptions<SuggestionsProvider>} */
    suggestionsProvider: {
      type: Function,
      required: true
    }
  },
  methods: {
    /**
     * @param {Entity} entity
     * @returns string
     */
    getEntityIcon(entity) {
      if (entity.type === 'person') return 'user'
      if (entity.type === 'location') return 'location'
    },
    /** @param {Entity} entity */
    handleEntityClicked(entity) {
      return this.$emit('entity-selected', entity)
    }
  },
  watch: {
    entities: {
      /** @param {Entity[]} entities */
      async handler(entities) {
        try {
          this.isLoading = true
          this.suggestedEntities = await this.suggestionsProvider(entities)
        } finally {
          this.isLoading = false
        }
      },
      immediate: true
    }
  }
}
</script>

<style lang="scss">
.text-align-right {
  text-align: end;
}
.text-align-left {
  text-align: start;
}
.suggest-button {
  font-size: 0.9em;
  padding: 0px;
}
</style>