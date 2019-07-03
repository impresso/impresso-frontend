<template lang="html">
  <div class="border pt-3 px-2 bg-light">
    <b-form-group>
      <form v-on:submit.prevent="embeddingsOnSubmit()">
        <b-row>
          <b-col cols="12" class="input-group">
            <b-form-input
              type="text"
              size="sm"
              class="form-control"
              ref="inputE"
              :value="lastWord(filter.q)"
              name="inputEmbeddings" />
              <div class="input-group-append">
                <b-form-select name="languageEmbeddings"
                  v-model="languageEmbeddings"
                  :options="languageEmbeddingsOptions"
                  v-on:change="embeddingsOnSubmit()"
                  size="sm" variant="outline-primary" />
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
              <div v-else>
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
    languageEmbeddingsOptions: {
      get() {
        return [
          { value: 'en', text: 'English' },
          { value: 'fr', text: 'French' },
          { value: 'de', text: 'German' },
          { value: 'lu', text: 'Lëtz.' },
        ];
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
    lastWord(q) {
      return q.trim().split(' ').pop();
    },
    embeddingsOnSubmit() {
      console.log('input:', this.$refs);
      this.$store.dispatch('embeddings/FIND', this.$refs.inputE.$el.value);
    },
    updateFilter(embedding) {
      this.$store.commit('search/UPDATE_FILTER', {
        filter: this.filter,
        q: `${this.filter.q} ${embedding}`,
      });
    },
  },
  mounted() {
    this.embeddingsOnSubmit();
  },
};
</script>

<style lang="css" scoped>
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
