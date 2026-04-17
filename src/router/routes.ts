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
  }
} as const
