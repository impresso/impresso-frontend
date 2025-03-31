import { http, HttpResponse } from 'msw'

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
    isActive: true,
    isStaff: false,
    emailAccepted: false
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

export const handlers = {
  getYearFacetHandler,
  getEntity,
  getMe,
  getImpressoPyFunction,
  sendBaristaMessage,
  collectErrors
}
