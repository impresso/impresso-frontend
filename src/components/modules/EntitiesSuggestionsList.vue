<template>
  <div class="reduced">
    <!-- {{entitiesToAdd}} -->
    <spinner v-if="isLoading" class="text-center pt-2" />
    <div v-else v-for="entity in suggestedEntities" :key="entity.uid">
      <div v-if="!entitiesToAdd.includes(entity)">
        <div class="d-flex p-2 align-items-center">
          <div :class="`px-2 dripicons-${getEntityIcon(entity)}`" />
          <div class="px-2 mr-auto w-100">
            <div>{{ entity.name }}</div>
            <small>{{ $tc('items', entity.countItems)}}; {{$tc('mentions', entity.countMentions)}}</small>
            <!-- <div class="">
              <div class="viz-bars">
                <small>{{entity.countItems}} items</small>
                <div class="bg-white">
                  <div class="bg-tertiary viz-bar"
                  :title="`${entity.countItems} items`"
                  :style="`width:${entity.countItems/maxItems * 100}%;`" />
                </div>
                <small>{{entity.countMentions}} mentions</small>
                <div class="bg-white">
                  <div class="bg-medium viz-bar"
                  :title="`${entity.countMentions} $t('mentions')`"
                  :style="`width:${entity.countMentions/maxMentions * 100}%;`" />
                </div>
              </div>
            </div> -->
          </div>
          <b-button
            size="sm"
            :title="$t('actions.addToCurrentFilters')"
            variant="outline-primary"
            style="padding-right: 0.75em"
            @click.prevent.stop="handleEntityClicked(entity)">
            +
          </b-button>
        </div>
        <div v-if="entity !== suggestedEntities[suggestedEntities.length - 1]" class="border-bottom mx-2" />
      </div>
    </div>
    <div class="border-bottom border-tertiary" />
        <!-- <b-col cols="10" class="text-align-left">
        <b-badge>{{ entity.name }}</b-badge>
        <b-button
          variant="link"
          class="text-align-left suggest-button"
          @click="handleEntityClicked(entity)">
          {{ entity.name }}
        </b-button>

      </b-col>
      <b-col cols="2" class="text-align-right align-self-center">
        <span :class="`dripicons-${getEntityIcon(entity)}`"/>
      </b-col> -->
  </div>
</template>

<script>
import Spinner from '@/components/layout/Spinner'

/**
 * @typedef {import('@/models').Entity} Entity
 * @typedef {import('@/models').SuggestedEntity} SuggestedEntity
 * @typedef {(context: any) => Promise<SuggestedEntity[]>} SuggestionsProvider
 */

export default {
  components: {
    Spinner
  },
  data: () => ({
    suggestedEntities: /** @type {Entity[]} */ ([]),
    isLoading: false,
    selectedEntities: [],
  }),
  props: {
    /** @type {import('vue').PropOptions<any>} */
    context: {},
    /** @type {import('vue').PropOptions<SuggestionsProvider>} */
    suggestionsProvider: {
      type: Function,
      required: true,
    },
    entitiesToAdd: {
      type: Array(),
      default: [],
    },
  },
  computed: {
    maxItems() {
      return this.suggestedEntities.reduce((max, e) => e.countItems > max ? e.countItems : max, this.suggestedEntities[0].countItems);
    },
    maxMentions() {
      return this.suggestedEntities.reduce((max, e) => e.countMentions > max ? e.countMentions : max, this.suggestedEntities[0].countMentions);
    },
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
    context: {
      /** @param {any} context */
      async handler(context) {
        try {
          this.isLoading = true
          this.suggestedEntities = await this.suggestionsProvider(context)
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