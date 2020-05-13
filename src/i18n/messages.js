export default {
  en: {
    connectivityStatus: {
      offline: '⚡ offline!',
    },
    untitled: '(untitled)',
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
        tb: 'tables',
        uc: 'unclassified content',
        page: 'page article',
        death_notice: 'obituary (other)',
        weather: 'weather forecast',
        w: 'weather news (other)',
        picture: 'picture',
      },
      language: {
        de: 'German',
        fr: 'French',
        en: 'English',
        lb: 'Luxembourgish',
        'n/a': 'Undefined language',
        nl: 'Dutch',
        undefined: 'Undefined language',
      },
      accessRight: {
        na: 'not specified (no export)',
        OpenPrivate: 'Personal use',
        Closed: 'Personal use (no export)',
        OpenPublic: 'Public domain',
      },
      country: {
        CH: 'Switzerland',
        LU: 'Luxembourg',
      },
      partner: {
        SNL: 'Swiss National Library',
        BNL: 'Luxembourg National Library',
        NZZ: 'NZZ',
        Migros: 'Migros',
      },
    },
    op: {
      or: 'or',
      and: 'and',
    },
    actions: {
      addFilter: 'add filter...',
      addContextualFilter: 'refine ...',
      agree: 'I agree to the terms of use',
      accept: 'accept',
      browseAll: 'show all ...',
      compare: 'compare ...',
      downloadCsv: 'download csv',
      share: 'share...',
      more: 'more...',
      searchMore: 'open in search page...',
      remove: 'remove',
      removeAccount: 'Delete account',
      clear: 'clear',
      close: 'close',
      dismiss: 'dismiss',
      loading: 'loading...',
      reset: 'Reset',
      highlightItemOff: 'de-emphasize',
      highlightItemOn: 'highlight',
      apply: 'Apply',
      applyChanges: 'Apply changes',
      applyChangesDetailed: 'apply changes (added: {added}, removed: {removed})',
      addToCurrentFilters: 'Add as search filter',
      removeFromCurrentFilters: 'Exclude from current search',
      addToCurrentFiltersDetailed: 'Add selected option as search filter|Add <b> {count}</b> selected options',
      addToCurrentItemsDetailed: 'View results for the item in this list ... | View results for 1 item in search page... | View results for <b> {count}</b> items in search page ...',
      viewAll: 'explore all ...',
      select_collection: 'Select a collection',
      login: 'log in',
      generatePattern: 'Generate Pattern',
      getSimilarImages: 'view similar images ...',
      requestNewPassword: 'Request New Password',
      requestAccount: 'Request User Account',
      resetFilters: 'start fresh, reset filters!',
      resetItems: 'reset list',
      loadRandomPage: 'load random page',
      useCurrentQuery: 'Use most recent search query',
    },
    filters: {
      daterange: {
        item: 'from <span class="date">{start}</span> to <span class="date">{end}</span>',
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
      contents: 'contents',
    },
    browse: {
      images: 'Search in <span class="number">{count}</span> published images',
      articles: 'Search in <span class="number">{count}</span> published articles',
    },
    numbers: {
      options: ' | (1 option) | ({n} options)',
      moreOptions: ' | (1 more option) | ({n} more options)',
      items: '0|<span class="number">1</span> term | <span class="number">{n}</span> terms',
      articles: 'no articles | <span class="number">1</span> article | <span class="number">{n}</span> articles',
      images: 'no images | <span class="number">1</span> image | <span class="number">{n}</span> images',
      pages: 'no pages | <span class="number">1</span> article | <span class="number">{n}</span> pages',
      issues: 'no issues | <span class="number">1</span> article | <span class="number">{n}</span> issues',
      results: 'no results | <span class="number">1</span> result | <span class="number">{n}</span> results',
      articlesMatching: 'no articles matching {q}| <span class="number">1</span> article matches {q} | <span class="number">{n}</span> articles found containing <span class="highlight">{q}</span>',
      relatedTopics: 'no related topics | <span class="number">1</span> related topic | <span class="number">{n}</span> related topics',
      resultsParenthesis: '(empty, no results) | (1 result) | ({n} results)',
      collection: {
        countItems: '{countItems} saved items',
      },
      of: '<span class="number">{index}</span> of <span class="number">{total}</span>',
      unigramMentions: 'no mentions of <span class="ngram-highlight">{unigram}</span> in | <span class="number">1</span> mention of <span class="ngram-highlight">{unigram}</span> in | <span class="number">{n}</span> mentions of <span class="ngram-highlight">{unigram}</span> in ',
      ignoredFilters: 'no message | * 1 search filter ignored. | * {n} search filters ignored.',
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
      changePassword: {
        wrongcredentials: 'Wrong credentials provided...',
        NotValidRegex: 'The new password is too easy to guess!',
      },
      loggedInOnly: 'You need to be logged in to access this content.',
      TypeError: 'TypeError:',
      Timeout: 'Timeout:',
      BadRequest: 'Bad request.',
      BadGateway: {
        SequelizeConnectionRefusedError: 'Please reload the page. Connection troubles (network) with the impresso database',
        SequelizeConnectionError: 'Please reload the page. Connection troubles (timeout) with the impresso database',
      },
      LoginFailed: 'Login Failed! The username and/or password was incorrect. Please try again.',
      Notauthenticated: 'Please logout, then login again. Authentication failed',
      Invalidauthenticationinformationnostrategyset: 'Please reload the page, a couple of errors occurred',
    },
    paths: {
      newspapers: {
        find: 'while loading list of newspapers',
      },
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
    pages: {
      powervis: {
        title: 'XY visualisation',
      },
    },
    label: {
      isFront: 'only results on the front page',
      year: {
        title: 'Year | Year | Years',
        optionsTitle: 'Year of publication',
        optionsDescription: 'Total number of articles per year',
      },
      type: {
        title: 'Article content type | Article content types | Article content types',
        optionsTitle: 'Article content type',
        filterTitle: 'filter by article type',
        filtered: 'results are filtered when:',
        selected: 'filter results if <b>one of {count} selected</b> article types applies',
        description: 'check one or more article types to filter results',
        empty: 'No articles types available',
        context: {
          include: 'tagged as',
          exclude: '<b>NOT</b> tagged as',
        },
      },
      topic: {
        title: 'Topic | Topic | Topics',
        filterTitle: 'filter by topic',
        filtered: 'results are filtered when:',
        selected: 'filter results if <b>one of {count} selected</b> topic applies',
        description: 'check one or more topics to filter results',
        empty: 'There is no topic available',
      },
      person: {
        title: 'Person | Person | Persons',
        filterTitle: 'filter by person',
        filtered: 'results are filtered when:',
        selected: 'filter results if <b>one of {count} selected</b> people are mentioned',
        description: 'check one or more persons to filter results',
        empty: 'No person has been recognized in results',
      },
      location: {
        title: 'Location | Location | Locations',
        filterTitle: 'filter by location',
        filtered: 'results are filtered when:',
        selected: 'filter results if <b>one of {count} selected</b> locations are mentioned',
        description: 'check one or more locations to filter results',
        empty: 'There is no location available',
      },
      collection: {
        title: 'Collection | Collection | Collections',
        filterTitle: 'filter by collection',
        filtered: 'results are filtered when:',
        selected: 'filter results if <b>one of {count} selected</b> collection applies',
        description: 'check one or more collection to filter results',
        empty: '... you haven\'t saved any result item in your collection',
      },
      newspaper: {
        title: 'Newspaper | Newspaper | Newspapers',
        filterTitle: 'filter by newspaper titles',
        filtered: 'results are filtered when:',
        selected: 'filter results if they appear in <b>one of {count} selected</b> newspapers',
        description: 'check one or more newspaper to filter results',
        empty: '(no results)',
      },
      language: {
        title: 'Language | Language | Languages',
        filterTitle: 'filter by language of articles',
        filtered: 'results are filtered when:',
        selected: 'filter results if they are written in <b>one of {count} selected</b> languages',
        description: 'check one or more language to filter results',
        empty: '(no results)',
      },
      country: {
        title: 'Country | Country | Countries',
        filterTitle: 'filter by country of publication',
        filtered: 'results are filtered when:',
        selected: 'filter results if they are published in <b>one of {count} selected</b> countries',
        description: 'check one or more countries to filter results',
        empty: '(no results)',
      },
      accessRight: {
        title: 'Access right | Access right | Access Rights',
        filterTitle: 'filter by access right',
        filtered: 'results are filtered when:',
        selected: 'filter results if their access right is <b>one of {count} selected</b>',
        description: 'filter results based on access right',
        empty: '(no results)',
        context: {
          include: 'content available as',
          exclude: 'content <b>NOT</b> available as',
        },
      },
      partner: {
        title: 'Data Provider | Data Provider | Data Providers',
        filterTitle: 'filter by archive',
        filtered: 'results are filtered when:',
        selected: 'filter results if they are published in <b>one of {count} selected</b> archives',
        description: 'check one or more data provider to filter results',
        empty: '(no results)',
      },
    },
    tabs: {
      powervis: 'apply filters to visualisation',
      overview: 'overview',
      recommendations: 'recommendations',
      relatedArticles: '... related articles | 1 related article | {count} related articles',
      articles: '... articles | 1 article | {count} articles',
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
      idMentions: {
        asc: 'order by publication date, oldest first',
        desc: 'order by publication date, most recent first',
      },
      relevance: {
        desc: 'relevance',
      },
      date: {
        asc: 'publication date, oldest first',
        desc: 'publication date, most recent first',
      },
    },
    sortBy: 'order by',
    more_info: 'More Info',
    currentSearch: 'current search',
    lexicalOverlap: 'lexical overlap',
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
