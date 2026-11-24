<template>
  <InfoButton
    v-if="props.compact"
    :name="$t(compactLabelKey)"
    :default-content="$t(compactTooltipKey)"
    :teleport="props.teleport"
  >
    <template #trigger="{ open }">
      <WithTooltip
        :disabled="open"
        hide-on-click
        :content="
          compactTooltipKey === 'compact_tooltip_none'
            ? $t(compactLabelKey)
            : $t('compact_tooltip_summary', {
                status: $t(compactTooltipKey),
                dimensions: $t(compactLabelKey)
              })
        "
      >
        <div
          class="compact-access-badge d-inline-flex align-items-center gap-2"
          role="img"
          :aria-label="$t(compactLabelKey)"
        >
          <Icon name="key" :height="20" />
          <span
            v-for="dimension in accessDimensions"
            :key="dimension.key"
            class="compact-access-badge__dot"
            :class="
              dimension.granted
                ? 'compact-access-badge__dot--granted'
                : 'compact-access-badge__dot--denied'
            "
            aria-hidden="true"
          ></span>
        </div>
      </WithTooltip>
    </template>
    <template #details>
      <div v-for="dimension in accessDimensions" :key="dimension.key" class="text-start mt-2">
        <strong>{{ $t(dimension.labelKey) }}:</strong> {{ $t(dimension.descriptionKey) }}
      </div>
    </template>
  </InfoButton>
  <div v-else class="d-flex align-items-center gap-2 flex-wrap">
    <ContentItemAccessBadge
      v-for="dimension in accessDimensions"
      :key="dimension.key"
      :label="$t(dimension.labelKey)"
      :description="$t(dimension.descriptionKey)"
      :granted="dimension.granted"
      :teleport="props.teleport"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import ContentItemAccessBadge from '@/components/ContentItemAccessBadge.vue'
import WithTooltip from '@/components/base/WithTooltip.vue'
import InfoButton from '@/components/base/InfoButton.vue'
import Icon from '@/components/base/Icon.vue'

export interface ContentItemAccessDimensionsProps {
  exploreGranted: boolean
  transcriptGranted: boolean
  facsimileGranted: boolean
  teleport?: boolean
  compact?: boolean
}

const props = defineProps<ContentItemAccessDimensionsProps>()
const userStore = useUserStore()

const accessDimensions = computed(() => {
  const guestSuffix = userStore.userData ? '' : '_guest'

  const buildDimension = (key: string, granted: boolean) => ({
    key,
    labelKey: `badge_${key}_label`,
    granted,
    descriptionKey: `badge_${key}_${granted ? 'granted' : 'denied'}${guestSuffix}_description`
  })

  return [
    buildDimension('explore', props.exploreGranted),
    buildDimension('transcript', props.transcriptGranted),
    buildDimension('facsimile', props.facsimileGranted)
  ]
})

const compactLabelKey = computed(() => {
  const granted = accessDimensions.value.filter(dimension => dimension.granted)
  return `compact_${granted.length ? granted.map(dimension => dimension.key).join('_') : 'none'}`
})

const compactTooltipKey = computed(() => {
  const grantedCount = accessDimensions.value.filter(dimension => dimension.granted).length
  if (grantedCount === 3) return 'compact_tooltip_full'
  if (grantedCount === 0) return 'compact_tooltip_none'
  if (grantedCount === 1 && props.exploreGranted) return 'compact_tooltip_web_only'
  return 'compact_tooltip_partial'
})
</script>

<style scoped>
.compact-access-badge {
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--bs-border-color, #dee2e6);
  line-height: 1;
}

.compact-access-badge__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.compact-access-badge__dot--granted {
  background-color: var(--bs-success, #198754);
  border: 1px solid #00150b;
}

.compact-access-badge__dot--denied {
  background-color: var(--bs-secondary, #adb5bd);
}
</style>

<i18n lang="json">
{
  "en": {
    "compact_none": "No access",
    "compact_explore": "Web App access",
    "compact_transcript": "Transcript access",
    "compact_facsimile": "Facsimile access",
    "compact_explore_transcript": "Web App & transcript access",
    "compact_explore_facsimile": "Web App & facsimile access",
    "compact_transcript_facsimile": "Transcript & facsimile access",
    "compact_explore_transcript_facsimile": "Web App, transcript & facsimile access",
    "compact_tooltip_full": "Full access",
    "compact_tooltip_partial": "Partial access",
    "compact_tooltip_web_only": "Only Web App access",
    "compact_tooltip_none": "No access",
    "compact_tooltip_summary": "{status}: {dimensions}",
    "badge_explore_label": "Web App",
    "badge_explore_granted_description": "You can view this item's digital surrogate, metadata, and semantic enrichments in the Web App.",
    "badge_explore_denied_description": "Your current user plan does not include Web App access to this item's digital surrogate.",
    "badge_explore_granted_guest_description": "You can view this item's digital surrogate in the Web App (Public Domain content).",
    "badge_explore_denied_guest_description": "Log in or create an account to check whether you can view this item's digital surrogate in the Web App.",
    "badge_transcript_label": "Transcript",
    "badge_transcript_granted_description": "You can access and export this item's transcript via CSV export and the Datalab (Impresso Python library).",
    "badge_transcript_denied_description": "Your current user plan does not include transcript access via CSV export or the Datalab.",
    "badge_transcript_granted_guest_description": "You can view this item's transcript in the Web App. Log in to also access it via the Datalab.",
    "badge_transcript_denied_guest_description": "Log in or create an account to check whether you can access this item's transcript.",
    "badge_facsimile_label": "Facsimile",
    "badge_facsimile_granted_description": "You can access and export this item's facsimile images via CSV export and the Datalab (Impresso Python library).",
    "badge_facsimile_denied_description": "Your current user plan does not include facsimile image access via CSV export or the Datalab.",
    "badge_facsimile_granted_guest_description": "You can view this item's facsimile images in the Web App. Log in to also access them via the Datalab.",
    "badge_facsimile_denied_guest_description": "Log in or create an account to check whether you can access this item's facsimile images."
  }
}
</i18n>
