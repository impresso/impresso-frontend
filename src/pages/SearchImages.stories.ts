import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { http, HttpResponse } from 'msw'
import { createRouter, createWebHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'

import SearchImages from '@/pages/SearchImages.vue'
import { MockImages } from '.storybook/mockData/images'

const findImagesHandler = http.get('/api/images', async ({ request }) => {
  const url = new URL(request.url)
  const limit = parseInt(url.searchParams.get('limit') || '12', 10)
  const offset = parseInt(url.searchParams.get('offset') || '0', 10)
  await new Promise(resolve => setTimeout(resolve, 250))
  const items = MockImages.slice(offset, offset + limit)
  return HttpResponse.json({
    data: items,
    pagination: {
      total: MockImages.length,
      offset,
      limit
    }
  })
})

const findImagesEmptyHandler = http.get('/api/images', async () => {
  await new Promise(resolve => setTimeout(resolve, 250))
  return HttpResponse.json({
    data: [],
    pagination: { total: 0, offset: 0, limit: 12 }
  })
})

const getImageHandler = http.get('/api/images/:id', async ({ params }) => {
  const { id } = params
  const image = MockImages.find(i => i.id === id) ?? MockImages[0]
  return HttpResponse.json(image)
})

const findSearchFacetsImagesHandler = http.get('/api/search-facets/images', async () => {
  await new Promise(resolve => setTimeout(resolve, 200))
  return HttpResponse.json({
    data: [],
    pagination: { total: 0, offset: 0, limit: 0 }
  })
})

const installRouter = async (initialQuery: Record<string, string> = {}) => {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/search/images',
        name: 'searchImages',
        component: SearchImages
      },
      {
        path: '/newspaper/:newspaper_id',
        name: 'newspaper',
        component: { template: '<div />' }
      }
    ]
  })
  await router.replace({ name: 'searchImages', query: initialQuery })
  await router.isReady()
  return router
}

const meta: Meta<typeof SearchImages> = {
  title: 'Pages/SearchImages',
  component: SearchImages,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [findImagesHandler, getImageHandler, findSearchFacetsImagesHandler]
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default story: paginated grid of mock images with the standard toolbar and
 * sidebar. Uses MSW to stub the `/api/images` and `/api/search-facets/images`
 * endpoints.
 */
export const Default: Story = {
  decorators: [
    story => ({
      components: { Story: story() },
      async setup() {
        setActivePinia(createPinia())
        const router = await installRouter()
        return { router }
      },
      template: '<Story />'
    })
  ]
}

/**
 * Empty results story: exercises the "no images found" state (empty grid and
 * hidden pagination footer).
 */
export const NoResults: Story = {
  parameters: {
    msw: {
      handlers: [findImagesEmptyHandler, getImageHandler, findSearchFacetsImagesHandler]
    }
  },
  decorators: [
    story => ({
      components: { Story: story() },
      async setup() {
        setActivePinia(createPinia())
        const router = await installRouter()
        return { router }
      },
      template: '<Story />'
    })
  ]
}

/**
 * Similar-to story: pre-selects a `similarTo` query parameter so the sidebar
 * shows the similar-image preview banner and the toolbar switches to the
 * "sort by similarity" state.
 */
export const SimilarTo: Story = {
  decorators: [
    story => ({
      components: { Story: story() },
      async setup() {
        setActivePinia(createPinia())
        const router = await installRouter({ similarTo: MockImages[0].id })
        return { router }
      },
      template: '<Story />'
    })
  ]
}
