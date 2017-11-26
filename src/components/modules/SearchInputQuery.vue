<template lang="html">
  <div class="wrapper">
    <b-input-group>
      <b-form-input @keyup.enter.native="search" v-model="query_model" type="text" :placeholder="$t('search.query_placeholder')"></b-form-input>
      <b-input-group-button slot="right">
        <b-btn variant="danger" @click="clear">x</b-btn>
        <b-btn variant="dark">+</b-btn>
        <b-btn @click="search" variant="info">{{$t("search.query_button")}}</b-btn>
      </b-input-group-button>
    </b-input-group>
    <div class="results" v-show="results.length > 0">
      <b-media v-for="result in results" v-bind:key="result.id" class="result">
        <p><strong>Search Result Title</strong><br>Some text</p>
      </b-media>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    results: [],
  }),
  props: {
    query: {
      type: String,
      default: '',
    },
    api: {
      type: String,
      required: true,
    },
    text_placeholder: {
      type: String,
      default: 'Search query',
    },
    text_button: {
      type: String,
      default: 'Go',
    },
  },
  computed: {
    query_model: {
      get() {
        return this.query;
      },
      set(value) {
        this.$emit('changeSearchQuery', value);
      },
    },
  },
  methods: {
    search() {
      this.$emit('search', this.query_model);
    },
    clear() {
      this.$emit('clear');
    },
  },
};
</script>

<style scoped lang="less">
.wrapper {
    position: relative;
    margin: 15px 0;
    .results {
        z-index: 1;
        position: absolute;
        top: 45px;
        width: 100%;
        border: 1px solid black;
        background: white;
        box-shadow: 4px 4px 0 rgba(0,0,0,0.4);
        .result {
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
