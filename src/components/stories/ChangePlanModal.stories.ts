import type { Meta, StoryObj } from '@storybook/vue3'
import ChangePlanModal from '@/components/ChangePlanModal.vue'
import { AvailablePlans, PlanLabels, PlanNone } from '@/constants'
import { UserChangePlanRequest } from '@/services/types'
import type { ChangePlanModalProps } from '@/components/ChangePlanModal.vue'
import { http, HttpResponse } from 'msw'
import { useUserStore } from '@/stores/user'
import { computed, ref } from 'vue'

const meta: Meta<typeof ChangePlanModal> = {
  title: 'Components/ChangePlanModal',
  component: ChangePlanModal,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: { ChangePlanModal },
      template:
        '<div style="height: 400px; width: 100%"><ChangePlanModal v-bind="args">Test</ChangePlanModal></div>'
    }
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { show: true, title: 'Change your plan' } as ChangePlanModalProps,
  parameters: {
    msw: {
      handlers: {
        userChangePlanRequest: http.get('/api/user-change-plan-request', () => {
          return HttpResponse.json({ message: 'NotFound', code: 404 }, { status: 404 })
        })
      }
    }
  }
}

export const WithConditionalAutomaticPopup: Story = {
  args: {
    title: 'Change your plan',
    automaticPopup: true,
    planLabels: PlanLabels,
    availablePlans: AvailablePlans
  },
  render: args => {
    return {
      setup() {
        const userStore = useUserStore()
        userStore.$reset() // 👈 resets to initial state
        // userPlan is computed from the user groups as getter in the user store
        const userPlan = computed(() => userStore.userPlan)
        // isLoggedIn is true if the userData is not false (sic)
        const isLoggedIn = computed(() => userStore.userData)
        const hasPendingChangePlanRequest = computed(() => userStore.hasPendingChangePlanRequest)
        // view is normally stored in a pinia store, but here we use a local ref for simplicity
        const view = ref(null)
        // initSequenceDone is a boolean that indicates if the initial sequence of the notifications store is done,
        // here we use again a ref for simplicity
        const isInitSequenceDone = ref(true)
        const showChangePlanToLegacyUsers = computed(() => {
          // if the user is logged in and has a plan, show the change plan modal
          return (
            view.value === null &&
            isInitSequenceDone.value &&
            isLoggedIn.value &&
            userPlan.value === PlanNone &&
            !userStore.hasPendingChangePlanRequest
          )
        })

        return { args, view, showChangePlanToLegacyUsers, userPlan, hasPendingChangePlanRequest }
      },
      components: { ChangePlanModal },
      template: `<div style="height: 400px; width: 100%">
      <p v-if="!showChangePlanToLegacyUsers">
        Values:
        <br />
        userPlan: {{ userPlan }}
        <br />
        isLoggedIn: {{ isLoggedIn }}
        <br />
        hasPendingChangePlanRequest: {{ hasPendingChangePlanRequest }}
        <br />
        view: {{ view }}  
        <br />
        isInitSequenceDone: {{ isInitSequenceDone }}
        <br />
        showChangePlanToLegacyUsers: {{ showChangePlanToLegacyUsers }}
        
      </p>
          <ChangePlanModal
      :show="showChangePlanToLegacyUsers"
      :title="$t(userPlan === PlanNone ? 'Select a plan' : 'Change Plan')"
      @dismiss="resetView"
      @success="() => changeView(ViewConfirmChangePlanRequest)"
      :submitLabel="$t('Confirm your plan selection')"
    >
      <div v-if="userPlan !== PlanGuest && userPlan !== PlanNone">
        <p>
          You can request to change your plan any time if your situation changed. More information
          about the plans can be found in the
          <LinkToModal :view="ViewPlans">Plans page</LinkToModal>.
        </p>
        <p v-if="userPlan !== PlanNone">
          Your current plan is <b> {{ PlanLabels[userPlan] }} </b>. <br />
          Please select the plan you want to change to:
        </p>
      </div>
      <div v-if="userPlan === PlanNone">
        <h4>Important Update: Please Select Your Plan</h4>
        <p>
          We've recently updated our website's architecture and Terms of Use to improve how you
          access transcripts, facsimiles, and audio files.
        </p>
        <p>
          To ensure continued access to these features, please take a moment to select the plan that
          best reflects your status (Student or Academic Staff).
        </p>
      </div>
    </ChangePlanModal></div>`
    }
  }
}

export const WithPendingRequest: Story = {
  args: {
    show: true,
    title: 'Change your plan'
  } as ChangePlanModalProps
}

export const WithRejectedRequest: Story = {
  args: {
    title: 'Change your plan',
    show: true
  },
  parameters: {
    msw: {
      handlers: {
        userChangePlanRequest: http.get('/api/user-change-plan-request', () => {
          return HttpResponse.json({
            id: 1,
            plan: {
              id: 2,
              name: AvailablePlans[1]
            },
            status: 'rejected',
            dateCreated: new Date().toISOString(),
            dateLastModified: new Date().toISOString(),
            changelog: []
          } as UserChangePlanRequest)
        })
      }
    }
  }
}

export const WithApprovedRequest: Story = {
  args: {
    title: 'Change your plan',
    show: true
  },
  parameters: {
    msw: {
      handlers: {
        userChangePlanRequest: http.get('/api/user-change-plan-request', () => {
          return HttpResponse.json({
            id: 1,
            plan: {
              id: 2,
              name: AvailablePlans[1]
            },
            status: 'approved',
            dateCreated: new Date().toISOString(),
            dateLastModified: new Date().toISOString(),
            changelog: []
          } as UserChangePlanRequest)
        })
      }
    }
  }
}
