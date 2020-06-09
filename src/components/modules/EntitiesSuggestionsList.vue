<template>
  <div class="reduced">
    <spinner v-if="isLoading" class="text-center pt-2" />
    <div v-else v-for="entity in suggestedEntities" :key="entity.uid">
      <div class="">
        <div :class="`border-bottom ${entitiesToAdd.includes(entity) ?
          'bg-accent-secondary-light border-white' : ''}`">

          <div class="d-flex p-2 align-items-center">
            <div :class="`pr-2 dripicons-${getEntityIcon(entity)}`" />
            <div class="mr-auto w-100">
              <div>
                {{ entity.name }}
                <item-selector :uid="entity.uid" :item="entity" :type="entity.type"/>
              </div>
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
              v-if="!entitiesToAdd.includes(entity)"
              size="sm"
              :title="$t('actions.addToCurrentFilters')"
              variant="outline-primary"
              style="min-width: 2em"
              @click.prevent.stop="handleEntityClicked(entity)">
              +
            </b-button>
            <b-button
              v-else
              size="sm"
              :title="$t('actions.removeFromCurrentFilters')"
              variant="outline-primary"
              style="min-width: 2em"
              @click.prevent.stop="handleEntityClicked(entity)">
              -
            </b-button>
          </div>

        </div>
        <!-- <div v-if="entity !== suggestedEntities[suggestedEntities.length - 1]" class="border-bottom my-0" /> -->
      </div>
    </div>
  </div>
</template>

<script>
import Spinner from '@/components/layout/Spinner'
import ItemSelector from './ItemSelector';

/**
 * @typedef {import('@/models').Entity} Entity
 * @typedef {import('@/models').SuggestedEntity} SuggestedEntity
 * @typedef {(context: any) => Promise<SuggestedEntity[]>} SuggestionsProvider
 */

export default {
  components: {
    Spinner,
    ItemSelector
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
      type: Array,
      default: () => []
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
