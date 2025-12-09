import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { action } from 'storybook/actions'
import { ref } from 'vue'
import OSViewer from './OSViewer.vue'

const meta: Meta<typeof OSViewer> = {
  title: 'OSViewer/OSViewer',
  component: OSViewer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'An OpenSeadragon viewer for displaying and navigating through image pages.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    pageIndex: {
      control: { type: 'number', min: 0 },
      description: 'Current page index (v-model capable)'
    },
    pages: {
      control: { type: 'object' },
      description: 'Array of page URLs'
    },
    pageRegions: {
      control: { type: 'object' },
      description: 'Array of page regions with coordinates'
    },
    gap: {
      control: { type: 'number', min: 0, step: 0.1 },
      description: 'Gap between pages in viewport units'
    }
  },
  render: args => ({
    components: { OSViewer },
    setup() {
      const pageIndex = ref(args.pageIndex)

      return {
        args,
        pageIndex,
        onPageIndexUpdated: action('pageIndex updated'),
        goToNextPage: () => {
          pageIndex.value = Math.min(args.pages.length - 1, pageIndex.value + 1)
        },
        goToPreviousPage: () => {
          pageIndex.value = Math.max(0, pageIndex.value - 1)
        }
      }
    },
    template: `
      <div style="width: 800px; height: 400px;">
        <div class="p-1 mb-1 d-flex gap-2 align-items-center">
            <button
              @click="goToPreviousPage"
              class="px-3 py-1 btn btn-sm btn-outline-secondary"
              :disabled="pageIndex === 0"
            >
              Previous
            </button>

            <p class="m-0">Current Page Index: <strong>{{ pageIndex }}</strong></p>

            <button
              @click="goToNextPage"
              class="px-3 py-1 btn btn-sm btn-outline-secondary"
              :disabled="pageIndex === args.pages.length - 1"
            >
              Next
            </button>

        </div>
        <OSViewer
          v-bind="args"
          v-model:pageIndex="pageIndex"
          @update:pageIndex="onPageIndexUpdated"
        />
      </div>
    `
  })
} satisfies Meta<typeof OSViewer>

export default meta
type Story = StoryObj<typeof meta>

// Basic story with Controls
export const Default: Story = {
  args: {
    pages: [
      'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f4bzmz8%2fpages%2f1/info.json',
      'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f4bzmz8%2fpages%2f2/info.json',
      'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f4bzmz8%2fpages%2f3/info.json',
      'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f4bzmz8%2fpages%2f4/info.json',
      'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f4bzmz8%2fpages%2f5/info.json',
      'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f4bzmz8%2fpages%2f6/info.json',
      'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f4bzmz8%2fpages%2f7/info.json',
      'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f4bzmz8%2fpages%2f8/info.json',
      'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f4bzmz8%2fpages%2f9/info.json',
      'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f4bzmz8%2fpages%2f10/info.json'
    ],
    pageIndex: 7,
    pageRegions: [
      {
        articleUid: 'FedGazDe-1907-12-18-a-i0001',
        pageUid: 'FedGazDe-1907-12-18-a-p0001',
        coords: { x: 140, y: 46, w: 1185, h: 2055 }
      }
    ]
  }
}
