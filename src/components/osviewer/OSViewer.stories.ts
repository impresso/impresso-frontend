import type { Meta, StoryObj } from '@storybook/vue3'
import OSViewer, { OSViewerProps } from './OSViewer.vue'
import { fn } from '@storybook/test'

const meta: Meta<typeof OSViewer> = {
  title: 'OSViewer/OSViewer',
  component: OSViewer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A chat interface for interacting with the Barista AI assistant.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {},

  render: args => ({
    components: { OSViewer },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 500px; height: 600px;">
        {{ args.pageIndex }}
        <OSViewer v-bind="args" />
      </div>
    `
  })
} satisfies Meta<typeof OSViewer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    pages: [
      'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f4bzmz8%2fpages%2f7/info.json',
      'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f4bzmz8%2fpages%2f8/info.json',
      'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f4bzmz8%2fpages%2f9/info.json',
      'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f4bzmz8%2fpages%2f10/info.json'
    ],
    pageIndex: 2
  } as OSViewerProps
}
