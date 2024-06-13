<template>
  <b-dropdown
    ref="dropdown"
    size="sm"
    :variant="settings.enabled ? 'primary' : 'outline-secondary'"
    class="ml-2 recommender-pill"
    @shown="resetEditedParameters">
    <template v-slot:button-content>
      <span class="label sp-string sp-title" :class="{ 'crossed-out': !settings.enabled }">
        {{ $t(`pillLabels.${settings.type}`)}}
      </span>
    </template>

    <div class="content">
      <!-- toggles bar -->
      <div class="p-2 d-flex">
        <b-form-checkbox v-model="recommenderEnabled"  @update:modelValue="handleControlChanged" switch>
          {{ $t('enableRecommender') }}
        </b-form-checkbox>
        <b-form-checkbox class="ml-auto" v-model="isAdvancedPanelOpen" switch>
          {{ $t('label.advancedSettings') }}
        </b-form-checkbox>
      </div>

      <!-- advanced mode -->
      <div class="advanced-features border-bottom">
        <div class="collapsable-container" :class="{ show: isAdvancedPanelOpen }">
          <slot name="advanced-features" >
            <!-- advanced features -->
            <component class="px-3 pt-3 border-top" :is="currentSettingsComponent" v-model="parameters"/>
          </slot>

          <!-- reset / apply buttons -->
          <div class="p-2">
            <b-row no-gutters>
              <b-col class="text-right pr-1">
                <b-button size="sm" block
                  class="control-button"
                  variant="outline-primary"
                  :disabled="loadingRecommendations || settingsAreDefault"
                  @click="handleResetParameters">
                  {{ $t('label.resetToDefault') }}
                </b-button>
              </b-col>
              <b-col>
                <b-button size="sm"
                  block
                  class="control-button"
                  variant="outline-primary"
                  :disabled="!parametersChanged || loadingRecommendations"
                  @click="handleApplyParamatersChanges">
                  {{ $t('label.applyChanges') }}
                </b-button>
              </b-col>
            </b-row>
          </div>
        </div>
      </div>
      <!-- weight -->
      <div class="border-bottom p-2 d-flex">
        <label class="flex-shrink-1">
          {{ $t('weightLabel') }}<br/>
          <b>{{ weightInput > 0 ? '+' : '' }}{{ $n(weightInput, { maximumFractionDigits: '2' }) }}</b>
        </label>
        <b-form-input
          v-model="weightInput"
          type="range"
          min="-5"
          max="5"
          step="0.1"
          class="pt-2 pb-2 pl-3 pr-3"
          :disabled="!recommenderEnabled"
          @update:modelValue="handleControlChanged">
        </b-form-input>
      </div>

      <!-- advanced panel -->
      <b-container>

      <b-row class="pt-1 pb-1">
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
    </div>
  </b-dropdown>
</template>

<script>
import TimeRangeSettings from './recommenders/TimeRangeRecommenderSettingsPanel.vue'
import NamedEntitiesSettings from './recommenders/NamedEntitiesRecommenderSettingsPanel.vue'
import TopicsSettings from './recommenders/TopicsRecommenderSettingsPanel.vue'
import TextReuseClustersSettings from './recommenders/TextReuseClustersRecommenderSettingsPanel.vue'

import TimeRangeResults from './recommendations/TimeRangeRecommendationsPanel.vue'
import NamedEntitiesResults from './recommendations/NamedEntitiesRecommendationsPanel.vue'
import TopicsResults from './recommendations/TopicsRecommendationsPanel.vue'
import TextReuseClustersResults from './recommendations/TextReuseClustersRecommendationsPanel.vue'

import Spinner from '@/components/layout/Spinner.vue'

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
    isAdvancedPanelOpen: false,
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
    },
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
    },
    resetEditedParameters() {
      this.editedParameters = JSON.parse(JSON.stringify(this.settings.parameters))
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
        this.resetEditedParameters()
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
      background-color: #f1f2f4;
      label{
        font-variant: normal;
      }
      .toggle-panel-button {
        width: 100%;
      }

      .control-button {
        width: 100%;
      }

      .collapsable-container {
        overflow: hidden;
        max-height: 0;
        transition: max-height 0.3s ease-in-out;

        &.show {
          max-height: 1000px;
          transition: max-height 0.3 ease-in-out;
        }
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

<i18n lang="json">
{
  "en": {
    "pillLabels": {
      "timeRange": "Time range",
      "entities": "Locations & Persons",
      "topics": "Topics",
      "textReuseClusters": "Text reuse"
    },
    "enableRecommender": "Enable this recommender",
    "weightLabel": "Weight",
    "label": {
      "advancedSettings": "Advanced settings",
      "resetToDefault": "Reset to default settings",
      "applyChanges": "Apply changes"
    }
  }
}
</i18n>
