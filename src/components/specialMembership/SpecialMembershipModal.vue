<template>
  <Modal
    :show="isVisible"
    :title="titleModal ?? title"
    modalClass="UserSpecialMembershipRequestModal"
    :dialogClass="props.dialogClass"
    bodyClass="p-0"
    @close="emit('dismiss')"
    hideBackdrop
  >
    <slot name="specialMembershipAccess"></slot>
    <ListOfFindResponseItems
      :error-loading-items-message="$t('errorLoadingSpecialMembershipRequests')"
      :service="userSpecialMembershipRequestsService"
    >
      <template #default="{ items }">
        <SpecialMembershipRequestItem
          class="p-2 border-bottom mb-2"
          :item="item"
          v-for="item in items"
          :key="item.specialMembershipAccessId"
        />
      </template>
    </ListOfFindResponseItems>
    <template v-slot:modal-footer>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="emit('dismiss')">
        close
      </button>
    </template>
  </Modal>
</template>

<i18n lang="json">
{
  "en": {
    "requestSpecialMembershipAccess": "Request Special Membership Access",
    "your special membership access requests": "Your Special Membership Access Requests",
    "errorLoadingSpecialMembershipRequests": "Error loading special membership requests.",
    "listIsEmpty": "No special membership access requests found."
  }
}
</i18n>
<script setup lang="ts">
// This component show all user requests and allow to add a new one
import { ref } from 'vue'
import type { FeathersError } from '@feathersjs/errors'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import { userSpecialMembershipRequests as userSpecialMembershipRequestsService } from '@/services'
import SpecialMembershipRequestItem from '../modules/lists/SpecialMembershipRequestItem.vue'
import ListOfFindResponseItems from '../ListOfFindResponseItems.vue'

export type SpecialMembershipModalProps = {
  dialogClass?: string
  title?: string
  titleModal?: string
  isVisible?: boolean
  isLoading?: boolean
}

const isLoading = ref(false)
const error = ref<FeathersError | null>(null)

const props = withDefaults(defineProps<SpecialMembershipModalProps>(), {
  dialogClass: 'modal-dialog-scrollable modal-md p-0 modal-dialog-centered',
  title: 'Request Special Membership Access'
})

const emit = defineEmits<{
  dismiss: []
  success: []
}>()
</script>

<style></style>
