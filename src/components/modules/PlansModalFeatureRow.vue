<template>
  <div class="PlansModalFeatureRow row" :class="props.className">
    <div class="col col-lg-2" v-html="props.label"></div>
    <div class="col" v-for="plan in props.plans" :key="plan.id">
      <div class="row d-flex align-items-center h-100">
        <div
          class="col"
          v-for="(ref, i) in props.featureIds"
          :key="ref"
          :class="`d-flex justify-content-center align-items-center ${hasBorder(i) ? 'border-end' : ''}`"
        >
          <PlansModalFeatureCard v-if="getFeature(plan, ref)" :feature="getFeature(plan, ref)" />
          <Icon v-else name="cross" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue'
import PlansModalFeatureCard from './PlansModalFeatureCard.vue'

type PlanFeature = {
  title: string
  status: string
  iconColor: string
  ref: string
}

type Plan = {
  id: string
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

const hasBorder = (index: number) => {
  return props.featureIds && props.featureIds.length > 1 && index < props.featureIds.length - 1
}
</script>

<style scoped>
/* Add your styles here */
</style>
