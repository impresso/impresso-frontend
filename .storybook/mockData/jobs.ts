/**
 * Mock raw job data for Storybook stories.
 * These represent the raw JSON returned by the /api/jobs endpoint,
 * before being converted to Job class instances.
 */
export const MockJobs = [
  {
    id: 101,
    type: 'EXP',
    status: 'DON',
    progress: 1,
    creationDate: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    lastModifiedDate: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    description: 'Export of search results for query "world war"',
    task: 'export',
    extra: {
      channel: 'default',
      taskname: 'export',
      taskstate: 'done',
      progress: 1,
      message: 'Completed successfully',
      total: 420,
      query: 'world war',
      query_hash: 'abc123'
    }
  },
  {
    id: 102,
    type: 'EXP',
    status: 'RUN',
    progress: 0.6,
    creationDate: new Date(Date.now() - 1000 * 30).toISOString(),
    lastModifiedDate: new Date(Date.now() - 1000 * 5).toISOString(),
    description: 'Export of search results for query "peace treaty"',
    task: 'export',
    extra: {
      channel: 'default',
      taskname: 'export',
      taskstate: 'running',
      progress: 0.6,
      message: 'Processing…',
      total: 200,
      query: 'peace treaty',
      query_hash: 'def456'
    }
  },
  {
    id: 103,
    type: 'EXC',
    status: 'DON',
    progress: 1,
    creationDate: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    lastModifiedDate: new Date(Date.now() - 1000 * 60 * 58).toISOString(),
    description: 'Export of collection "My Research"',
    task: 'export-collection',
    extra: {
      channel: 'default',
      taskname: 'export-collection',
      taskstate: 'done',
      progress: 1,
      message: 'Completed successfully',
      total: 87,
      collection: {
        id: 'col-1',
        name: 'My Research',
        description: 'Articles relevant to my research topic',
        status: 'ACT'
      }
    }
  }
]
