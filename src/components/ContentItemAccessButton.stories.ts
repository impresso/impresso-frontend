import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ContentItemAccessButton from '@/components/ContentItemAccessButton.vue'
import {
  findSpecialMembershipAccessHandler,
  findSpecialMembershipAccessHandlerWithoutRequests
} from '.storybook/mswHandlers'

const meta: Meta<typeof ContentItemAccessButton> = {
  title: 'Components/ContentItemAccessButton',
  component: ContentItemAccessButton,
  tags: ['autodocs'],
  render: args => ({
    setup() {
      return { args }
    },
    components: { ContentItemAccessButton },
    template: `
      <div class="d-flex align-items-center p-4" style="height: 200px; width: 100%;">
        <ContentItemAccessButton  v-bind="args" />
      </div>
    `
  })
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    specialMembershipAccessBitPositions: [2],
    currentAccessLevel: 1
  },
  parameters: {
    msw: {
      handlers: [findSpecialMembershipAccessHandler]
    }
  }
}

export const WithoutExistingRequest: Story = {
  args: {
    specialMembershipAccessBitPositions: [2],
    currentAccessLevel: 1
  },
  parameters: {
    msw: {
      handlers: [findSpecialMembershipAccessHandlerWithoutRequests]
    }
  }
}
