<template>
  <Modal
    :show="isVisible"
    :title="titleModal ?? title"
    modalClass="SpecialMembershipRequestModal"
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
      :params="{
        query: {
          limit: 10
        }
      }"
    >
      <template #header>
        <div class="p-2">
          <div class="container-fluid">
            <div class="row">
              <div class="col-7 small">
                {{ $t('specialMembershipAccessTitle') }}
              </div>
              <div class="col-5 small">{{ $t('userSpecialMembershipRequestsStatus') }}</div>
            </div>
          </div>
        </div>
      </template>
      <template #beforeHeader>
        <b-tabs pills class="mb-0 mt-0 SpecialMembershipModal__tabs mx-2 border-bottom">
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

        <slot name="specialMembershipAccess">
          <form
            class="form p-4"
            v-if="specialMembershipAccessToRequest"
            @submit.prevent="createRequest"
          >
            <p
              v-html="
                $t('userRequestSpecialMembershipAccess', {
                  title: specialMembershipAccessToRequest.title
                })
              "
            ></p>
            <textarea
              class="form-control form-control-sm rounded-sm shadow-sm"
              rows="3"
              :placeholder="$t('specialMembershipAccessPlaceholder')"
            ></textarea>
            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-sm btn-primary mt-3">
                {{ $t('requestSpecialMembershipAccess') }}
              </button>
              <button
                class="btn btn-sm btn-outline-secondary mt-3"
                @click="specialMembershipAccessToRequest = null"
              >
                {{ $t('actions.discard') }}
              </button>
            </div>
          </form>
        </slot>
      </template>
      <template #default="{ items }">
        <div class="border-bottom py-2 mb-2" v-for="item in items" :key="item.id">
          <SpecialMembershipRequestItem
            v-if="mode === ModeUserSpecialMembershipRequests"
            :item="item"
          />
          <SpecialMembershipAccessItem
            v-else-if="mode === ModeSpecialMembershipAccess"
            :item="item"
            @request-access="specialMembershipAccessToRequest = $event"
          />
        </div>
      </template>
    </ListOfFindResponseItems>
    <template v-slot:modal-footer>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="emit('dismiss')">
        {{ $t('actions.close') }}
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
    "ModeSpecialMembershipAccess": "All Special Membership Access",
    "specialMembershipAccessTitle": "Membership and Provider",
    "userSpecialMembershipRequestsStatus": "Status",
    "userRequestSpecialMembershipAccess": "Request special membership access for <b>{ title }</b>",
    "specialMembershipAccessPlaceholder": "Please provide a reason for your request."
  }
}
</i18n>
<script setup lang="ts">
// This component show all user requests and allow to add a new one
import { computed, ref } from 'vue'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import {
  userSpecialMembershipRequests as userSpecialMembershipRequestsService,
  specialMembershipAccess as specialMembershipAccessService
} from '@/services'
import SpecialMembershipRequestItem from '../modules/lists/SpecialMembershipRequestItem.vue'
import SpecialMembershipAccessItem from '../modules/lists/SpecialMembershipAccessItem.vue'
import ListOfFindResponseItems from '../ListOfFindResponseItems.vue'
import { SpecialMembershipAccess } from '@/services/types'

export type SpecialMembershipModalProps = {
  dialogClass?: string
  title?: string
  titleModal?: string
  isVisible?: boolean
  isLoading?: boolean
}

const props = withDefaults(defineProps<SpecialMembershipModalProps>(), {
  dialogClass: ' modal-md p-0 modal-dialog-centered',
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

const specialMembershipAccessToRequest = ref<SpecialMembershipAccess | null>(null)

const createRequest = () => {
  console.log('Creating special membership request...')
}
</script>

<style>
.SpecialMembershipRequestModal .ListOfFindResponseItems .body {
  height: 50vh;
  min-height: 300px;
  background-color: var(--impresso-color-light-grey);
}
.SpecialMembershipRequestModal .modal-header {
  border-bottom: none;
  padding-right: var(--spacing-1);
  padding-bottom: var(--spacing-1);
}
</style>
