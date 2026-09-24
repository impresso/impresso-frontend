import type { Meta, StoryObj } from '@storybook/vue3-vite'
import EntityPreview from './EntityPreview.vue'
import type { EntityPreviewProps } from './EntityPreview.vue'

const meta: Meta<typeof EntityPreview> = {
  title: 'entity/EntityPreview',
  component: EntityPreview,
  tags: ['autodocs'],
  render: args => ({
    setup() {
      return { args }
    },
    components: {
      EntityPreview
    },
    template: `
      <div style="width: 420px">
        <EntityPreview v-bind="args" />
      </div>
    `
  })
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    item: {
      id: 'Q937'
    }
  } as EntityPreviewProps
}
