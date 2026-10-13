import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { ImpressoFeatures, ImpressoGlobalMetadata } from '@/models/ImpressoMetadata'

/**
 * Reads the feature flags injected on the global `window` object during the
 * init sequence (see `loadVersion` in `src/init.ts`). `initSequence()` is
 * awaited before the app is mounted, so the flags are already available by the
 * time this store is first instantiated.
 */
const readFeatures = (): ImpressoFeatures | undefined =>
  (window as unknown as ImpressoGlobalMetadata).impressoFeatures

export type FeatureKey = keyof ImpressoFeatures

export const FeatureKeys: FeatureKey[] = [
  'barista',
  'textReuse',
  'viewPlans',
  'specialMemberships',
  'specialMembershipRequests'
]

/**
 * Centralises access to the Impresso feature flags.
 *
 * Prefer these getters over reading `window.impressoFeatures` directly so that
 * the supported flags stay typed, discoverable and easy to stub in tests.
 */
export const useFeaturesStore = defineStore('features', () => {
  /** Raw feature flags captured from the global window object. */
  const features = ref<ImpressoFeatures | undefined>(readFeatures())

  /** True when the Barista conversational search feature is enabled. */
  const isBaristaEnabled = computed(() => features.value?.barista?.enabled ?? false)
  /** True when the text reuse visualisation feature is enabled. */
  const isTextReuseEnabled = computed(() => features.value?.textReuse?.enabled ?? false)
  /** True when subscription plans are shown to users. */
  const isViewPlansEnabled = computed(() => features.value?.viewPlans?.enabled ?? false)
  /** True when special memberships are enabled. */
  const isSpecialMembershipsEnabled = computed(
    () => features.value?.specialMemberships?.enabled ?? false
  )
  /** True when users are allowed to request a special membership. */
  const isSpecialMembershipRequestsEnabled = computed(
    () => features.value?.specialMembershipRequests?.enabled ?? false
  )

  /**
   * Replace the feature flags. Exposed so the init sequence can push the values
   * into the store and keep it the single source of truth if they are ever
   * refreshed at runtime.
   */
  function setFeatures(next: ImpressoFeatures | undefined) {
    features.value = next
  }

  /** Override a single feature flag at runtime (used by the staff switches). */
  function setFeatureEnabled(key: FeatureKey, enabled: boolean) {
    features.value = { ...features.value, [key]: { ...features.value?.[key], enabled } }
  }

  return {
    features,
    setFeatureEnabled,
    isBaristaEnabled,
    isTextReuseEnabled,
    isViewPlansEnabled,
    isSpecialMembershipsEnabled,
    isSpecialMembershipRequestsEnabled,
    setFeatures
  }
})
