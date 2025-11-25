<template>
  <Modal
    :show="isVisible"
    :title="titleModal ?? title"
    modalClass="UserSpecialMembershipAccessModal"
    :dialogClass="props.dialogClass"
    bodyClass="p-0"
    @close="emit('dismiss')"
    hideBackdrop
    hideFooter
  >
    <ListOfFindResponseItems
      :error-loading-items-message="$t('errorLoadingSpecialMembershipAccess')"
      :list-is-empty-message="$t('listIsEmpty')"
      :service="specialMembershipAccessService"
      :title="$t('listTitle')"
    >
      <template #default="{ items }">
        <SpecialMembershipAccessItem
          class="p-2 border-bottom mb-2"
          :item="item"
          v-for="item in items"
          :key="item.id"
        />
      </template>
    </ListOfFindResponseItems>
  </Modal>
</template>

<i18n lang="json">
{
  "en": {
    "listIsEmpty": "No special membership access found.",
    "listTitle": "All available Special Membership Access",
    "errorLoadingSpecialMembershipAccess": "Error loading special membership access."
  }
}
</i18n>
<script setup lang="ts">
// This component show all user requests and allow to add a new one
import { ref } from 'vue'
import type { FeathersError } from '@feathersjs/errors'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import { specialMembershipAccess as specialMembershipAccessService } from '@/services'
import SpecialMembershipAccessItem from '../modules/lists/SpecialMembershipAccessItem.vue'
import ListOfFindResponseItems from '../ListOfFindResponseItems.vue'

export type SpecialMembershipAccessModalProps = {
  dialogClass?: string
  title?: string
  titleModal?: string
  isVisible?: boolean
  isLoading?: boolean
}

const isLoading = ref(false)
const error = ref<FeathersError | null>(null)

const props = withDefaults(defineProps<SpecialMembershipAccessModalProps>(), {
  dialogClass: 'modal-dialog-scrollable modal-md p-0 modal-dialog-centered',
  title: 'Request Special Membership Access'
})

const emit = defineEmits<{
  dismiss: []
  success: []
}>()
</script>

<style></style>
