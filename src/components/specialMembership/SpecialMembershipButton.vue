<template>
  <button
    :class="`UserSpecialmembershipRequestButton btn btn-sm btn-outline-primary ${className}`"
    @click="() => (viewStore.view = ViewSpecialMembership)"
  >
    <span v-if="item">{{ item.title }}</span>
    <span v-else>Request Special Membership Access</span>
  </button>

  <SpecialMembershipModal :isVisible="isModalVisible" @dismiss="() => viewStore.resetView()">
    <template #specialMembershipAccess v-if="item">
      <div class="mx-3 mt-3 pb-3 border-bottom">
        <p>Request for access could take 3 working days on average.</p>
        <div
          class="rounded-md shadow-sm p-3 border d-flex align-items-center gap-2 justify-content-between"
        >
          <SpecialMembershipAccessItem :item="item" v-if="item" />
          <button
            class="btn btn-sm btn-outline-secondary"
            @click="() => handleOnSubmit(item)"
            v-if="isLoggedIn"
          >
            {{ $t('request access') }}
          </button>
        </div>
      </div>
    </template>
  </SpecialMembershipModal>
</template>
<script setup lang="ts">
import { SpecialMembershipAccess } from '@/services/types'
import { useViewsStore } from '@/stores/views'
import { computed, ref } from 'vue'
import { ViewSpecialMembership } from '@/constants'
import { useUserStore } from '@/stores/user'
import type { FeathersError } from '@feathersjs/errors'
import SpecialMembershipModal from './SpecialMembershipModal.vue'
import SpecialMembershipAccessItem from '../modules/lists/SpecialMembershipAccessItem.vue'
import { userSpecialMembershipRequests as userSpecialMembershipRequestsService } from '@/services'

export interface SpecialMembershipButtonProps {
  item?: SpecialMembershipAccess
  className?: string
}

defineProps<SpecialMembershipButtonProps>()

const viewStore = useViewsStore()
const userStore = useUserStore()
const isLoading = ref(false)
const error = ref<FeathersError | null>(null)

const isModalVisible = computed(() => viewStore.view === ViewSpecialMembership)
const isLoggedIn = computed(() => !!userStore.userData)

function handleOnSubmit(specialMembershipAccess: SpecialMembershipAccess) {
  isLoading.value = true
  console.debug('[UserSpecialMembershipRequestModal] handleOnSubmit', specialMembershipAccess)
  userSpecialMembershipRequestsService
    .create({
      specialMembershipAccess: specialMembershipAccess,
      ignoreErrors: true
    })
    .then((res: any) => {
      console.debug('[UserSpecialMembershipRequestModal] Request submitted successfully', res)
    })
    .catch((err: FeathersError) => {
      error.value = err
      console.error('[UserSpecialMembershipRequestModal] Error submitting request:', err)
    })
    .finally(() => {
      isLoading.value = false
    })
}
</script>
