import type { Meta, StoryObj } from '@storybook/vue3'
import TutorialMonitor from '@/components/TutorialMonitor.vue'

const meta: Meta<typeof TutorialMonitor> = {
  title: 'Components/TutorialMonitor',
  component: TutorialMonitor,
  tags: ['autodocs'],
  args: {
    title: 'Tutorial Monitor'
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Tutorial Monitor'
  }
}
