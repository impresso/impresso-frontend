<template lang="html">
  <div class="border pt-3 px-2 bg-light">
    <b-form-group>
      <form v-on:submit.prevent="embeddingsOnSubmit()">
        <b-row>
          <b-col cols="12" class="input-group">
            <b-form-input
              type="text"
              size="sm"
              class="form-control w-25"
              ref="inputE"
              :value="lastWord(filter)"
              name="inputEmbeddings" />
                <b-form-select name="languageEmbeddings"
                  v-model="languageEmbeddings"
                  :options="languageEmbeddingsOptions"
                  v-on:change="embeddingsOnSubmit()"
                  size="sm" variant="outline-primary" />
                <b-form-select name="limitEmbeddings"
                  v-model="limitEmbeddings"
                  :options="limitEmbeddingsOptions"
                  v-on:change="embeddingsOnSubmit()"
                  size="sm" variant="outline-primary" />
                <div class="input-group-append">
                  <b-button
                    size="sm" variant="outline-primary"
                    v-on:click.prevent="embeddingsOnSubmit()">GO!
                  </b-button>
              </div>
          </b-col>
        </b-row>
        <b-row>
          <b-col class="mt-2">
              <div v-if="embeddings[0] === '_fetching'">
                <i-spinner class="text-center p-3" />
              </div>
              <div v-else-if="embeddings[0] === '_error'" class="alert alert-danger" role="alert">
                {{embeddings[1]}}
              </div>
              <div v-else class="embeddings">
                <a
                  v-for="embedding in embeddings"
                  :title="$t('filter.add', { word: embedding })"
                  class="mr-2 mt-2 border px-2 d-inline-block"
                  v-on:click="updateFilter(embedding)">
                  {{embedding}}
                </a>
              </div>
          </b-col>
        </b-row>
      </form>
    </b-form-group>
  </div>
</template>

<script>
export default {
  props: ['filter'],
  computed: {
    limitEmbeddingsOptions: {
      get() {
        return [
          { value: 10, text: '10' },
          { value: 20, text: '20' },
          { value: 50, text: '50' },
        ];
      },
    },
    languageEmbeddingsOptions: {
      get() {
        return [
          { value: 'en', text: 'English' },
          { value: 'fr', text: 'French' },
          { value: 'de', text: 'German' },
        ];
      },
    },
    limitEmbeddings: {
      get() {
        return this.$store.state.embeddings.limit;
      },
      set(limitEmbeddings) {
        this.$store.commit('embeddings/UPDATE_LIMIT', limitEmbeddings);
      },
    },
    languageEmbeddings: {
      get() {
        return this.$store.state.embeddings.language;
      },
      set(languageEmbeddings) {
        this.$store.commit('embeddings/UPDATE_LANGUAGE', languageEmbeddings);
      },
    },
    embeddings: {
      get() {
        return this.$store.state.embeddings.embeddings;
      },
    },
  },
  methods: {
    lastWord(filter) {
      if (filter && filter.q) {
        // q = last query string from filter
        const q = filter.q.trim().split(' ').pop();
        // return first word from q
        return q.replace(/(\s|-).*/, '');
      }
      return '';
    },
    embeddingsOnSubmit() {
      this.$store.state.embeddings.embeddings = {};
      if (this.$refs.inputE && this.$refs.inputE.$el.value !== '') {
        this.$store.dispatch('embeddings/FIND', this.$refs.inputE.$el.value);
      }
    },
    updateFilter(embedding) {
      if (this.filter) {
        this.$store.commit('search/UPDATE_FILTER', {
          filter: this.filter,
          precision: 'soft',
          q: `${this.filter.q} ${embedding}`,
        });
      } else {
        const filter = { query: embedding, type: 'string', context: 'include' };
        this.$store.commit('search/ADD_FILTER', filter);
        this.$store.dispatch('search/PUSH_SEARCH_PARAMS');
      }
    },
  },
  mounted() {
    this.embeddingsOnSubmit();
  },
};
</script>

<style lang="css" scoped>
.embeddings {
  max-height: 20vh;
  overflow-y:scroll;
}
</style>

<i18n>
{
  "en": {
    "filter": {
      "add": "Add {word} to filter"
    }
  }
}
</i18n>
