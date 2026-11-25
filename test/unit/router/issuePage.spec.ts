import { describe, expect, it, vi } from 'vitest'
import router from '@/router'
import IssuePage from '@/pages/IssuePage.vue'
import IssueViewerPage from '@/pages/IssueViewerPage.vue'
import ItemOverview from '@/components/ItemOverview.vue'
import IssueViewer from '@/components/issue/IssueViewer.vue'

vi.hoisted(() => vi.stubEnv('VITE_API_TRANSPORT', 'rest'))

describe('issue routes', () => {
  it('loads the issue page for an issue URL', async () => {
    const route = router.resolve('/issue/example-1900-01-01-a')

    expect(route.matched[0].name).toBe('issue')
    expect(route.params.issue_id).toBe('example-1900-01-01-a')
    expect(route.meta.requiresAuth).toBe(false)
    const loadPage = route.matched[0].components?.default
    expect(typeof loadPage).toBe('function')
    if (typeof loadPage !== 'function') throw new Error('Issue page is not lazy-loaded')
    expect((await loadPage()).default).toBe(IssuePage)
  })

  it('defaults to the overview and resolves both nested views', async () => {
    const base = router.resolve('/issue/example-1900-01-01-a')
    expect(base.matched.at(-1)?.redirect).toEqual({ name: 'issuePageOverview' })

    for (const [path, name, component] of [
      ['overview', 'issuePageOverview', ItemOverview],
      ['viewer', 'issuePageViewer', IssueViewer]
    ] as const) {
      const route = router.resolve(`/issue/example-1900-01-01-a/${path}`)
      expect(route.name).toBe(name)
      expect(route.matched[0].name).toBe('issue')
      expect(route.params.issue_id).toBe('example-1900-01-01-a')
      const loadView = route.matched.at(-1)?.components?.default
      expect(typeof loadView).toBe('function')
      if (typeof loadView !== 'function') throw new Error(`${name} is not lazy-loaded`)
      expect((await loadView()).default).toBe(component)
    }
  })

  it('keeps the existing viewer at the view URL', () => {
    const route = router.resolve('/issue/example-1900-01-01-a/view')

    expect(route.name).toBe('issue-viewer')
    expect(route.matched[0].components?.default).toBe(IssueViewerPage)
  })
})
