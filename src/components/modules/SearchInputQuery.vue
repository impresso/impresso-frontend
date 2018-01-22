<template lang="html">
  <div class="wrapper">
    <b-input-group>
      <b-form-input v-on:keyup.native="keyup" v-model="query_model" type="text" :placeholder="$t('search.query_placeholder')"></b-form-input>
      <b-input-group-button slot="right">
        <b-btn variant="danger" v-on:click="clear">x</b-btn>
        <b-btn v-on:click="search" variant="info">{{$t("search.query_button")}}</b-btn>
      </b-input-group-button>
    </b-input-group>
    <div v-click-outside="hideResults" class="results" v-show="(results.length > 0 || query_model) && showResults">
      <b-media v-for="result in results" v-bind:key="result.id" class="result" v-on:click="clickResult(result)">
        <strong>
          <icon v-if="result.label === 'string'" name="font"></icon>
          <icon v-if="result.label === 'person'" name="user-circle"></icon>
          <icon v-if="result.label === 'location'" name="map-marker"></icon>
          {{result.title}}
        </strong>
      </b-media>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import VueI18n from 'vue-i18n';
import ClickOutside from 'vue-click-outside';
import Icon from 'vue-awesome/components/Icon';

import 'vue-awesome/icons/user-circle';
import 'vue-awesome/icons/map-marker';
import 'vue-awesome/icons/font';

Vue.use(BootstrapVue);
Vue.use(VueI18n);

export default {
  data: () => ({
    showResults: false,
  }),
  props: {
    query: {
      type: String,
      default: '',
    },
    text_placeholder: {
      type: String,
      default: 'Search query',
    },
    text_button: {
      type: String,
      default: 'Go',
    },
    results: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  computed: {
    query_model: {
      get() {
        return this.query;
      },
      set(value) {
        this.showResults = true;
        this.$emit('changeSearchQuery', value);
      },
    },
  },
  methods: {
    keyup(event) {
      switch (event.key) {
        case 'Escape':
          this.hideResults();
          break;
        case 'Enter':
          this.hideResults();
          this.search();
          break;
        default:
          break;
      }
    },
    hideResults() {
      this.showResults = false;
    },
    search() {
      this.$emit('search');
    },
    clear() {
      this.$emit('clear');
    },
    clickResult(result) {
      this.$emit('clickResult', result);
    },
  },
  directives: {
    ClickOutside,
  },
  components: {
    Icon,
  },
};
</script>

<style scoped lang="less">
.wrapper {
    position: relative;
    margin: 15px 0;
    .results {
        z-index: 10;
        position: absolute;
        top: 45px;
        width: 100%;
        border: 1px solid black;
        background: white;
        box-shadow: 4px 4px 0 rgba(0,0,0,0.4);
        .result {
            padding: 0;
            margin: 0;
            .fa-icon {
                margin-right: 10px;
                width: 16px;
                margin-bottom: -2px;
            }
            padding: 7px 15px;
            border-bottom: 1px solid black;
            transition: all 500ms;
            &:hover {
                background: #f4f5f6;
                display: block;
                cursor: pointer;
            }
        }
    }
}
</style>

<i18n>
{
  "en": {
    "search": {
      "query_button": "Go!",
      "query_placeholder": "Search"
    }
  },
  "fr": {
    "search": {
      "query_button": "Allez!",
      "query_placeholder": "Recherche"
    }
  },
  "nl": {
    "search": {
      "query_button": "Ga!",
      "query_placeholder": "Zoek"
    }
  }
}
</i18n>
