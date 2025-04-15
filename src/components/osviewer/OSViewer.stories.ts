import type { Meta, StoryObj } from '@storybook/vue3'
import OSViewer, { OSViewerProps } from './OSViewer.vue'
import { fn } from '@storybook/test'
import { computed, ref, watch } from 'vue'

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
    setup(props, { attrs }) {
      // Create a reactive ref for pageIndex
      const currentPageIndex = ref(args.pageIndex)

      // Watch for changes to args.pageIndex from Storybook controls
      watch(
        () => args.pageIndex,
        newValue => {
          currentPageIndex.value = newValue
        }
      )

      // Use toRefs for reactive props passing
      const pages = computed(() => args.pages)
      const gap = computed(() => args.gap)
      const pageRegions = computed(() => args.pageRegions)

      return {
        currentPageIndex,
        pages,
        gap,
        pageRegions
      }
    },
    template: `
      <div style="width: 800px; height: 400px;">
        <div class="p-1 mb-1 d-flex gap-2 align-items-center">
            <button 
              @click="currentPageIndex = Math.max(0, currentPageIndex - 1)"
              class="px-3 py-1 btn btn-sm btn-outline-secondary"
              :disabled="currentPageIndex === 0"
            >
              Previous
            </button>
            
            <p class="m-0">Current Page Index: <strong>{{ currentPageIndex }}</strong></p>
          
            <button 
              @click="currentPageIndex = Math.min(pages.length - 1, currentPageIndex + 1)"
              class="px-3 py-1 btn btn-sm btn-outline-secondary"
              :disabled="currentPageIndex === pages.length - 1"
            >
              Next
            </button>
          
        </div>
        <OSViewer 
          :pages="pages" 
          :pageRegions="pageRegions"
          v-model:pageIndex="currentPageIndex"
          :gap="gap"
        />
      </div>
    `
  })
  // render: args => ({
  //   components: { OSViewer },
  //   setup() {
  //     return { args }
  //   },
  //   template: `
  //     <div style="width: 800px; height: 600px;">
  //       <OSViewer v-bind="args" />
  //     </div>
  //   `
  // })
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
      },
      {
        articleUid: 'FedGazDe-1907-12-18-a-i0001',
        pageUid: 'FedGazDe-1907-12-18-a-p0001',
        coords: { x: 255, y: 148, w: 1183, h: 1888 }
      },
      {
        articleUid: 'FedGazDe-1907-12-18-a-i0001',
        pageUid: 'FedGazDe-1907-12-18-a-p0001',
        coords: { x: 153, y: 144, w: 1189, h: 1881 }
      },
      {
        articleUid: 'FedGazDe-1907-12-18-a-i0001',
        pageUid: 'FedGazDe-1907-12-18-a-p0001',
        coords: { x: 233, y: 151, w: 1188, h: 1792 }
      },
      {
        articleUid: 'FedGazDe-1907-12-18-a-i0001',
        pageUid: 'FedGazDe-1907-12-18-a-p0001',
        coords: { x: 167, y: 184, w: 1180, h: 1877 }
      },
      {
        articleUid: 'FedGazDe-1907-12-18-a-i0001',
        pageUid: 'FedGazDe-1907-12-18-a-p0001',
        coords: { x: 253, y: 185, w: 1180, h: 1879 }
      },
      {
        articleUid: 'FedGazDe-1907-12-18-a-i0001',
        pageUid: 'FedGazDe-1907-12-18-a-p0001',
        coords: { x: 170, y: 178, w: 1187, h: 1884 }
      },
      {
        articleUid: 'FedGazDe-1907-12-18-a-i0001',
        pageUid: 'FedGazDe-1907-12-18-a-p0001',
        coords: { x: 260, y: 171, w: 1187, h: 1887 }
      },
      {
        articleUid: 'FedGazDe-1907-12-18-a-i0001',
        pageUid: 'FedGazDe-1907-12-18-a-p0001',
        coords: { x: 140, y: 176, w: 1186, h: 1875 }
      },
      {
        articleUid: 'FedGazDe-1907-12-18-a-i0001',
        pageUid: 'FedGazDe-1907-12-18-a-p0001',
        coords: { x: 286, y: 181, w: 1185, h: 1883 }
      },
      {
        articleUid: 'FedGazDe-1907-12-18-a-i0001',
        pageUid: 'FedGazDe-1907-12-18-a-p0001',
        coords: { x: 138, y: 179, w: 1189, h: 1880 }
      },
      {
        articleUid: 'FedGazDe-1907-12-18-a-i0001',
        pageUid: 'FedGazDe-1907-12-18-a-p0001',
        coords: { x: 297, y: 184, w: 1179, h: 960 }
      }
    ] as any
  } as OSViewerProps
}
