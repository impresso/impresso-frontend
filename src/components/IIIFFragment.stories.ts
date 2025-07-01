import type { Meta, StoryObj } from '@storybook/vue3'
import IIIFFragment from './IIIFFragment.vue'
import { defaultAuthCondition } from '@/util/imageAuth'

// Define the component metadata
const meta: Meta<typeof IIIFFragment> = {
  title: 'Components/IIIFFragment',
  component: IIIFFragment,
  tags: ['autodocs'],
  argTypes: {
    iiif: {
      control: 'text',
      description: 'IIIF root URL'
    },
    fitToRegions: {
      control: 'boolean',
      description: 'Whether to fit the image to the regions'
    },
    size: {
      control: 'text',
      description: 'IIIF size parameter'
    },
    scale: {
      control: 'number',
      description: 'Scale down size parameter when printing image'
    },
    coords: {
      control: 'object',
      description: 'IIIF coordinates parameter'
    },
    regions: {
      control: 'object',
      description: 'Array of regions to highlight on the image'
    },
    matches: {
      control: 'object',
      description: 'Array of matches'
    },
    coordMinArea: {
      control: 'number',
      description: 'Minimum area of coordinates in square pixels'
    },
    authCondition: {
      description: 'Function to determine if authentication is required'
    }
  },
  parameters: {
    docs: {
      description: {
        component:
          'A component for displaying IIIF images with support for regions highlighting and authentication.'
      }
    }
  }
}

export default meta

type Story = StoryObj<typeof IIIFFragment>

const level1Url = 'https://www.scriptorium.ch/api/iiif-img/v3/4403740/info.json'
const level2Url =
  'https://iiif.eluxemburgensia.lu/image/iiif/3/ark:70795%2fzstfvp%2fpages%2f4/info.json'

// Basic story with default values
export const Default: Story = {
  args: {
    iiif: level2Url,
    fitToRegions: false,
    size: 'max',
    scale: 1,
    authCondition: defaultAuthCondition
  }
}

// Story with regions highlighted
export const WithRegions: Story = {
  args: {
    iiif: level2Url,
    fitToRegions: true,
    size: 'max',
    scale: 1,
    regions: [
      {
        coords: { x: 100, y: 100, w: 300, h: 200 }
      },
      {
        coords: { x: 500, y: 200, w: 200, h: 150 }
      }
    ],
    authCondition: defaultAuthCondition
  }
}

// Story with specific coordinates
export const WithCoordinates: Story = {
  args: {
    iiif: level2Url,
    size: 'max',
    scale: 1,
    coords: { x: 200, y: 150, w: 400, h: 300 },
    authCondition: defaultAuthCondition
  }
}

// Story with scaled down image
export const Scaled: Story = {
  args: {
    iiif: level2Url,
    size: 'max',
    scale: 0.5,
    authCondition: defaultAuthCondition
  }
}

export const Level1: Story = {
  args: {
    iiif: level1Url,
    fitToRegions: false,
    size: '!496,480',
    scale: 1,
    authCondition: () => false
  }
}

// Story showing error state
export const ErrorState: Story = {
  args: {
    iiif: 'https://non-existent-iiif-url.com/info.json',
    size: 'max',
    scale: 1,
    authCondition: defaultAuthCondition
  }
}
