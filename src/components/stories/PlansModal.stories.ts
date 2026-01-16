import type { Meta, StoryObj } from '@storybook/vue3-vite'
import PlansModal from '@/components/PlansModal.vue'
import { MockPlansModalContent } from '.storybook/mockData/plans'
import { http, HttpResponse } from 'msw'

const meta: Meta<typeof PlansModal> = {
  title: 'Components/PlansModal',
  component: PlansModal,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: { PlansModal },
      template:
        '<div style="height: 800px; width: 100%"><PlansModal v-bind="args"></PlansModal></div>'
    }
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/datalab/contents/plans.json', () => {
          return HttpResponse.json(MockPlansModalContent)
        })
      ]
    }
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    isVisible: true,
    modalTitle: 'User plans overview',
    title: 'Impresso User Plans',
    userPlan: 'plan-basic',

    acceptedTermsDate: '2021-09-01T00:00:00.000Z'
  }
}
