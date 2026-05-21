export const Routes = {
  mediaSource: {
    path: '/media-source/:media_source_id',
    name: 'mediaSource'
  },
  mediaSourceMetadata: {
    path: '',
    name: 'mediaSourceMetadata'
  },
  mediaSourceOverview: {
    path: 'overview',
    name: 'mediaSourceOverview'
  },
  topic: {
    path: '/topics/:topic_id',
    name: 'topic'
  }
} as const
