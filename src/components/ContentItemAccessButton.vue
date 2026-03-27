<template>
  <button type="button" class="btn-rounded mt-2 btn btn-outline-secondary btn-sm">
    Request Special Membership
  </button>

  <SpecialMembershipAccessItem
    v-for="item in specialMembershipAccessItems"
    :key="item.id"
    :item="item"
    withActions
    @request-access="requestAccess"
  />
</template>
<script setup lang="ts">
import { specialMembershipAccess as specialMembershipAccessService } from '@/services'
import { onMounted, ref } from 'vue'
import SpecialMembershipAccessItem from './modules/lists/SpecialMembershipAccessItem.vue'
import { SpecialMembershipAccess } from '@/services/types'
import { useViewsStore } from '@/stores/views'
export interface ContentItemAccessButtonProps {
  specialMembershipAccessBitPositions: number[]
}

const props = defineProps<ContentItemAccessButtonProps>()
const isLoading = ref(false)
const specialMembershipAccessItems = ref<SpecialMembershipAccess[]>([])
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
      specialMembershipAccessItems.value = response.data
    })
    .catch(error => {
      // Handle any errors that occur during the request
      console.error('[ContentItemAccessButton] Error requesting special membership access:', error)
    })
    .finally(() => {
      isLoading.value = false
    })
}

const emit = defineEmits<{
  (e: 'request-access', item: SpecialMembershipAccess): void
}>()

const requestAccess = (item: SpecialMembershipAccess) => {
  emit('request-access', item)
  useViewsStore().openSpecialMembershipModal(item)
}

onMounted(async () => {
  // You can perform any necessary setup here, such as checking the current access status
  console.debug(
    '[ContentItemAccessButton] @mounted with bitmap positions:',
    props.specialMembershipAccessBitPositions
  )
  await getSpecialMembershipAccess()
})
</script>
