<template>
  <Modal
    :show="isVisible"
    :title="titleModal ?? title"
    modalClass="SpecialMembershipModal"
    :dialogClass="props.dialogClass"
    bodyClass="p-0"
    @close="emit('dismiss')"
  >
    <template #modal-header-extra>
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
    </template>
    <ListOfSpecialMembershipBySearchQuery
      :userBitmapAsBitmapPositions="userBitmapAsBitmapPositions"
      v-if="mode == ModeSearchQuery"
      :filters="filters"
    />
    <ListOfFindResponseItems
      v-else
      :error-loading-items-message="$t('errorLoadingSpecialMembershipRequests')"
      :list-is-empty-message="$t('listIsEmpty')"
      :service="serviceByMode"
      :title="$t('listTitle')"
      :params="{
        query: {
          limit: 100
        }
      }"
    >
      <template #header="{ total }">
        <div class="px-3 py-2">
          <div class="container-fluid 2">
            <div class="row">
              <div class="col-6 small">
                {{ $t('specialMembershipAccessTitle', { count: total }) }}
              </div>
              <div class="col-6 small">{{ $t('userSpecialMembershipRequestsStatus') }}</div>
            </div>
          </div>
        </div>
      </template>

      <template #default="{ items }">
        <div
          class="border-bottom p-2 px-3 my-1 position-relative"
          v-for="(item, i) in items"
          :key="item.id"
        >
          <label
            class="position-absolute very-small text-muted left-0 top-0 bottom-0 d-flex align-items-center p-2 m-0"
            :for="'item-' + i"
          >
            {{ i + 1 }}
          </label>
          <SpecialMembershipRequestItem
            v-if="mode === ModeUserSpecialMembershipRequests"
            :item="item"
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
import { useViewsStore } from '@/stores/views'
import { Filter } from '@/models/index.js'
import ListOfSpecialMembershipBySearchQuery from './ListOfSpecialMembershipBySearchQuery.vue'
import { useUserStore } from '@/stores/user.js'
import { base64BytesToBigInt } from '@/util/bigint.js'

const viewStore = useViewsStore()

const userStore = useUserStore()
const userBitmapAsBigInt = computed(() => {
  if (!userStore.userData) {
    return 1n // Default to basic access
  }
  return base64BytesToBigInt(userStore.bitmap)
})
const userBitmapAsBitmapPositions = computed<number[]>(() => {
  let bitmap = BigInt(userBitmapAsBigInt.value)
  const positions: number[] = []
  let position = 0
  while (bitmap > 0n) {
    if (bitmap & 1n) {
      positions.push(position)
    }
    position++
    bitmap >>= 1n
  }
  return positions
})

export type SpecialMembershipModalProps = {
  dialogClass?: string
  title?: string
  titleModal?: string
  isVisible?: boolean
  isLoading?: boolean
  filters?: Filter[]
}

const props = withDefaults(defineProps<SpecialMembershipModalProps>(), {
  dialogClass: ' modal-lg p-0 modal-dialog modal-dialog-scrollable',
  title: 'Request Special Membership Access'
})

const ModeUserSpecialMembershipRequests = 'ModeUserSpecialMembershipRequests'
const ModeSpecialMembershipAccess = 'ModeSpecialMembershipAccess'
const ModeSearchQuery = 'ModeSearchQuery'
const AvailableModes = [ModeSearchQuery, ModeUserSpecialMembershipRequests] as const
const mode = ref<(typeof AvailableModes)[number]>(ModeSearchQuery)

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
.SpecialMembershipRequestModal .container-fluid {
  display: block;
}
</style>

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
    "ModeSearchQuery": "All available Special Membership Access",
    "specialMembershipAccessTitle": "Available options ({ count })",
    "userSpecialMembershipRequestsStatus": "Status",
    "userRequestSpecialMembershipAccess": "Request special membership access for <b>{ title }</b>",
    "specialMembershipAccessPlaceholder": "Please provide a reason for your request."
  }
}
</i18n>
