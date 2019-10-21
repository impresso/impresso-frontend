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
        ob: 'obituary',
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
      searchMore: 'open in search page...',
      remove: 'remove',
      clear: 'clear',
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
      SequelizeConnectionRefusedError: 'Please reload the page. Connection troubles (network) with the impresso database',
      SequelizeConnectionError: 'Please reload the page. Connection troubles (timeout) with the impresso database',
    },
    paths: {
      authentication: {
        remove: 'during logout.',
        create: 'while checking your credentials',
      },
      jobs: {
        find: 'while loading user activities',
      },
      images: {
        get: 'while loading contents',
      },
      entities: {
        find: 'while loading named entities',
      },
    },
    label: {
      year: {
        title: 'Year | Years',
      },
      type: {
        title: 'Title | Titles',
      },
      topic: {
        title: 'Topic | Topics',
        filterTitle: 'filter by topic',
        filtered: 'results are filtered when:',
        selected: 'filter results if <b>one of {count} selected</b> topic applies',
        description: 'check one or more topics to filter results',
        empty: 'There is no topic available',
      },
      person: {
        title: 'Person | Persons',
        filterTitle: 'filter by person',
        filtered: 'results are filtered when:',
        selected: 'filter results if <b>one of {count} selected</b> people are mentioned',
        description: 'check one or more topics to filter results',
        empty: 'No person has been recognized in results',
      },
      location: {
        title: 'Location | Locations',
        filterTitle: 'filter by location',
        filtered: 'results are filtered when:',
        selected: 'filter results if <b>one of {count} selected</b> locations are mentioned',
        description: 'check one or more topics to filter results',
        empty: 'There is no location available',
      },
      collection: {
        title: 'Collection | Collections',
        filterTitle: 'filter by collection',
        filtered: 'results are filtered when:',
        selected: 'filter results if <b>one of {count} selected</b> collection applies',
        description: 'check one or more collection to filter results',
        empty: '... you haven\'t saved any result item in your collection',
      },
      newspaper: {
        title: 'Newspaper | Newspapers',
        filterTitle: 'filter by newspaper titles',
        filtered: 'results are filtered when:',
        selected: 'filter results if they appear in <b>one of {count} selected</b> newspapers',
        description: 'check one or more newspaper to filter results',
        empty: '(no results)',
      },
      language: {
        title: 'Language | Languages',
        filterTitle: 'filter by language of articles',
        filtered: 'results are filtered when:',
        selected: 'filter results if they are written in <b>one of {count} selected</b> languages',
        description: 'check one or more language to filter results',
        empty: '(no results)',
      },
      country: {
        title: 'Country | Countries',
        filterTitle: 'filter by country of publication',
        filtered: 'results are filtered when:',
        selected: 'filter results if they are published in <b>one of {count} selected</b> countries',
        description: 'check one or more countries to filter results',
        empty: '(no results)',
      },
    },
    sort: {
      name: {
        asc: 'order by name, A-Z',
        desc: 'order by name, Z-A',
      },
      publicationDate: {
        asc: 'order by publication date, oldest',
        desc: 'order by publication date, most recent first',
      },
      relevanceArticles: {
        asc: 'order by relevance in articles, lowest first',
        desc: 'order by relevance in articles, highest first',
      },
      countArticles: {
        asc: 'order by n. of articles, lowest first',
        desc: 'order by n. of articles, highest first',
      },
      countMentions: {
        asc: 'order by n. of mentions, lowest first',
        desc: 'order by n. of mentions, highest first',
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
