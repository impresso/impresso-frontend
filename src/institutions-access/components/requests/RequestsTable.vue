<template>
  <ListOfFindResponseItems
    ref="listRef"
    class="RequestsTable"
    :service="service"
    :params="params"
    :error-loading-items-message="errorMessage"
    :list-is-empty-message="emptyMessage"
    items-class=""
  >
    <template #header="{ total }">
      <slot name="toolbar" :total="total" />
      <div class="RequestsTable__header">
        <div v-for="column in RequestsColumns" :key="column.id" class="small-caps">
          {{ $t(column.labelKey) }}
        </div>
      </div>
    </template>

    <template #default="{ items }">
      <div class="RequestsTable__rows">
        <RequestRow
          v-for="item in (items as UserSpecialMembershipRequestReview[])"
          :key="item.id"
          :item="item"
        >
          <template #actions="{ item: rowItem }">
            <slot name="actions" :item="rowItem" />
          </template>
        </RequestRow>
      </div>
    </template>
  </ListOfFindResponseItems>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ListOfFindResponseItems from '@/components/ListOfFindResponseItems.vue'
import type {
  ListOfFindResponseItemsExposed,
  ListOfFindResponseItemsProps
} from '@/components/ListOfFindResponseItems.vue'
import type { ServiceFindParams, UserSpecialMembershipRequestReview } from '@/services/types'
import RequestRow from './RequestRow.vue'
import { RequestsColumns } from './columns'

export interface RequestsTableProps {
  /**
   * Feathers service providing the requests, typically the reviews service.
   * The services exported by `@/services` are untyped, so this stays as loose
   * as the prop it is forwarded to.
   */
  service: ListOfFindResponseItemsProps<any>['service']
  params: ServiceFindParams
  emptyMessage: string
  errorMessage: string
}

defineProps<RequestsTableProps>()

const listRef = ref<ListOfFindResponseItemsExposed | null>(null)

defineExpose<ListOfFindResponseItemsExposed>({
  refresh: async () => {
    await listRef.value?.refresh()
  },
  refreshFromFirstPage: async () => {
    await listRef.value?.refreshFromFirstPage()
  }
})
</script>

<i18n lang="json">
{
  "en": {
    "columns": {
      "requester": "Requester",
      "access": "Requested access",
      "dates": "Dates",
      "status": "Status",
      "actions": "Actions"
    }
  }
}
</i18n>

<style>
.RequestsTable__header {
  display: none;
  color: var(--clr-grey-300);
  background-color: var(--impresso-color-paper);
  border-bottom: 1px solid var(--clr-grey-700);
}
.RequestsTable .Alert,
.RequestsTable .Alert.info {
  justify-content: center;
  max-width: 36rem;
  margin: 2.75rem auto 3.25rem;
  padding: 0.5rem 1rem;
  background-color: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  text-align: center;
  color: var(--clr-grey-200);
}
.RequestsTable .Alert svg {
  display: none;
}
@media (min-width: 992px) {
  .RequestsTable__header {
    display: grid;
  }
  .RequestsTable:has(.Alert) .RequestsTable__header {
    display: none;
  }
}
</style>
