<template>
  <div class="d-flex align-items-center gap-2 flex-wrap">
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

export interface ContentItemAccessDimensionsProps {
  exploreGranted: boolean
  transcriptGranted: boolean
  facsimileGranted: boolean
  teleport?: boolean
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
</script>

<i18n lang="json">
{
  "en": {
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
