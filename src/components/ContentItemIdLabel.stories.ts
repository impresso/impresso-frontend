import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ContentItemIdLabel from '@/components/ContentItemIdLabel.vue'
import type { ContentItemIdLabelProps } from '@/components/ContentItemIdLabel.vue'

const meta: Meta<typeof ContentItemIdLabel> = {
  title: 'Components/ContentItemIdLabel',
  component: ContentItemIdLabel,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: { ContentItemIdLabel },
      template: `
        <div class="bg-light d-flex align-items-center p-4" style="height: 200px;width: 100%;">
          <ContentItemIdLabel v-bind="args" />
        </div>
      `
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    id: 'GDU-1900-01-01-a-i0234'
  } as ContentItemIdLabelProps
}

export const Collection: Story = {
  args: {
    id: 'local-abc123xyz'
  } as ContentItemIdLabelProps
}
