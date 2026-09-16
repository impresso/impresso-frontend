import { http, HttpHandler, HttpResponse } from 'msw'
import { PlanEducational } from '../src/constants'
import { BaseFindResponse } from '@/models/generated/app/responses'
import { Collection } from '@/models/generated/canonical'
import {
  CollectableItemsUpdatedResponse,
  UpdateCollectableItemsRequest
} from '@/services/types/collectableItems'
import {
  MockSpecialMembershipAccess,
  MockSpecialMembershipAccessWithRequests,
  MockUserSpecialMembershipRequestReviews,
  MockUserSpecialMembershipRequests
} from './mockData/specialMembership'
import { MockMediaSources } from './mockData/mediaSources'
import { MockTopic } from './mockData/topics'
import { MockBaristaConversations } from './mockData/baristaConversations'
import { MockEmailTemplates } from './mockData/emailTemplates'
import type { EmailTemplate } from '@/institutions-access/services/emailTemplates'

export const findSearchFacetsHandler = http.get(
  '/api/search-facets/search',
  async ({ request }) => {
    const url = new URL(request.url)
    const facets = []
    for (const [key, value] of url.searchParams.entries()) {
      const match = key.match(/^facets\[(\d+)\]$/)
      if (match) {
        facets[parseInt(match[1], 10)] = value
      }
    }
    console.debug('Received request for search facets with params:', request.url, facets)
    const numBuckets = 200
    const buildYearFacet = () => ({
      type: 'year',
      numBuckets,
      buckets: Array.from({ length: numBuckets }, (_, i) => {
        let c = Math.floor(Math.random() * 10000)
        // add some zeroes to the count to make the timeline more interesting
        if (Math.random() < 0.1) {
          c = 0
        }
        return {
          count: c,
          value: String(1800 + i),
          id: String(1800 + i),
          item: { y: 1800 + i, refs: { c, a: c } }
        }
      })
    })
    const data = facets.includes('year') ? [buildYearFacet()] : []
    return HttpResponse.json({ data, total: data.length })
  }
)

const getYearFacetHandler = http.get('/api/search-facets/search/year', () => {
  const numBuckets = 200
  return HttpResponse.json({
    type: 'year',
    numBuckets,
    buckets: Array.from({ length: numBuckets }, (_, i) => {
      const c = Math.floor(Math.random() * 10000)

      return {
        count: c,
        val: String(1800 + i),
        id: String(1800 + i),
        item: {
          y: 1800 + i,
          refs: {
            c: c,
            a: c
          }
        }
      }
    })
  })
})

const getEntity = http.get('/api/entities/*', () => {
  return HttpResponse.json({})
})

const getMe = http.get('/api/me', () => {
  return HttpResponse.json({
    firstname: 'John',
    lastname: 'Doe',
    email: 'john.doe@example.com',
    id: '123',
    username: 'johndoe',
    bitmap: 'AAAAAAAAAAs',
    isActive: true,
    isStaff: false,
    emailAccepted: false,
    groups: [
      {
        name: 'plan-researcher'
      }
    ]
  })
})

const getImpressoPyFunction = http.get('/api/datalab-support/impresso-py-function', () => {
  return HttpResponse.json({
    code: `impresso.search(
  term="test",
)`
  })
})

const sendBaristaMessage = http.post('/api/barista-proxy', () => {
  return HttpResponse.json({
    messages: [
      {
        content: '',
        additional_kwargs: {
          tool_calls: [
            {
              id: 'call_gfcb',
              function: {
                arguments:
                  '{"filters": [{"type": "string", "context": "include", "op": "AND", "precision": "exact", "q": "Boom"}]}',
                name: 'Filters'
              },
              type: 'function'
            }
          ]
        },
        type: 'ai',
        name: null,
        id: 'run-87678cbe-0a69-493f-9007-428f9d9da12e-0'
      }
    ]
  })
})

const getFiltersItems = http.get('/api/filters-items', () => {
  return HttpResponse.json({
    filtersWithItems: []
  })
})

const collectErrors = http.post('/api/errors-collector', () => {
  return HttpResponse.json({})
})

const userChangePlanRequest = http.get('/api/user-change-plan-request', () => {
  return HttpResponse.json({
    id: 1,
    plan: {
      id: 2,
      name: PlanEducational
    },
    status: 'pending',
    dateCreated: new Date().toISOString(),
    dateLastModified: new Date().toISOString(),
    changelog: []
  })
})

const getCollectionsHandler = http.get('/api/collections', ({ request }) => {
  const url = new URL(request.url)
  const limit = parseInt(url.searchParams.get('limit') || '25')
  const page = parseInt(url.searchParams.get('page') || '1')
  const q = url.searchParams.get('q') || ''

  const mockCollections = [
    {
      id: 'coll1',
      title: 'My Research Collection',
      description: 'A collection for research purposes',
      accessLevel: 'private' as const,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      totalItems: 25,
      creatorId: 'researcher'
    },
    {
      id: 'coll2',
      title: 'Historical Articles',
      description: 'Collection of historical newspaper articles',
      accessLevel: 'private' as const,
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z',
      totalItems: 42,
      creatorId: 'researcher'
    },
    {
      id: 'coll3',
      title: 'Swiss Politics',
      description: 'Articles about Swiss political events',
      accessLevel: 'public' as const,
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-18T00:00:00Z',
      totalItems: 18,
      creatorId: 'researcher'
    }
  ] satisfies Collection[]

  // Filter collections based on search query
  const filteredCollections = q
    ? mockCollections.filter(
        col =>
          col.title?.toLowerCase().includes(q.toLowerCase()) ||
          col.description?.toLowerCase().includes(q.toLowerCase())
      )
    : mockCollections

  return HttpResponse.json({
    data: filteredCollections,
    pagination: {
      total: filteredCollections.length,
      limit,
      offset: (page - 1) * limit
    }
  } satisfies BaseFindResponse)
})

const createCollectionHandler = http.post('/api/collections', async ({ request }) => {
  const body = (await request.json()) as Omit<Collection, 'id'>
  return HttpResponse.json({
    id: `coll_${Date.now()}`,
    ...body
  } satisfies Collection)
})

const patchCollectionItemsHandler = http.patch(
  '/api/collections/:collection_id/items',
  async ({ request, params }) => {
    const { collection_id } = params
    const body = (await request.json()) as UpdateCollectableItemsRequest

    // Simulate successful operation
    if (body.add || body.remove) {
      return HttpResponse.json({
        totalAdded: body.add?.length || 0,
        totalRemoved: body.remove?.length || 0
      } satisfies CollectableItemsUpdatedResponse)
    }

    return HttpResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
)

const getCollectionHandler = http.get('/api/collections/:collection_id', ({ params }) => {
  const { collection_id } = params
  return HttpResponse.json({
    id: collection_id as string,
    title: 'Mock Collection',
    description: 'A mock collection for testing',
    accessLevel: 'private' as const,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    totalItems: 15,
    creatorId: 'user1'
  } satisfies Collection)
})

export const getMediaSourceHandler = http.get('/api/media-sources/:id', async ({ params }) => {
  const { id } = params
  await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
  return HttpResponse.json(MockMediaSources.find(source => source.id === id) || null)
})

export const findMediaSourcesHandler = http.get('/api/media-sources', async ({ request }) => {
  const url = new URL(request.url)
  const limit = parseInt(url.searchParams.get('limit') || '10')
  const offset = parseInt(url.searchParams.get('offset') || '0')
  await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
  const items = MockMediaSources.slice(offset, offset + limit)
  return HttpResponse.json({
    data: items,
    pagination: {
      total: MockMediaSources.length,
      offset: offset,
      limit: limit
    }
  } satisfies BaseFindResponse)
})

export const findSpecialMembershipAccessHandler = http.get(
  '/api/special-membership-plans',
  async ({ request }) => {
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
    const items = MockSpecialMembershipAccessWithRequests.slice(offset, offset + limit)
    return HttpResponse.json({
      data: items,
      pagination: {
        total: MockSpecialMembershipAccessWithRequests.length,
        offset: offset,
        limit: limit
      }
    })
  }
)

export const findSpecialMembershipAccessHandlerWithoutRequests = http.get(
  '/api/special-membership-plans',
  async ({ request }) => {
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
    const items = MockSpecialMembershipAccess.slice(offset, offset + limit)
    return HttpResponse.json({
      data: items,
      pagination: {
        total: MockSpecialMembershipAccess.length,
        offset: offset,
        limit: limit
      }
    })
  }
)

export const findUserSpecialMembershipRequestsHandler = http.get(
  '/api/user-special-membership-requests',
  async ({ request }) => {
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
    const items = MockUserSpecialMembershipRequests.slice(offset, offset + limit)
    return HttpResponse.json({
      data: items,
      pagination: {
        total: MockUserSpecialMembershipRequests.length,
        offset: offset,
        limit: limit
      }
    })
  }
)

export const findUserSpecialMembershipRequestsReviewsHandler = http.get(
  '/api/user-special-membership-requests-reviews',
  async ({ request }) => {
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '25')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const term = (url.searchParams.get('term') || '').toLowerCase()
    // The feathers rest client serialises arrays with indices (`status[0]=x`),
    // while other clients use `status[]=x` or a bare `status=x`. Accept all.
    const statuses = [...url.searchParams.entries()]
      .filter(([key]) => /^status(\[\d*\])?$/.test(key))
      .map(([, value]) => value)
    await new Promise(resolve => setTimeout(resolve, 400)) // Simulate network delay

    let items = MockUserSpecialMembershipRequestReviews
    if (statuses.length > 0) {
      items = items.filter(item => statuses.includes(item.status))
    }
    if (term !== '') {
      items = items.filter(item =>
        `${item.requester.firstname} ${item.requester.lastname}`.toLowerCase().includes(term)
      )
    }

    return HttpResponse.json({
      data: items.slice(offset, offset + limit),
      pagination: {
        total: items.length,
        offset,
        limit
      }
    } satisfies BaseFindResponse)
  }
)

export const patchUserSpecialMembershipRequestsReviewHandler = http.patch(
  '/api/user-special-membership-requests-reviews/:id',
  async ({ params }) => {
    const { id } = params
    await new Promise(resolve => setTimeout(resolve, 400)) // Simulate network delay
    const item = MockUserSpecialMembershipRequestReviews.find(
      review => String(review.id) === String(id)
    )
    if (!item) {
      return HttpResponse.json({ error: 'Unknown request' }, { status: 404 })
    }
    return HttpResponse.json(item)
  }
)

export const findBaristaConversationsHandler = http.get(
  '/api/barista-conversations',
  async ({ request }) => {
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '5')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    await new Promise(resolve => setTimeout(resolve, 300))
    const items = MockBaristaConversations.slice(offset, offset + limit)
    return HttpResponse.json({
      data: items,
      total: MockBaristaConversations.length,
      limit,
      skip: offset
    })
  }
)

export const createUserSpecialMembershipRequestHandler = http.post(
  '/api/user-special-membership-requests',
  async ({ request }) => {
    const body = (await request.json()) as {
      specialMembershipAccessId: number
      note?: string
    }
    const newRequest = {
      id: Math.floor(Math.random() * 1000) + 100,
      reviewerId: null,
      specialMembershipAccessId: body.specialMembershipAccessId,
      userId: 42,
      specialMembershipAccess: {
        id: body.specialMembershipAccessId,
        reviewerId: null,
        title: 'New Access Request',
        bitmapPosition: 1,
        metadata: { provider: 'New Provider', note: body.note || '' }
      },
      dateCreated: new Date().toISOString(),
      dateLastModified: new Date().toISOString(),
      status: 'pending',
      changelog: []
    }
    return HttpResponse.json(newRequest)
  }
)

/**
 * Email templates are not served by the backend yet. These handlers describe
 * the contract the `email-templates` service is expected to expose, so the HTTP
 * client implementation can be exercised in Storybook.
 */
const emailTemplatesStore = new Map<string, EmailTemplate>(
  MockEmailTemplates.map(template => [template.id, { ...template }])
)

export const findEmailTemplatesHandler = http.get('/api/email-templates', async () => {
  await new Promise(resolve => setTimeout(resolve, 300)) // Simulate network delay
  const data = [...emailTemplatesStore.values()]
  return HttpResponse.json({
    data,
    pagination: {
      total: data.length,
      limit: data.length,
      offset: 0
    }
  } satisfies BaseFindResponse)
})

export const getEmailTemplateHandler = http.get('/api/email-templates/:id', async ({ params }) => {
  const { id } = params
  await new Promise(resolve => setTimeout(resolve, 300)) // Simulate network delay
  const template = emailTemplatesStore.get(String(id))
  if (!template) {
    return HttpResponse.json({ error: 'Unknown email template' }, { status: 404 })
  }
  return HttpResponse.json(template)
})

export const patchEmailTemplateHandler = http.patch(
  '/api/email-templates/:id',
  async ({ params, request }) => {
    const { id } = params
    const existing = emailTemplatesStore.get(String(id))
    if (!existing) {
      return HttpResponse.json({ error: 'Unknown email template' }, { status: 404 })
    }
    const body = (await request.json()) as Partial<EmailTemplate>
    await new Promise(resolve => setTimeout(resolve, 300)) // Simulate network delay
    const updated: EmailTemplate = {
      ...existing,
      ...body,
      id: existing.id,
      dateLastModified: new Date().toISOString()
    }
    emailTemplatesStore.set(existing.id, updated)
    return HttpResponse.json(updated)
  }
)

export const emailTemplatesHandlers = [
  findEmailTemplatesHandler,
  getEmailTemplateHandler,
  patchEmailTemplateHandler
]

export const findEmpty = (mswHandler: HttpHandler) => {
  const path = mswHandler.info.path
  return http.get(path, async ({ request }) => {
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
    return HttpResponse.json({
      data: [],
      pagination: {
        total: 0,
        offset: offset,
        limit: limit
      }
    })
  })
}
export const getTopicHandler = http.get('/api/topics/:id', async ({ params }) => {
  const { id } = params
  await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
  return HttpResponse.json(MockTopic.id === id ? MockTopic : null)
})

export const handlers = {
  getYearFacetHandler,
  getEntity,
  getMe,
  getImpressoPyFunction,
  sendBaristaMessage,
  collectErrors,
  userChangePlanRequest,
  getCollectionsHandler,
  createCollectionHandler,
  patchCollectionItemsHandler,
  getCollectionHandler,
  getFiltersItems,
  findBaristaConversationsHandler
}
