<template>
  <button
    className="btn btn-link small"
    @click="getSpecialMembershipAccess"
    :disabled="isLoading || isModalVisible"
  >
    <span v-if="isLoading">Checking access option...</span>
    <span v-else-if="isModalVisible">requesting access...</span>
    <span v-else>check your request access</span>
  </button>

  <Teleport to="body">
    <SpecialMembershipRequestModal
      :isVisible="isModalVisible && specialMembershipAccessItem !== null"
      :item="specialMembershipAccessItem"
      @dismiss="handleModalDismiss"
    />
  </Teleport>
</template>
<script setup lang="ts">
import { specialMembershipAccess as specialMembershipAccessService } from '@/services'
import { onMounted, ref } from 'vue'
import SpecialMembershipAccessItem from './modules/lists/SpecialMembershipAccessItem.vue'
import { SpecialMembershipAccess } from '@/services/types'
import { computed } from 'vue'
import SpecialMembershipRequestModal from './specialMembership/SpecialMembershipRequestModal.vue'
export interface ContentItemAccessButtonProps {
  specialMembershipAccessBitPositions: number[]
}

const props = defineProps<ContentItemAccessButtonProps>()
const isLoading = ref(false)
const isAccessChecked = ref(false)
const isModalVisible = ref(false)
const specialMembershipAccessItem = ref<SpecialMembershipAccess | null>(null)

const handleModalDismiss = () => {
  console.info('[ContentItemAccessButton] Modal dismissed')
  isModalVisible.value = false
  isAccessChecked.value = true
}

const getSpecialMembershipAccess = async () => {
  console.info(
    '[ContentItemAccessButton] Requesting special membership access with bitmap positions:',
    props.specialMembershipAccessBitPositions
  )
  isLoading.value = true
  specialMembershipAccessService
    .find({
      query: {
        bitmapPositions: props.specialMembershipAccessBitPositions
      }
    })
    .then(response => {
      // Handle the response from the backend, e.g., show a success message or update the UI
      console.log(
        '[ContentItemAccessButton] Special membership access requested successfully:',
        response
      )
      if (Array.isArray(response.data) && response.data.length > 0) {
        isModalVisible.value = true
        specialMembershipAccessItem.value = response.data[0]
      } else {
        console.warn(
          '[ContentItemAccessButton] No special membership access items found for the given bitmap positions.'
        )
      }
    })
    .catch(error => {
      // Handle any errors that occur during the request
      console.error('[ContentItemAccessButton] Error requesting special membership access:', error)
    })
    .finally(() => {
      isLoading.value = false
      isAccessChecked.value = true
    })
}
</script>
