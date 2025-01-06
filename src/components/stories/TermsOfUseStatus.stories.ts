import type { Meta, StoryObj } from '@storybook/vue3'
import TermsOfUseStatus from '@/components/TermsOfUseStatus.vue'
import AcceptTermsOfUse from '@/components/AcceptTermsOfUse.vue'
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const meta: Meta<typeof TermsOfUseStatus> = {
  title: 'Components/TermsOfUseStatus',
  component: TermsOfUseStatus,
  tags: ['autodocs'],
  render: args => {
    const userStore = useUserStore()

    return {
      setup() {
        return { args }
      },
      methods: {
        toggleAcceptTermsDate() {
          if (userStore.acceptTermsDate) {
            userStore.acceptTermsDate = null
          } else {
            userStore.acceptTermsDate = new Date().toISOString()
          }
        }
      },
      computed: {
        acceptTermsDate: () => userStore.acceptTermsDate
      },
      components: { TermsOfUseStatus, AcceptTermsOfUse },
      template:
        '<div style="height: 400px; width: 100%"><TermsOfUseStatus v-bind="args"></TermsOfUseStatus><AcceptTermsOfUse></AcceptTermsOfUse><pre>stored value:{{acceptTermsDate}}</pre><button v-on:click="toggleAcceptTermsDate">Test toggle accept</button></div>'
    }
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {}
}
