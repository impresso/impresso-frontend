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
    <ListOfFindResponseItems
      :error-loading-items-message="$t('errorLoadingSpecialMembershipRequests')"
      :list-is-empty-message="$t('listIsEmpty')"
      :service="serviceByMode"
      :title="$t('listTitle')"
    >
      <template #beforeHeader>
        <b-tabs pills class="mb-0 mt-0 SpecialMembershipModal__tabs">
          <template v-slot:tabs-end>
            <li class="nav-item" v-for="modeOption in AvailableModes" :key="modeOption">
              <button
                size="sm"
                class="w-100 btn btn-transparent nav-link"
                :class="{ active: mode === modeOption }"
                @click="mode = modeOption"
              >
                {{ $t(modeOption) }}
              </button>
            </li>
          </template>
        </b-tabs>

        <slot name="specialMembershipAccess"></slot>
      </template>
      <template #default="{ items }">
        <div class="p-2 border-bottom mb-2" v-for="item in items" :key="item.id">
          <SpecialMembershipRequestItem
            v-if="mode === ModeUserSpecialMembershipRequests"
            :item="item"
          />
          <SpecialMembershipAccessItem
            v-else-if="mode === ModeSpecialMembershipAccess"
            :item="item"
          />
        </div>
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
    "listIsEmpty": "No special membership access requests found.",
    "listTitle": "Your Special Membership Access Requests",
    "ModeUserSpecialMembershipRequests": "Your requests",
    "ModeSpecialMembershipAccess": "All Special Membership Access"
  }
}
</i18n>
<script setup lang="ts">
// This component show all user requests and allow to add a new one
import { computed, ref } from 'vue'
import type { FeathersError } from '@feathersjs/errors'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import {
  userSpecialMembershipRequests as userSpecialMembershipRequestsService,
  specialMembershipAccess as specialMembershipAccessService
} from '@/services'
import SpecialMembershipRequestItem from '../modules/lists/SpecialMembershipRequestItem.vue'
import SpecialMembershipAccessItem from '../modules/lists/SpecialMembershipAccessItem.vue'
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

const ModeUserSpecialMembershipRequests = 'ModeUserSpecialMembershipRequests'
const ModeSpecialMembershipAccess = 'ModeSpecialMembershipAccess'
const AvailableModes = [ModeSpecialMembershipAccess, ModeUserSpecialMembershipRequests]
const mode = ref<(typeof AvailableModes)[number]>(ModeSpecialMembershipAccess)
const serviceByMode = computed(() => {
  return mode.value === ModeUserSpecialMembershipRequests
    ? userSpecialMembershipRequestsService
    : specialMembershipAccessService
})
const emit = defineEmits<{
  dismiss: []
  success: []
}>()
</script>

<style></style>
