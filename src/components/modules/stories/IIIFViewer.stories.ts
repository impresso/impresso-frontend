import type { Meta, StoryObj } from '@storybook/vue3-vite'
import IIIFViewer, { IIIFViewerProps } from '@/components/modules/IIIFViewer.vue'
import { http, HttpResponse } from 'msw'

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

export const ForbiddenAccess: Story = {
  parameters: {
    msw: {
      handlers: [
        // Simulate a 403 Forbidden response for the info.json request
        http.get('/forbidden/access/info.json', () => {
          return HttpResponse.json(
            {
              error: 'Forbidden',
              message: 'You do not have permission to access this resource'
            },
            { status: 403 }
          )
        })
      ]
    }
  },
  args: {
    manifestUrls: ['/forbidden/access/info.json'],
    openseadragonCssClass: 'rounded-md bg-dark overflow-hidden'
  } as IIIFViewerProps
}

export const ImagesOnlyForbidden: Story = {
  parameters: {
    msw: {
      handlers: [
        // The info.json request succeeds with proper IIIF manifest data
        http.get('/restricted/images/info.json', () => {
          return HttpResponse.json({
            '@context': 'http://iiif.io/api/image/2/context.json',
            '@id': '/restricted/images',
            protocol: 'http://iiif.io/api/image',
            width: 4000,
            height: 6000,
            sizes: [
              { width: 2000, height: 3000 },
              { width: 1000, height: 1500 },
              { width: 500, height: 750 },
              { width: 250, height: 375 }
            ],
            tiles: [{ width: 512, height: 512, scaleFactors: [1, 2, 4, 8, 16] }],
            profile: ['http://iiif.io/api/image/2/level2.json']
          })
        }),
        // But any image request returns a 403 Forbidden
        http.get(/\/restricted\/images\/.*\.jpg$/, () => {
          return HttpResponse.json(
            {
              error: 'Forbidden',
              message: 'You need appropriate permissions to view this image'
            },
            { status: 403 }
          )
        })
      ]
    }
  },
  args: {
    manifestUrls: ['/restricted/images/info.json'],
    openseadragonCssClass: 'rounded-md bg-dark overflow-hidden'
  } as IIIFViewerProps
}

export const ServerError: Story = {
  parameters: {
    msw: {
      handlers: [
        // Simulate a 500 Server Error response for the info.json request
        http.get('/server-error/info.json', () => {
          return HttpResponse.json(
            {
              error: 'Internal Server Error',
              message:
                'The server encountered an unexpected condition that prevented it from fulfilling the request'
            },
            { status: 500 }
          )
        })
      ]
    }
  },
  args: {
    manifestUrls: ['/server-error/info.json'],
    openseadragonCssClass: 'rounded-md bg-dark overflow-hidden'
  } as IIIFViewerProps
}

export const ImagesNotFound: Story = {
  parameters: {
    msw: {
      handlers: [
        // The info.json request succeeds with proper IIIF manifest data
        http.get('/missing/images/info.json', () => {
          return HttpResponse.json({
            '@context': 'http://iiif.io/api/image/2/context.json',
            '@id': '/missing/images',
            protocol: 'http://iiif.io/api/image',
            width: 4000,
            height: 6000,
            sizes: [
              { width: 2000, height: 3000 },
              { width: 1000, height: 1500 },
              { width: 500, height: 750 },
              { width: 250, height: 375 }
            ],
            tiles: [{ width: 512, height: 512, scaleFactors: [1, 2, 4, 8, 16] }],
            profile: ['http://iiif.io/api/image/2/level2.json']
          })
        }),
        // But any image request returns a 404 Not Found
        http.get(/\/missing\/images\/.*\.jpg$/, () => {
          return HttpResponse.json(
            {
              error: 'Not Found',
              message: 'The requested image could not be found on the server'
            },
            { status: 404 }
          )
        })
      ]
    }
  },
  args: {
    manifestUrls: ['/missing/images/info.json'],
    openseadragonCssClass: 'rounded-md bg-dark overflow-hidden'
  } as IIIFViewerProps
}
