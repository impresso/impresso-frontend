<template>
  <button
    class="btn btn-link small"
    @click="getSpecialMembershipAccess"
    :disabled="isLoading || isModalVisible"
  >
    <span v-if="isLoading">{{ $t('actions.loading') }}</span>
    <span v-else-if="isModalVisible">{{ $t('actions.loading') }}</span>
    <span v-else>{{ $t(keyAccessLevel(currentAccessLevel)) }}</span>
  </button>

  <Teleport to="body">
    <InfoModal
      :isVisible="isModalVisible && !isSpecialMembershipsRequestsEnabled"
      @dismiss="handleModalDismiss"
      dialogClass="modal-md modal-dialog-centered"
      :modal-title="$t('specialMembershipRequestsDisabledTitle')"
    >
      <p class="m-0" v-html="$t('specialMembershipRequestsDisabled')"></p>
    </InfoModal>
    <SpecialMembershipRequestModal
      :isVisible="
        isSpecialMembershipsRequestsEnabled &&
        isModalVisible &&
        specialMembershipAccessItem !== null
      "
      :item="specialMembershipAccessItem"
      @dismiss="handleModalDismiss"
    />
  </Teleport>
</template>
<script setup lang="ts">
import { specialMembershipAccess as specialMembershipAccessService } from '@/services'
import { computed, ref } from 'vue'
import { SpecialMembershipAccess } from '@/services/types'
import SpecialMembershipRequestModal from './specialMembership/SpecialMembershipRequestModal.vue'
import { useUserStore } from '@/stores/user'
import type { Features } from '@/init'
import InfoModal from '@/components/InfoModal.vue'

export interface ContentItemAccessButtonProps {
  specialMembershipAccessBitPositions: number[]
  currentAccessLevel?: number
}

const accessLevelTranslationKeys: Record<number, string> = {
  0: 'noAccess',
  1: 'exploreOnly',
  2: 'exploreAndTranscript',
  3: 'fullAccess'
}

const props = withDefaults(defineProps<ContentItemAccessButtonProps>(), {
  currentAccessLevel: 1,
  hasMembershipAccess: false
})
const isLoading = ref(false)
const isAccessChecked = ref(false)
const isModalVisible = ref(false)
const specialMembershipAccessItem = ref<SpecialMembershipAccess | null>(null)

const userStore = useUserStore()

const isLoggedIn = computed(() => !!userStore.userData)
const isSpecialMembershipsRequestsEnabled = computed(() => {
  if (!isLoggedIn.value) {
    return false
  }
  const glob = window as any as { impressoFeatures: Features }
  if (!glob.impressoFeatures) {
    return false
  }
  if (!glob.impressoFeatures.specialMemberships) {
    return false
  }
  return glob.impressoFeatures.specialMembershipRequests?.enabled ?? false
})

const keyAccessLevel = (level: number): string => {
  const prefix = accessLevelTranslationKeys[level] || 'unknownAccessLevel'
  return prefix
}

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
<i18n lang="json">
{
  "en": {
    "noAccess": "No Access - apply for access",
    "exploreOnly": "Partial access - apply for full access",
    "exploreAndTranscript": "check your current access status",
    "fullAccess": "check your current access status",
    "unknownAccessLevel": "Unknown access level",
    "specialMembershipRequestsDisabledTitle": "Special Membership Requests Disabled",
    "specialMembershipRequestsDisabled": "Special membership requests are temporarily unavailable while we work on this feature.<br/>For further assistance, please contact us at <a href='mailto:info{'@'}impresso-project.ch'>info{'@'}impresso-project.ch</a>."
  }
}
</i18n>
