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
    <List :items="serviceResponse.data" class="m-0">
      <template #empty>
        <div class="p-3">
          <Alert type="info" class="m-0"> No special membership access requests found. </Alert>
        </div>
      </template>
      <template #loading>
        <div class="p-3">
          <LoadingBlock />
        </div>
      </template>
      <template #default>
        <SpecialMembershipRequestItem
          class="p-3 mb-2 border-bottom"
          :item="item"
          v-for="item in serviceResponse.data"
          :key="item.specialMembershipAccessId"
        />
      </template>
    </List>
    <template v-slot:modal-footer>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="emit('dismiss')">
        close
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
// This component show all user requests and allow to add a new one
import { computed, ref, watch } from 'vue'
import type { FeathersError } from '@feathersjs/errors'
import Alert from 'impresso-ui-components/components/Alert.vue'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import { userSpecialMembershipRequests as userSpecialMembershipRequestsService } from '@/services'
import { UserSpecialMembershipRequest } from '@/services/types'
import { useUserStore } from '@/stores/user'
import List from '../modules/lists/List.vue'
import SpecialMembershipRequestItem from '../modules/lists/SpecialMembershipRequestItem.vue'

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

function handleOnSubmit(payload: UserSpecialMembershipRequest) {
  isLoading.value = true
  console.debug('[UserSpecialMembershipRequestModal] handleOnSubmit', payload)
  userSpecialMembershipRequestsService
    .create(payload, {
      ignoreErrors: true
    })
    .then((res: any) => {
      console.debug('[UserSpecialMembershipRequestModal] Request submitted successfully', res)
      emit('success')
    })
    .catch((err: FeathersError) => {
      error.value = err
      console.error('[UserSpecialMembershipRequestModal] Error submitting request:', err)
    })
    .finally(() => {
      isLoading.value = false
    })
}
const emit = defineEmits(['dismiss', 'success'])

const serviceResponse = ref<{
  data: UserSpecialMembershipRequest[]
  pagination: { total: number; offset: number; limit: number }
  status: 'idle' | 'loading' | 'success' | 'error'
}>({
  status: 'idle',
  pagination: { total: 0, offset: 0, limit: 0 },
  data: []
})

const fetchUserSpecialMembershipRequests = async () => {
  console.debug('[Modals] fetchUserSpecialMembershipRequests')

  serviceResponse.value = {
    data: [],
    status: 'loading',
    pagination: serviceResponse.value.pagination
  }

  // fetch user requests
  userSpecialMembershipRequestsService
    .find()
    .then(({ data, pagination }) => {
      console.info('[Modals] @useEffect - userRequestsService', data)
      serviceResponse.value = { data, status: 'success', pagination }
    })
    .catch((err: FeathersError) => {
      console.error('[Modals] @useEffect - userRequestsService', err.message, err.data, err.code)
      serviceResponse.value = {
        data: [],
        status: 'error',
        pagination: serviceResponse.value.pagination
      }
    })
  // fetch subscription datasets
}

watch(
  () => props.isVisible,
  isVisible => {
    if (isVisible && serviceResponse.value.status === 'idle') {
      console.debug('[SpecialMembershipModal] Modal is visible, fetching user requests')
      fetchUserSpecialMembershipRequests()
    }
  }
)
</script>

<style></style>
