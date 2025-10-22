import { Meta, StoryObj } from '@storybook/vue3'
import { vueRouter } from 'storybook-vue3-router'
import ListOfSimilarContentItems from './ListOfSimilarContentItems.vue'
import { MockContentItem } from './modules/lists/ContentItem.stories'
import { http, HttpResponse } from 'msw'

const meta: Meta<typeof ListOfSimilarContentItems> = {
  title: 'Components/ListOfSimilarContentItems',
  component: ListOfSimilarContentItems,
  decorators: [
    vueRouter([
      {
        name: 'issue-viewer',
        path: '/nothing/:issue_uid',
        redirect: '/nothing',
        beforeEnter: () => {
          return true
        }
      }
    ])
  ],
  render: args => ({
    components: { ListOfSimilarContentItems },
    setup() {
      return { args }
    },
    template: `
      <div class="container">
        <ListOfSimilarContentItems v-bind="args" class="row">
          <template #default="{ items }">
            <div
              v-for="item in items"
              :key="item.id"
              class="col-6 mb-3"
            >{{ item.title }}</div>
          </template>
        </ListOfSimilarContentItems>
      </div>
    `
  }),
  tags: ['autodocs'],
  parameters: {
    msw: {
      handlers: {
        getContentItemEmbeddings: http.get('/api/content-items/:contentitemId', ({ params }) => {
          const { contentitemId } = params
          return HttpResponse.json({
            ...MockContentItem,
            semanticEnrichments: {
              ...MockContentItem.semanticEnrichments,
              embeddings: [`embedding-for-${contentitemId}`]
            }
          })
        }),
        getContentItemsByEmbedding: http.get('/api/content-items', () => {
          return HttpResponse.json({
            data: Array.from({ length: 4 }, (_, index) => ({
              ...MockContentItem,
              id: `contentitem-similar-${index + 1}`,
              title: `Similar Content Item ${index + 1}`
            })),
            total: 4
          })
        })
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof ListOfSimilarContentItems>

export const Default: Story = {
  args: {
    contentItem: MockContentItem
  }
}
