import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TermsOfUseModalHost from '@/components/TermsOfUseModalHost.vue'
import { useUserStore } from '@/stores/user'
import { useViewsStore } from '@/stores/views'
import User from '@/models/User'

/**
 * The single owner of the Terms of Use modal: markup, acceptance flow, and the
 * "must accept" rule. Mount it once only, the way Modals.vue does, otherwise
 * the duplicate `.modal` / `.modal-backdrop` pair stacks up.
 *
 * Stories drive the store directly rather than clicking a button, since the
 * component no longer renders a trigger. `viewsStore.view = ViewTermsOfUse` is
 * the way to open it from elsewhere in the app, e.g. via LinkToModal.
 */
type UserStore = ReturnType<typeof useUserStore>

const render = (setup: (userStore: UserStore) => void) => () => ({
  setup() {
    const viewsStore = useViewsStore()
    const userStore = useUserStore()
    viewsStore.resetView()
    setup(userStore)
    return { viewsStore, userStore }
  },
  components: { TermsOfUseModalHost },
  template: `
      <div style="min-height: 100vh; padding: 2rem">
        <p>Current view: {{ viewsStore.view ?? 'null' }}</p>
        <p>Logged in: {{ !!userStore.userData }}</p>
        <p>ToU status checked: {{ userStore.termsOfUseChecked }}</p>
        <p>Accepted on localStorage: {{ userStore.acceptTermsDateOnLocalStorage ?? 'no' }}</p>
      </div>
      <TermsOfUseModalHost />
    `
})

const asGuest = (acceptTermsDateOnLocalStorage: string | null) => (userStore: UserStore) => {
  userStore.setUserData(false)
  userStore.acceptTermsDate = null
  userStore.acceptTermsDateOnLocalStorage = acceptTermsDateOnLocalStorage
  userStore.termsOfUseChecked = true
}

const meta: Meta<typeof TermsOfUseModalHost> = {
  title: 'Components/TermsOfUseModalHost',
  component: TermsOfUseModalHost,
  tags: ['autodocs'],
  render: render(asGuest(null))
}

export default meta
type Story = StoryObj<typeof meta>

/** Guest without any prior acceptance: no way out until the box is checked. */
export const AsGuest: Story = {}

/** Guest that already accepted on this device: close controls are available. */
export const AsGuestAlreadyAccepted: Story = {
  render: render(asGuest(new Date().toISOString()))
}

/**
 * Logged-in user whose ToU status is resolved and unaccepted. The modal opens
 * on mount, before any interaction.
 */
export const LoggedInMustAccept: Story = {
  render: render(userStore => {
    userStore.setUserData(new User({ uid: 'story-user' }))
    userStore.acceptTermsDate = null
    userStore.acceptTermsDateOnLocalStorage = null
    userStore.termsOfUseChecked = true
  })
}

/**
 * Logged-in user who already accepted. The modal stays closed: the rule keys
 * off the server date, not the localStorage one.
 */
export const LoggedInAlreadyAccepted: Story = {
  render: render(userStore => {
    userStore.setUserData(new User({ uid: 'story-user' }))
    userStore.acceptTermsDate = new Date().toISOString()
    userStore.acceptTermsDateOnLocalStorage = new Date().toISOString()
    userStore.termsOfUseChecked = true
  })
}

/**
 * `termsOfUseChecked` still false, i.e. the ToU lookup has not resolved yet.
 * Nothing opens, which is what prevents a flash for users who already accepted.
 */
export const BeforeToUCheckResolves: Story = {
  render: render(userStore => {
    userStore.setUserData(new User({ uid: 'story-user' }))
    userStore.acceptTermsDate = null
    userStore.acceptTermsDateOnLocalStorage = null
    userStore.termsOfUseChecked = false
  })
}
