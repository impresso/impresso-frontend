import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ContentItemAccessButton from '@/components/ContentItemAccessButton.vue'

const meta: Meta<typeof ContentItemAccessButton> = {
  title: 'Components/ContentItemAccessButton',
  component: ContentItemAccessButton,
  tags: ['autodocs'],
  render: () => ({
    components: { ContentItemAccessButton },
    template: `
      <div class="d-flex align-items-center p-4" style="height: 200px; width: 100%;">
        <ContentItemAccessButton />
      </div>
    `
  })
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
