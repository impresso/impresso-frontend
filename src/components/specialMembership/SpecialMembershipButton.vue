<template>
  <button class="UserSpecialmembershipRequestButton" @click="onClickHandler">
    <span v-if="item">{{ item.title }}</span>
    <span v-else>{{ $t('actions.viewSpecialMembership') }}</span>
  </button>
</template>
<i18n lang="json">
{
  "en": {
    "actions": {
      "viewSpecialMembership": "View Special Membership"
    }
  }
}
</i18n>
<script setup lang="ts">
import { SpecialMembershipAccess } from '@/services/types'
import { useViewsStore } from '@/stores/views'

export interface SpecialMembershipButtonProps {
  item?: SpecialMembershipAccess
}

const props = defineProps<SpecialMembershipButtonProps>()
const viewStore = useViewsStore()
const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const onClickHandler = (e: MouseEvent) => {
  if (props.item) {
    viewStore.openSpecialMembershipModal(props.item)
  } else {
    viewStore.openSpecialMembershipModal()
  }
  emit('click', e)
}
</script>
