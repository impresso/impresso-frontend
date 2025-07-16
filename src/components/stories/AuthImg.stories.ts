import type { Meta, StoryObj } from '@storybook/vue3'
import AuthImg from '../AuthImg.vue'

const meta: Meta<typeof AuthImg> = {
  title: 'Components/AuthImg',
  component: AuthImg,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A drop-in replacement for the <img> tag that fetches images with authorization headers when needed and implements lazy loading.'
      }
    }
  },
  argTypes: {
    src: {
      control: 'text',
      description: 'The URL of the image to load'
    },
    authCondition: {
      description: 'Optional function to determine if auth headers are needed for the given URL'
    }
  },
  render: args => ({
    components: { AuthImg },
    setup() {
      return { args }
    },
    template: '<AuthImg v-bind="args" />'
  })
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    src: 'https://picsum.photos/200'
  }
}

export const NotExists: Story = {
  args: {
    src: 'https://foobar'
  }
}

export const LazyLoading: Story = {
  args: {
    src: 'https://picsum.photos/800/400'
  },
  render: args => ({
    components: { AuthImg },
    setup() {
      return { args }
    },
    template: `
      <div style="height: 400px; width: 100%; overflow-y: auto; border: 1px solid #ccc; padding: 20px;">
        <div style="height: 600px; display: flex; align-items: center; justify-content: center; background: #f0f0f0;">
          Scroll down to see the lazy-loaded image
        </div>
        <AuthImg v-bind="args" style="max-width: 100%;" />
        <div style="height: 200px;"></div>
      </div>
    `
  })
}

export const WithCustomAuthCondition: Story = {
  args: {
    src: 'https://example.com/public-image.jpg',
    authCondition: (url: string) => url.includes('private')
  }
}
