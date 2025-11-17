import type { Meta, StoryObj } from '@storybook/vue3-vite'
import EntitySuggesterModal from './EntitySuggesterModal.vue'
import { http, HttpResponse } from 'msw'

const meta: Meta<typeof EntitySuggesterModal> = {
  title: 'Modals/EntitySuggesterModal',
  component: EntitySuggesterModal,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A component that suggests entities based on semantic embeddings for inclusion in filters.'
      }
    },
    msw: {
      handlers: [
        http.get('/api/entities', () => {
          return HttpResponse.json({
            total: 4,
            data: [
              {
                countItems: 2763,
                countMentions: 0,
                uid: '2-50-Mario_Sessa',
                name: 'Mario Sessa',
                type: 'person',
                wikidataId: 'Q3293564'
              },
              {
                countItems: 1356,
                countMentions: 0,
                uid: '2-50-Mario_Cipollini',
                name: 'Mario Cipollini',
                type: 'person',
                wikidataId: 'Q356654'
              },
              {
                countItems: 1219,
                countMentions: 0,
                uid: '2-50-Alain_Marion',
                name: 'Alain Marion',
                type: 'person',
                wikidataId: 'Q2562822'
              },
              {
                countItems: 1162,
                countMentions: 0,
                uid: '2-50-Mario_Botta',
                name: 'Mario Botta',
                type: 'person',
                wikidataId: 'Q122363'
              },
              {
                countItems: 1161,
                countMentions: 0,
                uid: '2-50-Marion_Cotillard',
                name: 'Marion Cotillard',
                type: 'person',
                wikidataId: 'Q8927'
              }
            ]
          })
        })
      ]
    }
  },
  render: args => ({
    components: { EntitySuggesterModal },
    setup() {
      return { args }
    },
    template: '<div style="height: 400px;"><EntitySuggesterModal v-bind="args" /></div>'
  })
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    isVisible: true,
    type: 'person'
  }
}
