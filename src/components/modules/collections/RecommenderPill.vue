<template>
  <b-dropdown size="sm" variant="outline-primary" class="mr-1 mb-1 recommender-pill">
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
          <b-form-checkbox v-model="recommenderEnabled">
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
          <label>Weight</label>
        </b-col>
        <b-col  sm="10">
          <b-form-input
            v-model="weightInput"
            type="range"
            min="-5"
            max="5"
            step="0.1"
            class="pt-2 pb-2 pl-3 pr-3">
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
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Beatae optio enim asperiores reprehenderit adipisci nemo reiciendis, delectus eveniet soluta maiores facilis facere voluptate et sit blanditiis temporibus tempore. Rerum, placeat!
            </slot>

            <!-- reset / apply buttons -->
            <b-row class="pt-2">
              <b-col class="pl-0 pr-0">
                <b-button class="control-button" variant="outline-primary">
                  Reset to default settings
                </b-button>
              </b-col>
              <b-col class="pr-0 pl-0">
                <b-button class="control-button" variant="outline-primary">
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
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Veritatis earum, odio nulla eos non laboriosam fugit nostrum cumque nemo ipsa culpa amet similique incidunt, sequi ducimus omnis voluptatum et officiis.
          </slot>
        </b-col>
      </b-row>

      <b-row class="pt-1 pb-2">
        <b-col>
          <b-button
            class="reload-button"
            variant="outline-primary"
            :disabled="!canReload"
            @click="handleReload">
            Reload recommendations
          </b-button>
        </b-col>
      </b-row>

    </b-container>
  </b-dropdown>
</template>

<script>

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
    editedParamters: {}
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
      get() { return Math.log(this.editedWeight ?? 0) / Math.log(this.weightBase) },
      /** @param {number} value */
      set(value) {
        this.editedWeight = Math.pow(this.weightBase, value)
      }
    },
    /** @returns {boolean} */
    canReload() {
      return this.editedEnabled !== this.settings.enabled
        || this.editedWeight !== (this.settings.weight ?? 0)
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
    }
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
      border: 1px dashed #ddd;

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
      "TimeRange": "Time range",
      "NamedEntitiesBag": "Locations & Persons",
      "TopicsBag": "Topics"
    }
  }
}
</i18n>