import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import { http, HttpResponse } from 'msw'
import { fn } from 'storybook/test'
import Autocomplete from '@/components/Autocomplete.vue'
import type { AutocompleteProps } from '@/components/Autocomplete.vue'
import { useAutocompleteStore } from '@/stores/autocomplete'
import { useUserStore } from '@/stores/user'
import { MockAutocompleteSuggestions } from '.storybook/mockData/suggestions'

type StoryArgs = AutocompleteProps & {
  onSubmit: (filter: unknown) => void
  onSubmitEmpty: () => void
  onInputFocus: (focused: boolean) => void
  onFiltersChanged: (filters: unknown[]) => void
}

const findSuggestionsHandler = http.get('/api/suggestions', async ({ request }) => {
  const url = new URL(request.url)
  const q = (url.searchParams.get('q') || '').trim().toLowerCase()
  const limit = Number.parseInt(url.searchParams.get('limit') || '9', 10)

  await new Promise(resolve => setTimeout(resolve, 300))

  const filteredSuggestions = q.length
    ? MockAutocompleteSuggestions.filter(suggestion => {
        const searchableValues = [
          suggestion.h,
          suggestion.item.name,
          suggestion.item.label,
          suggestion.item.id,
          suggestion.q
        ]

        return searchableValues.some(value => String(value || '').toLowerCase().includes(q))
      }).slice(0, Number.isNaN(limit) ? 9 : limit)
    : []

  return HttpResponse.json({
    data: filteredSuggestions,
    pagination: {
      total: filteredSuggestions.length,
      offset: 0,
      limit: Number.isNaN(limit) ? 9 : limit
    }
  })
})

const meta: Meta<typeof Autocomplete> = {
  title: 'Components/Autocomplete',
  component: Autocomplete,
  tags: ['autodocs'],
  render: args => {
    return {
      components: {
        Autocomplete
      },
      setup() {
        const autocompleteStore = useAutocompleteStore()
        const userStore = useUserStore()

        // Keep story behavior deterministic across refreshes and story switches.
        autocompleteStore.$patch({
          queries: ['Swiss federal council', 'general strike 1918', 'winter tourism']
        })
        userStore.setUserData(false)

        const submittedPayload = ref<unknown | null>(null)

        const handleSubmit = (payload: unknown) => {
          submittedPayload.value = payload
          args.onSubmit(payload)
        }

        const submittedPayloadText = computed(() => {
          if (!submittedPayload.value) {
            return ''
          }
          return JSON.stringify(submittedPayload.value, null, 2)
        })

        return {
          args,
          submittedPayloadText,
          handleSubmit
        }
      },
      template: `
        <div class="bg-light p-4" style="width: 100%; max-width: 900px; min-height: 280px;">
          <p class="small text-muted mb-2">
            Try searching for terms like <strong>Lausanne</strong> (newspaper),
            <strong>railway</strong> (topic), <strong>Geneva</strong> (location),
            <strong>Einstein</strong> (person), <strong>strike</strong> (mention),
            <strong>Swiss federal council</strong> (string), <strong>general strike 1918</strong>
            (string), or <strong>winter tourism</strong> (string).
          </p>
          <Autocomplete
            v-bind="args"
            @submit="handleSubmit"
            @submitEmpty="args.onSubmitEmpty"
            @input-focus="args.onInputFocus"
            @filtersChanged="args.onFiltersChanged"
          />
          <pre
            v-if="submittedPayloadText"
            class="mt-3 mb-0 p-3 small border rounded bg-white"
            style="white-space: pre-wrap;"
          >{{ submittedPayloadText }}</pre>
        </div>
      `
    }
  },
  parameters: {
    msw: {
      handlers: [findSuggestionsHandler]
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

const defaultArgs: StoryArgs = {
  bodyClass: '',
  variant: 'primary',
  explorerIncludedTypes: ['mediaSource', 'topic', 'location', 'person', 'organisation', 'nag'],
  filters: [],
  onSubmit: fn(),
  onSubmitEmpty: fn(),
  onInputFocus: fn(),
  onFiltersChanged: fn()
}

export const Default: Story = {
  args: {
    ...defaultArgs
  }
}

export const DarkBackground: Story = {
  args: {
    ...defaultArgs,
    bodyClass: 'bg-dark p-2 rounded'
  }
}
