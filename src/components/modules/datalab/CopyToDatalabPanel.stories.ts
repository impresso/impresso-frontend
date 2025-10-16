import type { Meta, StoryObj } from '@storybook/vue3-vite'
import CopyToDatalabPanel from './CopyToDatalabPanel.vue'

const meta: Meta<typeof CopyToDatalabPanel> = {
  title: 'Components/Datalab/CopyToDatalabPanel',
  component: CopyToDatalabPanel,
  tags: ['autodocs'],
  argTypes: {
    code: {
      control: 'text',
      description: 'The Python code to display'
    }
  },
  decorators: [
    () => ({
      template: '<div style="margin: 2rem;"><story/></div>'
    })
  ]
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    code: `from impresso import connect

# Connect to the API
impresso = connect()

# Search for articles that contain "climate change"
results = impresso.search(term="climate change")
`
  }
}
