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
  issue: {
    path: '/issue/:issue_id/view',
    name: 'issue-viewer'
  },
  contentItem: {
    path: '/content-item/:content_item_id',
    name: 'contentItem'
  },
  emailVerification: {
    path: '/email-verification',
    name: 'emailVerification'
  },
  emailVerificationSuccess: {
    path: '/email-verification-success',
    name: 'emailVerificationSuccess'
  },
  plans: {
    path: '/plans',
    name: 'plans'
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

  topics: {
    path: '/topics',
    name: 'topicsRoot',
    children: {
      metadata: {
        path: '',
        name: 'topics'
      },
      topic: {
        path: ':topic_id',
        name: 'topic'
      }
    }
  },
  search: {
    path: '/search',
    name: 'search'
  },
  searchImages: {
    path: '/search/images',
    name: 'searchImages'
  },
  viewImage: {
    path: '/search/images/:image_id',
    name: 'viewImage',
    children: {
      facsimile: {
        path: '',
        name: 'viewImageFacsimile'
      },
      citeAs: {
        path: 'cite-as',
        name: 'viewImageCiteAs'
      },
      similarItems: {
        path: 'similar-items',
        name: 'viewImageSimilarItems'
      }
    }
  },
  searchNgrams: {
    path: '/search/ngrams',
    name: 'searchNgrams'
  }
} as const
