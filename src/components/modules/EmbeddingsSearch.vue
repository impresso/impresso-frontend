<template>
  <div class="border p-2 bg-light">
    <div class="mb-2" v-html="$t('embedding_howto')" />
    <div class="d-flex">
      <b-form-input
        type="text"
        size="sm"
        class="form-control"
        style="border-color: black; color: black; flex-grow: 1"
        @keydown.space.prevent
        @click.prevent.stop
        name="inputEmbeddings"
        v-model.trim="query"
        debounce="250"
      />
      <b-form-select
        name="languageEmbeddings"
        v-model="languageEmbeddings"
        :options="languageEmbeddingsOptions"
        size="sm"
        variant="outline-primary"
        style="border-left-color: black;width: 75px; text-overflow: ellipsis;"
        class="pl-1 pr-4"
      />
      <b-form-select
        name="limitEmbeddings"
        v-model="limitEmbeddings"
        :options="limitEmbeddingsOptions"
        size="sm"
        variant="outline-primary"
        style="width:75px "
        class="pl-1 pr-4"
      />
    </div>
    <div class="my-2">
      <i-spinner v-if="isLoading" class="text-center p-3" />
      <div v-else-if="errorType" role="alert" v-html="$t(`error_${errorType}`, { query })" />
      <div v-else-if="words.length" class="font-italic">
        {{ $t('embeddings_words') }}
      </div>
    </div>
    <div class="embeddings my-2">
      <a
        v-for="(word, i) in words"
        :key="i"
        @click.prevent.stop="updateFilter(word)"
        :title="$t('filter.add', { word })"
        class="mr-2 mt-2 border px-2 d-inline-block"
      >
        {{ word }}
      </a>
    </div>
  </div>
</template>

<script>
import { embeddings as embeddingsService } from '@/services'
import { mapStores } from 'pinia'
import { useEmbeddingsStore } from '@/stores/embeddings'

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
    errorType: null,
    words: [],
    observingWords: [],
    isLoading: false,
    isPristine: true,
    query: '',
  }),
  props: {
    filter: Object,
  },
  computed: {
    ...mapStores(useEmbeddingsStore),
    filterQuery() {
      if (this.filter && Array.isArray(this.filter.q)) {
        const q = this.filter.q
          .join(' ')
          .split(' ')
          .pop()
          .replace(/(\s|-).*/, '')
        return q
      }
      return undefined
    },
    limitEmbeddings: {
      get() {
        return this.embeddingsStore.limit
      },
      set(limitEmbeddings) {
        this.embeddingsStore.updateLimit(limitEmbeddings)
      },
    },
    languageEmbeddings: {
      get() {
        return this.embeddingsStore.language
      },
      set(languageEmbeddings) {
        this.embeddingsStore.updateLanguage(languageEmbeddings)
      },
    },
    serviceQuery() {
      return {
        q: this.query,
        language: this.languageEmbeddings,
        limit: this.limitEmbeddings,
      }
    },
  },
  methods: {
    updateFilter(embedding) {
      this.$emit('embdding-selected', embedding)
    },
  },
  mounted() {
    if (this.filterQuery) {
      this.query = this.filterQuery
    }
  },
  watch: {
    serviceQuery: {
      handler({ q, language, limit }) {
        this.errorType = undefined
        this.words = []
        if (q.length === 0) return
        this.isLoading = true
        embeddingsService
          .find({
            ignoreErrors: true,
            query: { q, language, limit },
          })
          .then(({ data }) => {
            this.words = data.filter(w => w !== q.toLowerCase())
          })
          .catch(e => {
            console.warn('Error received from embeddings.find service:', e)
            this.errorType = e.name
          })
          .finally(() => {
            this.isLoading = false
          })
      },
      immediate: true,
    },
  },
}
</script>

<style lang="css" scoped>
.embeddings {
  max-height: 20vh;
  overflow-y: scroll;
}
</style>

<i18n lang="json">
{
  "en": {
    "error_NotFound": "Ops, it looks like <b>{query}</b> is not available in our embeddings",
    "error_GeneralError": "Service not availble at the moment, try again in a couple of minutes",
    "error_BadRequest": "<b>{query}</b> contains invalid characters, only a-z A-Z and accented letters are allowed",
    "filter": {
      "add": "Add {word} to filter"
    },
    "embedding_howto": "Enlarge you search! Type <b>one word</b> and obtain a list of surrounding words",
    "embeddings_words": "Click on one of the following words to update your search"
  }
}
</i18n>
