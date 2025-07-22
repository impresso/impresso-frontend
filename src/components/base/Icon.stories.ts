import type { Meta, StoryObj } from '@storybook/vue3'
import Icon from './Icon.vue'

const meta: Meta<typeof Icon> = {
  title: 'Base/Icon',
  component: Icon,
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: [
        'slack',
        'search',
        'play',
        'edit',
        'check',
        'checkSquareSolid',
        'chevron',
        'copy',
        'copyright',
        'discord',
        'linkedin',
        'cross',
        'key',
        'label',
        'position',
        'profileCircle',
        'text',
        'textSquare',
        'warningTriangle',
        'sendMail',
        'info',
        'language',
        'checkSquare',
        'square',
        'textBox',
        'timer',
        'journal',
        'warningCircle',
        'cubeDots',
        'bsky',
        'newsagency',
        'organisation',
        'sourceType',
        'sourceMedium'
      ]
    },
    scale: {
      control: 'number',
      defaultValue: 1
    },
    width: {
      control: 'number',
      defaultValue: 24
    },
    height: {
      control: 'number',
      defaultValue: 24
    },
    strokeWidth: {
      control: 'number',
      defaultValue: 1
    }
  }
}

export default meta
type Story = StoryObj<typeof Icon>

export const Default: Story = {
  args: {
    name: 'search'
  }
}

export const Newsagency: Story = {
  args: {
    name: 'newsagency'
  }
}

export const Organisation: Story = {
  args: {
    name: 'organisation'
  }
}

export const SourceType: Story = {
  args: {
    name: 'sourceType'
  }
}

export const SourceMedium: Story = {
  args: {
    name: 'sourceMedium'
  }
}

export const Scaled: Story = {
  args: {
    name: 'newsagency',
    scale: 2
  }
}

export const IconGrid: Story = {
  render: () => ({
    components: { Icon },
    template: `
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
        <div v-for="icon in icons" :key="icon" style="display: flex; flex-direction: column; align-items: center; padding: 10px; border: 1px solid #eee; border-radius: 4px;">
          <Icon :name="icon" :scale="1.5" />
          <span style="margin-top: 10px; font-size: 12px;">{{ icon }}</span>
        </div>
      </div>
    `,
    setup() {
      const icons = [
        'slack',
        'search',
        'play',
        'edit',
        'check',
        'checkSquareSolid',
        'chevron',
        'copy',
        'copyright',
        'discord',
        'linkedin',
        'cross',
        'key',
        'label',
        'position',
        'profileCircle',
        'text',
        'textSquare',
        'warningTriangle',
        'sendMail',
        'info',
        'language',
        'checkSquare',
        'square',
        'textBox',
        'timer',
        'journal',
        'warningCircle',
        'cubeDots',
        'bsky',
        'newsagency',
        'organisation',
        'sourceType',
        'sourceMedium'
      ]
      return { icons }
    }
  })
}
