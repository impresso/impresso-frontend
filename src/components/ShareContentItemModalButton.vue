<template>
  <WithTooltip :content="label" :disabled="isSharable">
    <button
      type="button"
      class="btn btn-outline-secondary btn-sm px-2 gap-2 d-inline-flex align-items-center"
      :title="label"
      :aria-label="label"
      :disabled="!isSharable"
      data-testid="share-content-item-button"
      v-bind="$attrs"
      @click="isModalVisible = true"
    >
      <Icon name="sendDiagonal" :stroke-width="2" :scale="1" :width="16" :height="16" />
      <span>{{ $t('actions.share') }}</span>
    </button>
  </WithTooltip>
  <Teleport to="body">
    <ShareContentItemModal
      :item="item"
      :is-visible="isModalVisible"
      @dismiss="isModalVisible = false"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, Teleport } from 'vue'
import { useI18n } from 'vue-i18n'
import WithTooltip from '@/components/base/WithTooltip.vue'
import Icon from '@/components/base/Icon.vue'
import ShareContentItemModal from '@/components/modals/ShareContentItemModal.vue'
import type { ContentItem } from '@/models/generated/canonical/contentItem'

export interface ShareContentItemModalButtonProps {
  item: ContentItem
}

const props = defineProps<ShareContentItemModalButtonProps>()

defineOptions({
  inheritAttrs: false
})

const { t } = useI18n()
const isModalVisible = ref(false)
const isSharable = computed(() => props.item.access?.copyright === 'pbl')
const label = computed(() => (isSharable.value ? t('share') : t('notSharable')))
</script>
<i18n lang="json">
{
  "en": {
    "share": "Share",
    "notSharable": "This content item cannot be shared because it is not in the public domain."
  }
}
</i18n>
