<template>
  <div class="PlansModalFeatureRow row" :class="props.className">
    <div class="col-lg-2 small" v-html="props.label"></div>
    <div class="col-lg-2 d-flex align-items-center" v-for="plan in props.plans" :key="plan.id">
      <div
        class="w-50 h-100 very-small mt-2 text-center d-flex justify-content-center align-items-center"
        v-for="(ref, i) in props.featureIds"
        :key="ref"
        :class="{ ['border-right']: i === 0 }"
      >
        <PlansModalFeatureCard v-if="getFeature(plan, ref)" :feature="getFeature(plan, ref)" />
        <Icon v-else name="cross" />
      </div>
    </div>
  </div>
</template>
<style>
.PlansModalFeatureRow svg {
  stroke: var(--impresso-color-black);
}
</style>
<script lang="ts" setup>
import PlansModalFeatureCard from './PlansModalFeatureCard.vue'
import Icon from '../base/Icon.vue'

type PlanFeature = {
  icon?: string
  ref: string
}

export type Plan = {
  id?: string
  title: string
  body: string
  features: PlanFeature[]
  requirements: string[]
  icon: string
  collection?: string
  href?: string
}

interface PlansModalFeatureRowProps {
  plans: Plan[]
  label: string
  featureIds?: string[]
  className?: string
}

const props = defineProps<PlansModalFeatureRowProps>()

const getFeature = (plan: Plan, ref: string) => {
  return plan.features.find(f => f.ref === ref)
}
</script>

<style scoped>
/* Add your styles here */
</style>
