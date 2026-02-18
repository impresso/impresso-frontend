import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BaristaChat from './BaristaChat.vue'
import { fn } from 'storybook/test'
import { useBaristaStore } from '@/stores/barista'
import { type BaristaMessageItem } from '@/services/types/barista'
import { type Filter } from '@/models'
import { nextTick, ref } from 'vue'

const meta = {
  title: 'Barista/BaristaChat',
  component: BaristaChat,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A chat interface for interacting with the Barista AI assistant.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {},
  render: args => ({
    components: { BaristaChat },
    setup() {
      const baristaStore = useBaristaStore()
      const scrollContainer = ref<HTMLElement | null>(null)

      baristaStore.clearMessages()

      const timers = []
      const mockStream = () => {
        for (const timer of timers) {
          clearTimeout(timer)
        }
        timers.splice(0, timers.length)
        for (let i = 0; i < MockBaristaPayloads.length; i++) {
          const payload = MockBaristaPayloads[i]

          timers.push(
            setTimeout(
              () => {
                console.log('Sending mock payload:', payload)
                baristaStore.parseBaristaStream(payload)
              },
              1000 * (i + 1)
            )
          )
        }
      }
      const handleSubmit = () => {
        console.debug('[BaristaChat.stories] Submit triggered, starting mock stream')
        mockStream()
      }
      const handleUpdateHeight = (height: number) => {
        console.debug('[BaristaChat.stories] Chat height updated:', height)
        // Scroll to bottom when height updates
        nextTick(() => {
          if (scrollContainer.value) {
            scrollContainer.value.scrollTo({
              top: scrollContainer.value.scrollHeight,
              behavior: 'smooth'
            })
          }
        })
      }
      const handleSuggestFilters = (filters: Filter[]) => {
        console.debug('[BaristaChat.stories] Suggest filters event received:', filters)
      }
      return { args, handleSubmit, handleUpdateHeight, handleSuggestFilters, scrollContainer }
    },
    template: `
      <div style="width: 500px; height: 600px; overflow:scroll" ref="scrollContainer">
        <BaristaChat v-bind="args" @submit="handleSubmit" @suggestFilters="handleSuggestFilters" @update-height="handleUpdateHeight"  />
      </div>
    `
  })
} satisfies Meta<typeof BaristaChat>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {}
}

export const WithInitialFilters: Story = {
  args: {
    filters: [
      {
        type: 'newspaper',
        q: 'luxwort',
        context: 'include',
        precision: 'exact',
        op: 'OR'
      }
    ]
  }
}

const MockBaristaPayloads = [
  {
    type: 'chunk',
    data: [
      {
        type: 'ai',
        content: '',
        reasoningContent:
          'We need to respond with a structured search query. The user: "Find items related to Robert Schumann". Existing context: newspaper include luxwort (OR). We need to add person filter for Robert Schumann. Should we use OR or AND? The user says "Find items related to Robert Schumann". Usually we want to include items that mention him. So we should use AND with person filter. But the context says existing filter is newspaper include luxwort (OR). So we combine with AND for person. So final filters: newspaper include luxwort (OR), person include 2-50-Robert_Schumann (AND). Also maybe language=fr? Not specified. Just the person. So we need to call find_entities_ids for Robert Schumann. Already did earlier. We have ID. So we produce BaristaFormattedResponse with filters: newspaper OR luxwort, person AND 2-50-Robert_Schumann. Also maybe we should include type=ar? Not specified. So just these two. Provide the structured response.',
        toolCalls: [
          {
            name: 'BaristaFormattedResponse',
            args: {
              impressoHelp: null,
              searchQuery: {
                filters: [
                  {
                    context: 'include',
                    op: 'OR',
                    q: 'luxwort',
                    type: 'newspaper'
                  },
                  {
                    context: 'include',
                    op: 'AND',
                    q: ['2-50-Robert_Schumann'],
                    type: 'person'
                  }
                ]
              }
            },
            id: 'fc_971dd80c-9af7-4996-a8b8-a264c0243d7b',
            type: 'tool_call'
          }
        ],
        source: {
          content: '',
          additional_kwargs: {
            reasoning_content:
              'We need to respond with a structured search query. The user: "Find items related to Robert Schumann". Existing context: newspaper include luxwort (OR). We need to add person filter for Robert Schumann. Should we use OR or AND? The user says "Find items related to Robert Schumann". Usually we want to include items that mention him. So we should use AND with person filter. But the context says existing filter is newspaper include luxwort (OR). So we combine with AND for person. So final filters: newspaper include luxwort (OR), person include 2-50-Robert_Schumann (AND). Also maybe language=fr? Not specified. Just the person. So we need to call find_entities_ids for Robert Schumann. Already did earlier. We have ID. So we produce BaristaFormattedResponse with filters: newspaper OR luxwort, person AND 2-50-Robert_Schumann. Also maybe we should include type=ar? Not specified. So just these two. Provide the structured response.',
            tool_calls: [
              {
                id: 'fc_971dd80c-9af7-4996-a8b8-a264c0243d7b',
                function: {
                  arguments:
                    '{"impressoHelp":null,"searchQuery":{"filters":[{"context":"include","op":"OR","q":"luxwort","type":"newspaper"},{"context":"include","op":"AND","q":["2-50-Robert_Schumann"],"type":"person"}]}}',
                  name: 'BaristaFormattedResponse'
                },
                type: 'function'
              }
            ]
          },
          response_metadata: {
            token_usage: {
              completion_tokens: 305,
              prompt_tokens: 3358,
              total_tokens: 3663,
              completion_time: 0.350378141,
              completion_tokens_details: {
                reasoning_tokens: 214
              },
              prompt_time: 0.197809862,
              prompt_tokens_details: null,
              queue_time: 0.016303025,
              total_time: 0.548188003
            },
            model_name: 'openai/gpt-oss-20b',
            system_fingerprint: 'fp_73d9ae1ca9',
            service_tier: 'on_demand',
            finish_reason: 'tool_calls',
            logprobs: null,
            model_provider: 'groq'
          },
          type: 'ai',
          name: null,
          id: 'lc_run--019be236-57a0-7c20-9896-ffbfb103ae2b-0',
          tool_calls: [
            {
              name: 'BaristaFormattedResponse',
              args: {
                impressoHelp: null,
                searchQuery: {
                  filters: [
                    {
                      context: 'include',
                      op: 'OR',
                      q: 'luxwort',
                      type: 'newspaper'
                    },
                    {
                      context: 'include',
                      op: 'AND',
                      q: ['2-50-Robert_Schumann'],
                      type: 'person'
                    }
                  ]
                }
              },
              id: 'fc_971dd80c-9af7-4996-a8b8-a264c0243d7b',
              type: 'tool_call'
            }
          ],
          invalid_tool_calls: [],
          usage_metadata: {
            input_tokens: 3358,
            output_tokens: 305,
            total_tokens: 3663,
            output_token_details: {
              reasoning: 214
            }
          }
        },
        structuredResponse: {
          searchQuery: {
            filters: [
              {
                type: 'newspaper',
                q: 'luxwort',
                context: 'include',
                precision: 'exact',
                op: 'OR'
              },
              {
                type: 'person',
                q: ['2-50-Robert_Schumann'],
                context: 'include',
                precision: 'exact',
                op: 'AND'
              }
            ]
          },
          impressoHelp: null
        }
      }
    ] as BaristaMessageItem[],
    userUid: 'local-dg'
  },
  {
    type: 'done',
    data: [],
    userUid: 'local-dg'
  }
]
