import { http, HttpHandler, HttpResponse } from 'msw'
import { PlanEducational } from '../src/constants'
import { BaseFindResponse } from '@/models/generated/schemasPublic'
import { Collection } from '@/models/generated/schemas'
import {
  CollectableItemsUpdatedResponse,
  UpdateCollectableItemsRequest
} from '@/services/types/collectableItems'
import {
  MockSpecialMembershipAccessWithRequests,
  MockUserSpecialMembershipRequests
} from './mockData/specialMembership'
import { MockMediaSources } from './mockData/mediaSources'

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
        uid: String(1800 + i),
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
    uid: '123',
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
      uid: 'coll1',
      title: 'My Research Collection',
      description: 'A collection for research purposes',
      accessLevel: 'private' as const,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      totalItems: 25,
      creatorId: 'researcher'
    },
    {
      uid: 'coll2',
      title: 'Historical Articles',
      description: 'Collection of historical newspaper articles',
      accessLevel: 'private' as const,
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z',
      totalItems: 42,
      creatorId: 'researcher'
    },
    {
      uid: 'coll3',
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
    uid: `coll_${Date.now()}`,
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
    uid: collection_id as string,
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
  return HttpResponse.json(MockMediaSources.find(source => source.uid === id) || null)
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
  '/api/special-membership-access',
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
  getCollectionHandler
}
