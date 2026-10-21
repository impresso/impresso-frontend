<template>
  <TermsOfUseModal :isVisible="isVisible" :canDismiss="hasAcceptedTerms" @dismiss="resetView">
    <template v-slot:terms-of-use-status>
      <Alert
        :type="hasAcceptedTerms ? 'info' : 'warning'"
        class="bg-info mb-3"
        style="position: sticky; top: 0"
      >
        <TermsOfUseStatus />
      </Alert>
    </template>
    <template v-slot:accept-terms-of-use>
      <AcceptTermsOfUse
        :is-loading="isPatchingAcceptTermsDate"
        :checked="hasAcceptedTerms"
        :disabled="hasAcceptedTerms"
        @change="onAcceptChange"
      />
    </template>
  </TermsOfUseModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { termsOfUse as termsOfUseService } from '@/services'
import { ViewTermsOfUse } from '@/constants'
import { useViewsStore } from '@/stores/views'
import { useUserStore } from '@/stores/user'
import TermsOfUseModal from './TermsOfUseModal.vue'
import TermsOfUseStatus from './TermsOfUseStatus.vue'
import AcceptTermsOfUse from './AcceptTermsOfUse.vue'
import Alert from './Alert.vue'

/**
 * Single owner of the Terms of Use modal: the markup, the acceptance flow, and
 * the "must accept" rule that opens the modal for a logged-in user whose ToU
 * status is known and unaccepted.
 *
 * Mount this exactly once (in Modals.vue). BModal renders a `.modal` plus a
 * `.modal-backdrop` per instance, so a second mount would stack a duplicate
 * dialog on top of this one. Triggers are the safe thing to have in several
 * places: they only set `viewsStore.view`, which is idempotent. Use
 * LinkToModal for those, or any handler doing `viewsStore.view = ViewTermsOfUse`.
 */
const viewsStore = useViewsStore()
const userStore = useUserStore()

// Visibility is derived from the store, never owned locally, so the modal
// opens no matter who triggered it.
const isVisible = computed(() => viewsStore.view === ViewTermsOfUse)
const isLoggedIn = computed(() => !!userStore.userData)
// date of accepting the ToU on localStorage
const acceptTermsDateOnLocalStorage = computed(() => userStore.acceptTermsDateOnLocalStorage)
// date of accepting the ToU on current store (sort of cached value)
const acceptTermsDate = computed(() => userStore.acceptTermsDate)
// Effective acceptance used only for UX (dismiss button + checkbox state).
// For logged-in users only the legally-binding DB date counts; for guests the
// temporary local acceptance is enough to let them dismiss.
const hasAcceptedTerms = computed(() =>
  isLoggedIn.value
    ? !!acceptTermsDate.value
    : !!(acceptTermsDate.value || acceptTermsDateOnLocalStorage.value)
)

// A logged-in user must accept the ToU. `termsOfUseChecked` keeps the modal
// from flashing open for users who already accepted but whose date has not
// been fetched back yet. Guests are excluded: they get the call to action in
// TermsOfUseStatus instead, and cannot be forced into a binding acceptance.
const mustAcceptTerms = computed(
  () => isLoggedIn.value && userStore.termsOfUseChecked && acceptTermsDate.value === null
)

const isPatchingAcceptTermsDate = ref(false)

const open = () => {
  console.debug('[TermsOfUseModalHost] open')
  viewsStore.view = ViewTermsOfUse
}

// registered after `open` because `immediate: true` invokes the callback
// during setup, before a later `const` would be initialized.
watch(
  mustAcceptTerms,
  mustAccept => {
    console.debug('[TermsOfUseModalHost] @watch mustAcceptTerms', mustAccept)
    if (mustAccept && viewsStore.view === null) {
      open()
    }
  },
  { immediate: true }
)

const resetView = () => {
  viewsStore.view = null
}

const onAcceptChange = (event: Event) => {
  const isChecked = (event.target as HTMLInputElement).checked
  console.debug('[TermsOfUseModalHost] AcceptTermsOfUse@onChange', isChecked)
  if (isChecked) {
    patchAcceptTermsDate()
  }
}

const patchAcceptTermsDate = async () => {
  if (!isLoggedIn.value) {
    console.debug('[TermsOfUseModalHost] patchAcceptTermsDate not authenticated')
    userStore.acceptTermsDateOnLocalStorage = new Date().toISOString()
    return
  }
  isPatchingAcceptTermsDate.value = true
  termsOfUseService
    .patch(null, {})
    .then(data => {
      console.debug(
        '[TermsOfUseModalHost] patchAcceptTermsDate call termsOfUseService.patch() success:',
        data.dateAcceptedTerms
      )
      // update with the latest value
      userStore.setAcceptTermsDate(
        data.dateAcceptedTerms ? new Date(data.dateAcceptedTerms).toISOString() : null
      )
    })
    .finally(() => {
      isPatchingAcceptTermsDate.value = false
    })
}
</script>
