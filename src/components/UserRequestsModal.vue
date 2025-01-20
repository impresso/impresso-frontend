<template>
  <Modal
    :show-delay="0"
    :show="isVisible"
    :title="title"
    modalClass="UserRequestsModal  "
    :dialogClass="props.dialogClass"
    @close="dismiss"
    hide-backdrop
  >
    <Alert>
      This content is accessible only to researchers who have a valid affiliation. More info in the
      documentation section.
    </Alert>
    <section>
      <h2
        style="position: sticky; z-index: 2; top: var(--negative-spacing-3)"
        class="font-size-inherit mb-0 font-weight-bold py-3 bg-white border-bottom border-dark"
      >
        Requested subscriptions
      </h2>
      <div v-if="isLoadingUserRequests" class="my-2">
        <LoadingBlock :height="50" label="please wait ...."> </LoadingBlock>
      </div>
      <div v-if="!isLoadingUserRequests && !userRequests.length">
        <p class="text-muted">There are no pending requests.</p>
      </div>
      <ul class="list-unstyled m-0 pb-2" v-if="!isLoadingUserRequests && userRequests.length">
        <li
          class="py-2 border-bottom d-flex align-items-center"
          v-for="(UserRequest, idx) in userRequests"
          :key="UserRequest.id"
        >
          <div class="text-muted d-inline-block small" style="width: 60px">
            {{
              $t('subscriptiondataset_index_label', {
                idx: idx + 1,
                l: subscriptionDatasets.length
              })
            }}
          </div>
          <UserRequestItem :item="UserRequest" class="flex-grow-1 align-items-center" />
        </li>
      </ul>
    </section>
    <section>
      <h2
        style="position: sticky; z-index: 2; top: var(--negative-spacing-3)"
        class="font-size-inherit font-weight-bold py-3 bg-white border-bottom border-dark"
      >
        Available subscriptions
      </h2>
      <div v-if="isLoadingSubscriptionDatasets" class="my-2">
        <LoadingBlock :height="50" label="please wait ...."> </LoadingBlock>
      </div>
      <div v-if="!isLoadingSubscriptionDatasets && !subscriptionDatasets.length">
        <p class="text-muted">There are no available subscriptions.</p>
      </div>
      <ul
        class="list-unstyled"
        v-if="!isLoadingSubscriptionDatasets && subscriptionDatasets.length"
      >
        <li
          class="py-2 border-bottom d-flex align-items-center"
          v-for="(subscriptionDataset, idx) in subscriptionDatasets"
          :key="subscriptionDataset.id"
          @click="() => toggleSelection(subscriptionDataset)"
        >
          <div class="text-muted d-inline-block small" style="width: 65px">
            {{
              $t('subscriptiondataset_index_label', {
                idx: idx + 1,
                l: subscriptionDatasets.length
              })
            }}
          </div>
          <SubscriptionDatasetItem :item="subscriptionDataset" />
          <div
            class="ml-auto"
            v-if="userRequests.find(d => d.subscription.id === subscriptionDataset.id)"
          >
            {{ userRequests.find(d => d.subscription.id === subscriptionDataset.id).status }}

            <Icon class="locked" name="checkSquareSolid" :stroke-width="1.5"></Icon>
          </div>
          <div class="ml-auto" v-else>
            <Icon
              v-if="selectedSubscriptionDatasets.includes(subscriptionDataset)"
              name="checkSquare"
              :stroke-width="1.5"
            />
            <Icon v-else name="square" :stroke-width="1.5" />
          </div>
        </li>
      </ul>
    </section>
    <template v-slot:modal-footer>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="dismiss">close</button>
      <button
        type="button"
        :disabled="!selectedSubscriptionDatasets.length"
        class="btn btn-sm btn-primary"
        @click="dismiss"
      >
        Request access to {{ selectedSubscriptionDatasets.length }} datasets
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from './base/Modal.vue'
import { type UserRequest } from '@/services/types'
import { type SubscriptionDataset } from '@/services/types'
import Alert from './Alert.vue'
import SubscriptionDatasetItem from './modules/lists/SubscriptionDatasetItem.vue'
import LoadingBlock from './LoadingBlock.vue'
import { ref } from 'vue'
import Icon from './base/Icon.vue'
import UserRequestItem from './modules/lists/UserRequestItem.vue'

const props = withDefaults(
  defineProps<{
    dialogClass?: string
    title?: string
    isVisible?: boolean
    userRequests: UserRequest[]
    subscriptionDatasets: SubscriptionDataset[]

    isLoadingSubscriptionDatasets?: boolean
    isLoadingUserRequests?: boolean
    onSubmit?: ({ subscriptionDatasets }: { subscriptionDatasets: SubscriptionDataset[] }) => void
  }>(),
  {
    dialogClass: 'modal-dialog-scrollable modal-lg',
    isLoading: false
  }
)
const emit = defineEmits(['dismiss', 'confirm'])

const selectedSubscriptionDatasets = ref<SubscriptionDataset[]>([])

const toggleSelection = (subscriptionDataset: SubscriptionDataset) => {
  console.debug('[UserRequestsModal] toggleSelection', selectedSubscriptionDatasets.value)
  // only if the dataset is not already one of userrequests subscription
  if (props.userRequests.find(d => d.subscription.id === subscriptionDataset.id)) {
    return
  }
  const idx = selectedSubscriptionDatasets.value.findIndex(s => s.id === subscriptionDataset.id)
  if (idx === -1) {
    selectedSubscriptionDatasets.value.push(subscriptionDataset)
  } else {
    selectedSubscriptionDatasets.value.splice(idx, 1)
  }
}
const dismiss = () => {
  console.debug('[UserRequestsModal] dismiss')
  emit('dismiss')
}
</script>
<style>
.UserRequestsModal svg path {
  stroke: currentColor;
}
</style>
<i18n>
  {
    "en": {
      "subscriptiondataset_index_label" : "#{idx} of {l}" 
    }
  }
</i18n>
