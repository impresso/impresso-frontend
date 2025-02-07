import type { Meta, StoryObj } from '@storybook/vue3'
import IIIFViewer, { IIIFViewerProps } from '@/components/modules/IIIFViewer.vue'

const meta: Meta<typeof IIIFViewer> = {
  title: 'Components/IIIFViewer',
  component: IIIFViewer,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: { IIIFViewer },
      template:
        '<div style="height: 500px; width: 100%"><IIIFViewer class="IIIFViewer shadow rounded-md h-100"  v-bind="args"></IIIFViewer></div>'
    }
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    manifestUrls: [
      'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f4bzmz8%2fpages%2f8/info.json',
      'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f4bzmz8%2fpages%2f9/info.json'
    ],
    overlays: [
      {
        id: 'overlay1',
        regions: [
          {
            id: 'overlay1region1',
            coords: { x: 2381, y: 4425, w: 725, h: 553 }
          }
        ]
      },
      {
        id: 'overlay2',
        regions: [
          {
            id: 'overlay2region1',
            coords: { x: 2381, y: 4425, w: 725, h: 553 }
          }
        ]
      }
    ],
    openseadragonCssClass: 'rounded-md bg-dark overflow-hidden',
    fitBoundsToOverlayIdx: [0, 0]
  } as IIIFViewerProps
}
