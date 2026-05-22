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
  },
  search: {
    path: '/search',
    name: 'search'
  },
  searchImages: {
    path: '/search/images',
    name: 'searchImages'
  },
  searchNgrams: {
    path: '/search/ngrams',
    name: 'searchNgrams'
  }
} as const
