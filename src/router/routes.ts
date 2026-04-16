export const Routes = {
  mediaSource: {
    path: '/media-source/:media_source_id',
    name: 'mediaSource'
  },
  mediaSourceOverview: {
    path: '/media-source/:media_source_id/overview',
    name: 'mediaSourceOverview'
  }
} as const
