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
        style="border-left-color: black; width: 75px; text-overflow: ellipsis"
        class="pl-1 pr-4"
      />
      <b-form-select
        name="limitEmbeddings"
        v-model="limitEmbeddings"
        :options="limitEmbeddingsOptions"
        size="sm"
        variant="outline-primary"
        style="width: 75px"
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
        @click.prevent.stop="updateFilter(word.word)"
        :title="$t('filter.add', { word })"
        class="mr-2 mt-2 border px-2 d-inline-block"
      >
        {{ word.word }}
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { embeddings as embeddingsService } from '@/services'
import { mapStores } from 'pinia'
import { useEmbeddingsStore } from '@/stores/embeddings'
import { WordMatch } from '@/services/types/embeddings'

interface EmbeddingsFilter {
  q?: string[]
}

interface ServiceQuery {
  term: string
  language: string
  limit: number
}

interface SelectOption {
  value: string | number
  text: string
}

export default defineComponent({
  functional: true,
  data: () => ({
    languageEmbeddingsOptions: [
      { value: 'fr', text: 'French' },
      { value: 'de', text: 'German' },
      { value: 'lb', text: 'Luxembourgish' }
    ] as SelectOption[],
    limitEmbeddingsOptions: [
      { value: 25, text: '25' },
      { value: 50, text: '50' }
    ] as SelectOption[],
    errorType: null as string | null,
    words: [] as WordMatch[],
    observingWords: [] as string[],
    isLoading: false as boolean,
    isPristine: true as boolean,
    query: '' as string
  }),
  props: {
    filter: {
      type: Object as PropType<EmbeddingsFilter>,
      required: false,
      default: () => ({}) as EmbeddingsFilter
    }
  },
  computed: {
    ...mapStores(useEmbeddingsStore),
    filterQuery() {
      if (this.filter && Array.isArray(this.filter.q)) {
        const q = this.filter?.q
          ?.join(' ')
          ?.split(' ')
          ?.pop()
          ?.replace(/(\s|-).*/, '')
        return q
      }
      return undefined
    },
    limitEmbeddings: {
      get() {
        return this.embeddingsStore.limit
      },
      set(limitEmbeddings: number) {
        this.embeddingsStore.updateLimit(limitEmbeddings)
      }
    },
    languageEmbeddings: {
      get() {
        return this.embeddingsStore.language
      },
      set(languageEmbeddings: string) {
        this.embeddingsStore.updateLanguage(languageEmbeddings)
      }
    },
    serviceQuery() {
      return {
        term: this.query,
        language: this.languageEmbeddings,
        limit: this.limitEmbeddings
      } satisfies ServiceQuery
    }
  },
  methods: {
    updateFilter(embedding: string) {
      this.$emit('embdding-selected', embedding)
    }
  },
  mounted() {
    if (this.filterQuery) {
      this.query = this.filterQuery
    }
  },
  watch: {
    serviceQuery: {
      handler({ term, language, limit }: ServiceQuery) {
        this.errorType = undefined
        this.words = []
        if (term.length < 2) {
          this.words = []
          return
        }

        this.isLoading = true
        embeddingsService
          .find({
            query: {
              limit,
              term,
              language_code: language,
              offset: 0
            }
          })
          .then(({ data }) => {
            this.words = data.filter(w => w.word !== term.toLowerCase())
          })
          .catch((e: Error) => {
            console.warn('Error received from embeddings.find service:', e)
            this.errorType = e.name
          })
          .finally(() => {
            this.isLoading = false
          })
      },
      immediate: true
    }
  }
})
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
    "embedding_howto": "Expand you search! Type <b>one word</b> and obtain a list of similar words",
    "embeddings_words": "Click on one of the following words to update your search"
  }
}
</i18n>
