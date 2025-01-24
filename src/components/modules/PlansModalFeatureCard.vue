<template>
  <div>
    <Icon v-if="feature.icon" name="warningCircle" />
    <Icon v-else name="check" />
  </div>
</template>
<script lang="ts" setup>
import Icon from '../base/Icon.vue'

type PlanFeature = {
  icon?: string
  ref: string
}

interface PlansModalFeatureCardProps {
  feature: PlanFeature
}
defineProps<PlansModalFeatureCardProps>()
</script>
