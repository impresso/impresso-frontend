import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Login from './Login.vue'

const meta: Meta<typeof Login> = {
  title: 'institutions-access/views/Login',
  component: Login,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: {
        Login
      },
      template: `
        <div id="InstitutionsAccess" style="padding: 0 24px; background: var(--impresso-color-paper); min-height: 100dvh">
          <Login v-bind="args" />
        </div>
      `
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
