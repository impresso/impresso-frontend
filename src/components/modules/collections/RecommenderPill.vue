<template>
  <b-dropdown ref="dropdown" size="sm" variant="outline-primary" class="mr-1 mb-1 recommender-pill">
    <template v-slot:button-content>
      <span class="button-icon dripicons-checkmark"/>
      <span class="label sp-string sp-title" :class="{ 'crossed-out': !settings.enabled }">
        {{ $t(`pillLabels.${settings.type}`)}}
      </span>
    </template>
    <b-container class="content">
      <!-- toggles bar -->
      <b-row class="border-bottom">
        <b-col class="border-right pt-2 pb-2">
          <b-form-checkbox v-model="recommenderEnabled" @change="handleControlChanged">
            Enable this recommender
          </b-form-checkbox>
        </b-col>
        <b-col class="pt-2 pb-2">
          <!-- placeholder -->
        </b-col>
      </b-row>

      <!-- weight -->
      <b-row class="pt-2 pb-2">
        <b-col sm="2">
          <label>Weight ({{ weightInput }})</label>
        </b-col>
        <b-col  sm="10">
          <b-form-input
            v-model="weightInput"
            type="range"
            min="-5"
            max="5"
            step="0.1"
            class="pt-2 pb-2 pl-3 pr-3"
            :disabled="!recommenderEnabled"
            @change="handleControlChanged">
          </b-form-input>
        </b-col>
      </b-row>

      <b-row class="pt-2 pb-2">
        <b-col class="ml-3 mr-3 advanced-features">

          <!-- toggle panel button -->
          <b-row class="pb-2">
            <b-button
              variant="outline-primary"
              class="toggle-panel-button"
              v-b-toggle="`settings-collapse-${componentId}`">
              Advanced settings
            </b-button>
          </b-row>

          <b-collapse :id="`settings-collapse-${componentId}`">
            <slot name="advanced-features">
              <!-- advanced features -->
              <component :is="currentSettingsComponent" v-model="parameters"/>
            </slot>

            <!-- reset / apply buttons -->
            <b-row class="pt-2">
              <b-col class="pl-0 pr-0">
                <b-button
                  class="control-button"
                  variant="outline-primary"
                  :disabled="loadingRecommendations || settingsAreDefault"
                  @click="handleResetParameters">
                  Reset to default settings
                </b-button>
              </b-col>
              <b-col class="pr-0 pl-0">
                <b-button
                  class="control-button"
                  variant="outline-primary"
                  :disabled="!parametersChanged || loadingRecommendations"
                  @click="handleApplyParamatersChanges">
                  Apply changes
                </b-button>
              </b-col>
            </b-row>
          </b-collapse>

        </b-col>
      </b-row>

      <b-row class="pt-1 pb-1 border-top">
        <b-col class="ml-3 mr-3 p-2 recommendations">
          <slot name="recommendations">
            <!-- recommendations -->
            <component
              :is="currentResultsComponent"
              :recommendations="recommendations"
              v-if="!loadingRecommendations"/>
            <spinner v-if="loadingRecommendations"/>
          </slot>
        </b-col>
      </b-row>

      <!-- <b-row class="pt-1 pb-2">
        <b-col>
          <b-button
            class="reload-button"
            variant="outline-primary"
            :disabled="!canReload || loadingRecommendations"
            @click="handleReload">
            Reload recommendations
          </b-button>
        </b-col>
      </b-row> -->

    </b-container>
  </b-dropdown>
</template>

<script>
import TimeRangeSettings from './recommenders/TimeRangeRecommenderSettingsPanel'
import NamedEntitiesSettings from './recommenders/NamedEntitiesRecommenderSettingsPanel'
import TopicsSettings from './recommenders/TopicsRecommenderSettingsPanel'
import TextReuseClustersSettings from './recommenders/TextReuseClustersRecommenderSettingsPanel'

import TimeRangeResults from './recommendations/TimeRangeRecommendationsPanel'
import NamedEntitiesResults from './recommendations/NamedEntitiesRecommendationsPanel'
import TopicsResults from './recommendations/TopicsRecommendationsPanel'
import TextReuseClustersResults from './recommendations/TextReuseClustersRecommendationsPanel'

import Spinner from '@/components/layout/Spinner'

/**
 * @typedef {{ enabled: boolean, type: string, weight?: number, parameters: any }} RecommenderSettings
 */

const Events = Object.freeze({
  RecommenderParametersChanged: 'changed',
  SearchParametersChanged: 'search-parameters-changed'
})

export default {
  data: () => ({
    editedWeight: 0,
    editedEnabled: true,
    editedParameters: {}
  }),
  props: {
    /** @type {import('vue').PropOptions<RecommenderSettings>} */
    settings: {
      type: Object,
      required: true
    },
    weightBase: {
      type: Number,
      default: 1.5
    },
    recommendations: {
      type: Object,
      default: () => ({})
    },
    loadingRecommendations: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    /** @returns {string} */
    componentId() { return /** @type {string} */ (`${this['_uid']}`) },
    recommenderEnabled: {
      /** @returns {boolean} */
      get() { return this.editedEnabled },
      /** @param {boolean} enabled */
      set(enabled) {
        this.editedEnabled = enabled
      }
    },
    weightInput: {
      /** @returns {number} */
      get() {
        const value = Math.log(this.editedWeight ?? 0) / Math.log(this.weightBase)
        return isFinite(value) ? value : 0
      },
      /** @param {number} value */
      set(value) {
        this.editedWeight = Math.pow(this.weightBase, value)
      }
    },
    parameters: {
      /** @returns {object} */
      get() { return this.editedParameters },
      /** @param {object} value */
      set(value) {
        this.editedParameters = value;
      }
    },
    /** @returns {boolean} */
    parametersChanged() {
      return JSON.stringify(this.editedParameters) !== JSON.stringify(this.settings.parameters)
    },
    /** @returns {boolean} */
    canReload() {
      return this.editedEnabled !== this.settings.enabled
        || this.editedWeight !== (this.settings.weight ?? 0)
    },
    /** @returns {string} */
    currentSettingsComponent() {
      return {
        timeRange: 'time-range-settings',
        entities: 'named-entities-settings',
        topics: 'topics-settings',
        textReuseClusters: 'text-reuse-clusters-settings'
      }[this.settings.type]
    },
    /** @returns {string} */
    currentResultsComponent() {
      return {
        timeRange: 'time-range-results',
        entities: 'named-entities-results',
        topics: 'topics-results',
        textReuseClusters: 'text-reuse-clusters-results'
      }[this.settings.type]
    },
    /** @returns {boolean} */
    settingsAreDefault() {
      return Object.keys(this.editedParameters).length === 0
    }
  },
  methods: {
    handleReload() {
      const settings = {
        ...this.settings,
        enabled: this.editedEnabled,
        weight: this.editedWeight
      }
      this.$emit(Events.SearchParametersChanged, settings)
      // this.$refs.dropdown.hide(true)
    },
    handleApplyParamatersChanges() {
      const settings = {
        ...this.settings,
        enabled: this.editedEnabled,
        weight: this.editedWeight,
        parameters: this.editedParameters
      }
      this.$emit(Events.RecommenderParametersChanged, settings)
      // this.$refs.dropdown.hide(true)
    },
    handleResetParameters() {
      this.editedParameters = {}
      this.handleApplyParamatersChanges()
    },
    handleControlChanged() {
      this.$nextTick(() => this.handleReload())
    }
  },
  watch: {
    'settings.weight': {
      handler() {
        this.editedWeight = this.settings.weight ?? 0
      },
      immediate: true
    },
    'settings.enabled': {
      handler() {
        this.editedEnabled = this.settings.enabled
      },
      immediate: true
    },
    'settings.parameters': {
      handler() {
        this.editedParameters = JSON.parse(JSON.stringify(this.settings.parameters))
      },
      immediate: true,
      deep: true
    }
  },
  components: {
    Spinner,

    TimeRangeSettings,
    NamedEntitiesSettings,
    TopicsSettings,
    TextReuseClustersSettings,

    TimeRangeResults,
    NamedEntitiesResults,
    TopicsResults,
    TextReuseClustersResults
  }
}
</script>

<style lang="scss">
  .recommender-pill {
    .button-icon {
      vertical-align: sub;
    }
    .crossed-out {
      text-decoration: line-through;
    }

    .content {
      min-width: 500px;
    }

    .advanced-features {

      .toggle-panel-button {
        width: 100%;
      }

      .control-button {
        width: 100%;
      }
    }

    .recommendations {
      font-size: 0.8em;
    }

    .reload-button {
      width: 100%;
    }
  }
</style>

<i18n>
{
  "en": {
    "pillLabels": {
      "timeRange": "Time range",
      "entities": "Locations & Persons",
      "topics": "Topics",
      "textReuseClusters": "Text reuse"
    }
  }
}
</i18n>