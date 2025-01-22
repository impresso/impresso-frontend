<template>
  <div>
    PlansModalFeatureCard
    {{ feature }}
  </div>
</template>
<script lang="ts" setup>
type PlanFeature = {
  title: string
  status: string
  iconColor: string
  ref: string
}

interface PlansModalFeatureCardProps {
  feature: PlanFeature
}
defineProps<PlansModalFeatureCardProps>()
</script>
