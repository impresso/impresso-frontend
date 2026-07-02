export const Routes = {
  audioContentItem: {
    path: '/audio-content-item/:content_item_id',
    name: 'audioContentItem',
    children: {
      transcript: {
        path: '',
        name: 'audioContentItemTranscript'
      },
      similarItems: {
        path: 'similar-items',
        name: 'audioContentItemSimilarItems'
      },
      citeAs: {
        path: 'cite-as',
        name: 'audioContentItemCiteAs'
      },
      debug: {
        path: 'debug',
        name: 'audioContentItemDebug'
      }
    }
  },
  collections: {
    path: '/collections',
    name: 'collectionsRoot',
    children: {
      overview: {
        name: 'collections',
        path: ''
      },
      collection: {
        name: 'collection',
        path: ':collection_id'
      }
    }
  },
  contentItem: {
    path: '/content-item/:content_item_id',
    name: 'contentItem'
  },
  mediaSource: {
    path: '/media-source/:media_source_id',
    name: 'mediaSource',
    children: {
      contentItems: {
        path: 'content-items',
        name: 'mediaSourceContentItems'
      },
      metadata: {
        path: '',
        name: 'mediaSourceMetadata'
      },
      overview: {
        path: 'overview',
        name: 'mediaSourceOverview'
      },
      firstPages: {
        path: 'first-pages',
        name: 'mediaSourceFirstPages'
      }
    }
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
