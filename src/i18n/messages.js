export default {
  en: {
    untitled: '...',
    language: 'Language',
    languages: {
      de: 'German',
      fr: 'French',
      en: 'English',
    },
    buckets: {
      type: {
        ad: 'advertisement',
        ar: 'article',
      },
      language: {
        de: 'German',
        fr: 'French',
        en: 'English',
        'n/a': 'Undefined language',
        nl: 'Dutch',
      },
      country: {
        CH: 'Switzerland',
        LU: 'Luxembourg',
      },
    },
    op: {
      or: 'or',
      and: 'and',
    },
    actions: {
      agree: 'I agree to the terms of use',
      more: 'more...',
      remove: 'remove',
      close: 'close',
      loading: 'loading...',
      reset: 'Reset',
      apply: 'Apply',
      applyChanges: 'Apply changes',
      applyChangesDetailed: 'apply changes (added: {added}, removed: {removed})',
      addToCurrentFilters: 'Add to current search filters',
      addToCurrentFiltersDetailed: 'Add selected option as search filter|Add <b> {count}</b> selected options',
      viewAll: 'explore all ...',
    },
    filters: {
      daterange: {
        item: 'from <b>{start}</b> to <b>{end}</b>',
      },
    },
    types: {
      location: 'location',
      person: 'person',
      human: 'human',
    },
    groupBy: {
      images: 'images',
      articles: 'articles',
    },
    browse: {
      images: 'Search in <span class="number">{count}</span> published images',
      articles: 'Search in <span class="number">{count}</span> published articles',
    },
    numbers: {
      articles: 'no articles | <span class="number">1</span> article | <span class="number">{n}</span> articles',
      pages: 'no pages | <span class="number">1</span> article | <span class="number">{n}</span> pages',
      issues: 'no issues | <span class="number">1</span> article | <span class="number">{n}</span> issues',
      results: '{results} results',
      collection: {
        countItems: '{countItems} saved items',
      },
    },
    dates: {
      lastModifiedDate: 'last modified',
      publicationDate: 'published in {date}',
      publicationLifespan: '(published from {from} to {to})',
      includedLifespan: 'available from <span class="date small-caps">{from}</span> to <span class="date small-caps">{to}</span>',
      notYetAvailable: 'not yet available',
    },
    result: {
      label: {
        image: {
          untitled: '(untitled image)',
        },
        entity: {
          untitled: '(untitled)',
        },
      },
    },
    pp: 'no pages | p.{pages} | pp.{pages} ({n} pages)',
    readingTime: '{min} min read',
    reducedReadingTime: 'short text',
    errors: {
      Notauthenticated: 'Please logout, then login again. Authentication failed',
      Invalidauthenticationinformationnostrategyset: 'Please reload the page, a couple of errors occurred',
      SequelizeConnectionRefusedError: 'Please reload the page. Connection troubles when connecting to impresso database',
    },
    paths: {
      authentication: {
        remove: 'during logout.',
      },
      jobs: {
        find: 'while loading user activities',
      },
      images: {
        get: 'while loading contents',
      },
    },
  },
  nl: {
    language: 'Taal',
    languages: {
      de: 'Duits',
      fr: 'Frans',
      en: 'Engels',
    },
  },
  fr: {
    language: 'Langue',
  },
};
