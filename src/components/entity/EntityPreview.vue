<template>
  <div class="ItemPreview">
    <WikidataBlock
      v-if="loadedEntity && loadedEntity.wikidataId"
      :item="loadedEntity"
      class="rounded bg-light border p-2"
    >
      <router-link
        v-if="loadedEntity.id"
        :to="{
          name: 'entity',
          params: {
            entity_id: item.id
          }
        }"
        @click="emit('more')"
      >
        {{ $t('actions.more') }}
      </router-link>
    </WikidataBlock>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { entities as entitiesService } from '@/services'
import WikidataBlock from '@/components/modules/WikidataBlock.vue'

export interface EntityPreviewItem {
  id: string
}

export interface EntityPreviewProps {
  item: EntityPreviewItem
}

const props = defineProps<EntityPreviewProps>()

const emit = defineEmits<{
  (e: 'more'): void
}>()

const loadedEntity = ref<Record<string, unknown> | null>(null)

async function fetchEntity() {
  if (!props.item?.id) {
    loadedEntity.value = null
    return
  }

  try {
    const entity = await entitiesService.get(props.item.id)
    loadedEntity.value = entity
  } catch (err) {
    console.error('[EntityPreview] Error fetching entity:', err)
    loadedEntity.value = null
  }
}

watch(() => props.item.id, fetchEntity, { immediate: true })
</script>
