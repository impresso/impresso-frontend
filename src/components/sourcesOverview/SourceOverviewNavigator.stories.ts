import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SourceOverviewNavigator from './SourceOverviewNavigator.vue'
import type { SourceOverviewNavigatorProps } from './SourceOverviewNavigator.vue'

const meta: Meta<typeof SourceOverviewNavigator> = {
  title: 'SourceOverview/SourceOverviewNavigator',
  component: SourceOverviewNavigator,
  tags: ['autodocs'],
  render: args => {
    return {
      components: {
        SourceOverviewNavigator
      },
      setup() {
        return { args }
      },
      template: `
        <div style="position: relative; width: 400px; height: 400px; border: 1px dashed #ced4da;">
          <SourceOverviewNavigator v-bind="args">
            <div style="padding: 12px; font-size: 12px; color: #495057;">
              Drag me around
            </div>
          </SourceOverviewNavigator>
        </div>
      `
    }
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    width: 200,
    height: 200,
    initialX: 20,
    initialY: 20
  } as SourceOverviewNavigatorProps
}
