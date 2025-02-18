import type { Meta, StoryObj } from '@storybook/vue3'
import AuthImg from '../AuthImg.vue'

const meta: Meta<typeof AuthImg> = {
  title: 'Components/AuthImg',
  component: AuthImg,
  argTypes: {
    src: { control: 'text' }
  },
  tags: ['autodocs'],
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
