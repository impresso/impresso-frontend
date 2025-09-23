import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { action } from 'storybook/actions'
import ThumbnailNavigator from './ThumbnailNavigator.vue'
import type { IPageItem } from './ThumbnailNavigator.vue'

// More on how to set up stories at: https://storybook.js.org/docs/vue/writing-stories/introduction
const meta = {
  title: 'Components/ThumbnailNavigator',
  component: ThumbnailNavigator,
  tags: ['autodocs'],
  argTypes: {
    pages: { control: 'object' }
  },
  render: args => ({
    components: { ThumbnailNavigator },
    setup() {
      return {
        args,
        onPageSelected: action('page selected')
      }
    },
    template: `
      <div style="width: 100%;">
        <ThumbnailNavigator
          v-bind="args"
          @update:currentPageUid="onPageSelected"
        />
      </div>
    `
  })
} satisfies Meta<typeof ThumbnailNavigator>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    pages: Array.from(
      { length: 10 },
      (_, i) =>
        ({
          uid: `page-${i}`,
          num: i,
          iiif: `https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f4bzmz8%2fpages%2f${i + 1}/info.json`
        }) satisfies IPageItem
    )
  }
}

export const Empty: Story = {
  args: {
    pages: []
  }
}

export const Long: Story = {
  args: {
    pages: Array.from(
      { length: 100 },
      (_, i) =>
        ({
          uid: `page-${i}`,
          num: i,
          iiif: `https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f4bzmz8%2fpages%2f1/info.json`
        }) satisfies IPageItem
    )
  }
}

export const LongWithSelection: Story = {
  args: {
    pages: Array.from(
      { length: 100 },
      (_, i) =>
        ({
          uid: `page-${i}`,
          num: i,
          iiif: `https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f4bzmz8%2fpages%2f1/info.json`
        }) satisfies IPageItem
    ),
    currentPageUid: 'page-50'
  }
}
