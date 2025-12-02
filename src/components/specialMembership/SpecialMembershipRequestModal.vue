<template>
  <Modal
    :show="isVisible"
    :title="titleModal ?? title"
    modalClass="SpecialMembershipRequestModal"
    :dialogClass="props.dialogClass"
    bodyClass="p-0"
    @close="emit('dismiss')"
    hideFooter
  >
    <SpecialMembershipAccessItem :item="props.item" />
    <SpecialMembershipRequestForm
      class="p-3"
      :isLoading="isLoading"
      :specialMembershipAccess="props.item"
      @dismiss="emit('dismiss')"
      @submit="onSubmitHandler"
    >
      <FeathersErrorManager v-if="error" :error="error" class="m-3" />
    </SpecialMembershipRequestForm>
  </Modal>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import { SpecialMembershipAccess } from '@/services/types'
import SpecialMembershipRequestForm, {
  SpecialMembershipRequestFormPayload
} from './SpecialMembershipRequestForm.vue'
import type { FeathersError } from '@feathersjs/errors'
import { userSpecialMembershipRequests as userSpecialMembershipRequestsService } from '@/services'
import SpecialMembershipAccessItem from '../modules/lists/SpecialMembershipAccessItem.vue'
import FeathersErrorManager from '../FeathersErrorManager.vue'

export type SpecialMembershipRequestModalProps = {
  item?: SpecialMembershipAccess
  dialogClass?: string
  title?: string
  titleModal?: string
  isVisible?: boolean
}

const props = withDefaults(defineProps<SpecialMembershipRequestModalProps>(), {
  dialogClass: ' modal-md p-0 modal-dialog-centered',
  title: 'Request Special Membership Access'
})
const isLoading = ref(false)
const error = ref<FeathersError | null>(null)
const emit = defineEmits<{
  dismiss: []
  success: []
}>()

const onSubmitHandler = async (payload: SpecialMembershipRequestFormPayload) => {
  if (!props.item) {
    console.error('No special membership access provided')
    return
  }
  error.value = null
  isLoading.value = true
  await userSpecialMembershipRequestsService
    .create({
      specialMembershipAccessId: props.item.id,
      notes: payload.notes
    })
    .then(() => {
      console.debug('Special membership request created successfully')
      emit('success')
    })
    .catch(err => {
      console.error('Failed to create special membership request:', err)
      error.value = err as FeathersError
    })
  isLoading.value = false
}
</script>
