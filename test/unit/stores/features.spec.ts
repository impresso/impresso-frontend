import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useFeaturesStore } from '@/stores/features'
import type { ImpressoGlobalMetadata } from '@/models/ImpressoMetadata'

const glob = () => window as unknown as ImpressoGlobalMetadata

describe('useFeaturesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    delete glob().impressoFeatures
  })

  it('defaults every flag to false when feature flags are absent', () => {
    const store = useFeaturesStore()

    expect(store.isBaristaEnabled).toBe(false)
    expect(store.isTextReuseEnabled).toBe(false)
    expect(store.isViewPlansEnabled).toBe(false)
    expect(store.isSpecialMembershipsEnabled).toBe(false)
    expect(store.isSpecialMembershipRequestsEnabled).toBe(false)
  })

  it('reads the feature flags from the global window object on creation', () => {
    glob().impressoFeatures = {
      barista: { enabled: true },
      textReuse: { enabled: false },
      viewPlans: { enabled: true },
      specialMemberships: { enabled: true },
      specialMembershipRequests: { enabled: false }
    }

    const store = useFeaturesStore()

    expect(store.isBaristaEnabled).toBe(true)
    expect(store.isTextReuseEnabled).toBe(false)
    expect(store.isViewPlansEnabled).toBe(true)
    expect(store.isSpecialMembershipsEnabled).toBe(true)
    expect(store.isSpecialMembershipRequestsEnabled).toBe(false)
  })

  it('updates the flags via setFeatures', () => {
    const store = useFeaturesStore()
    expect(store.isBaristaEnabled).toBe(false)

    store.setFeatures({ barista: { enabled: true } })

    expect(store.isBaristaEnabled).toBe(true)
    expect(store.features).toEqual({ barista: { enabled: true } })
  })

  it('updates one flag without resetting the others', () => {
    const store = useFeaturesStore()
    store.setFeatures({
      barista: { enabled: true },
      textReuse: { enabled: false }
    })

    store.setFeatureEnabled('textReuse', true)

    expect(store.features).toEqual({
      barista: { enabled: true },
      textReuse: { enabled: true }
    })
  })
})
