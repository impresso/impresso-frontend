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
              style="border-color: black; color: black"
              ref="inputE"
              :value="lastWord(filter)"
              @keydown.space.prevent
              @click.prevent.stop
              name="inputEmbeddings" />
                <b-form-select name="languageEmbeddings"
                  v-model="languageEmbeddings"
                  :options="languageEmbeddingsOptions"
                  v-on:change="embeddingsOnSubmit()"
                  size="sm" variant="outline-primary"
                  style="border-left-color: black"/>
                <b-form-select name="limitEmbeddings"
                  v-model="limitEmbeddings"
                  :options="limitEmbeddingsOptions"
                  v-on:change="embeddingsOnSubmit()"
                  size="sm" variant="outline-primary" />
                <div class="input-group-append">
                  <b-button
                    size="sm" variant="outline-primary"
                    @click.prevent.stop="embeddingsOnSubmit()">GO!
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
                  v-for="(embedding, i) in embeddings"
                  :key="i"
                  :title="$t('filter.add', { word: embedding })"
                  class="mr-2 mt-2 border px-2 d-inline-block"
                  @click.prevent.stop="updateFilter(embedding)">
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
  data: () => ({
    languageEmbeddingsOptions: [
      { value: 'fr', text: 'French' },
      { value: 'de', text: 'German' },
      { value: 'lb', text: 'Luxembourgish' },
    ],
    limitEmbeddingsOptions: [
      { value: 25, text: '25' },
      { value: 50, text: '50' },
    ],
  }),
  props: {
    filter: Object,
  },
  computed: {
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
        let q;
        if (Array.isArray(filter.q)) {
          q = filter.q.join(' ').trim().split(' ').pop();
        } else {
          // q = last word
          q = filter.q.trim().split(' ').pop();
        }
        // return last word from q cleaned
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
      this.$emit('embdding-selected', embedding);
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
