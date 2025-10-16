import type { Meta, StoryObj } from '@storybook/vue3-vite'
import CopyToDatalabButton from './CopyToDatalabButton.vue'

const meta: Meta<typeof CopyToDatalabButton> = {
  title: 'Components/Datalab/CopyToDatalabButton',
  component: CopyToDatalabButton,
  tags: ['autodocs'],
  argTypes: {
    base64Filters: {
      control: 'text',
      description: 'Base64 encoded filters'
    },
    resource: {
      control: 'text',
      description: 'Resource type to fetch'
    },
    functionName: {
      control: 'text',
      description: 'The name of the function to generate code for'
    }
  },
  decorators: [
    () => ({
      template: '<div style="margin: 2rem; height:400px"><story/></div>'
    })
  ]
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    base64Filters: 'eJyrVspJTU8tUtJRSswtyElVslLKS8xNVbJSKi5ILErOyCxWqgUA1IkO6A==',
    resource: 'search',
    functionName: 'search_articles'
  }
}

export const CustomButtonText: Story = {
  args: {
    base64Filters: 'eJyrVspJTU8tUtJRSswtyElVslLKS8xNVbJSKi5ILErOyCxWqgUAJZYL/g==',
    resource: 'search',
    functionName: 'search_articles'
  },
  render: args => ({
    components: { CopyToDatalabButton },
    setup() {
      return { args }
    },
    template: '<CopyToDatalabButton v-bind="args">Export to Notebook</CopyToDatalabButton>'
  })
}
