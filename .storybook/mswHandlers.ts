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
    code: `from impresso import connect

# Connect to the API
impresso = connect()
`
  })
})

export const handlers = {
  getYearFacetHandler,
  getEntity,
  getMe,
  getImpressoPyFunction
}
