export default {
  en: {
    connectivityStatus: {
      offline: '⚡ offline!',
      online: ''
    },
    untitled: '(untitled)',
    language: 'Language',
    languages: {
      de: 'German',
      fr: 'French',
      en: 'English'
    },
    counts: {
      filters: 'no filter | 1 filter | {count} filters'
    },
    buckets: {
      type: {
        ad: 'advertisement',
        ar: 'article',
        ob: 'obituary',
        tb: 'tables',
        section: 'section',
        uc: 'unclassified content',
        page: 'No article segmentation',
        death_notice: 'obituary (other)',
        weather: 'weather forecast',
        w: 'weather news (other)',
        picture: 'picture'
      },
      language: {
        de: 'German',
        fr: 'French',
        en: 'English',
        lb: 'Luxembourgish',
        'n/a': 'Undefined language',
        nl: 'Dutch',
        undefined: 'Undefined language'
      },
      accessRight: {
        na: 'not specified (no export)',
        OpenPrivate: 'Personal use',
        Closed: 'Personal use (no export)',
        OpenPublic: 'Public domain'
      },
      country: {
        CH: 'Switzerland',
        LU: 'Luxembourg'
      },
      dataProvider: {
        SNL: 'Swiss National Library',
        BNL: 'Luxembourg National Library',
        NZZ: 'NZZ',
        Migros: 'Migros'
      },
      partner: {
        SNL: 'Swiss National Library',
        BNL: 'Luxembourg National Library',
        NZZ: 'NZZ',
        Migros: 'Migros'
      }
    },
    op: {
      or: 'or',
      and: 'and'
    },
    actions: {
      search: 'Search',
      addFilter: 'Add filter ...',
      addNewDateRangeFilter: 'Add new date filter ...',
      addContextualFilter: 'refine ...',
      agree: 'I agree to the terms of use',
      accept: 'accept',
      browseAll: 'show all ...',
      changePassword: 'Change password',
      compare: 'compare ...',
      detail: 'more details...',
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
      highlightItemOff: 'remove from the "observing" list',
      highlightItemOn: 'add to the "observing" list',
      apply: 'Apply',
      applyChanges: 'Apply changes',
      applyChangesDetailed: 'apply changes (added: {added}, removed: {removed})',
      addToCurrentFilters: 'Add as search filter',
      removeFromCurrentFilters: 'Remove filter from current search',
      resetPassword: 'Reset my password',
      addToCurrentFiltersDetailed:
        'Add selected option as search filter|Add <b> {count}</b> selected options',
      addToCurrentItemsDetailed:
        'View results for the item in this list ... | View results for 1 item in search page... | View results for <b> {count}</b> items in search page ...',
      addRangeToCurrentFilters: 'Apply range',
      viewAll: 'explore all ...',
      select_collection: 'Select a collection',
      login: 'log in',
      generatePattern: 'Generate Pattern',
      getSimilarImages: 'view similar images ...',
      previewFilter: 'Preview filter',
      requestNewPassword: 'Request New Password',
      requestAccount: 'Request User Account',
      resetFilters: 'start fresh, reset filters!',
      resetItems: 'reset list',
      resetMyPassword: 'Reset your password',
      resetObservedItems: 'reset observed list',
      loadRandomPage: 'load random page',
      useCurrentQuery: 'Use most recent search query',
      addCurrentSearch: 'Add filters from your current search query',
      updateCurrentFilters: 'modify filter in current search',
      viewTopic: 'go to topic'
    },
    filters: {
      daterange: {
        item: 'from <span class="date">{start}</span> to <span class="date">{end}</span>'
      }
    },
    types: {
      location: 'location',
      person: 'person',
      human: 'human'
    },
    groupBy: {
      images: 'images',
      articles: 'articles',
      contents: 'contents'
    },
    browse: {
      images: 'Search in <span class="number">{count}</span> published images',
      articles: 'Search in <span class="number">{count}</span> published articles'
    },
    numbers: {
      options: '&nbsp; | (1 option) | ({n} options)',
      moreOptions: '&nbsp; | (1 more option) | ({n} more options)',
      items: '0|<span class="number">1</span> term | <span class="number">{n}</span> terms',
      clusterSize: '&nbsp; | single cluster | <span class="number">{n}</span> passages',
      lexicalOverlap: '<span class="number">{n}%</span> lexical overlap',
      ofPassages:
        '&nbsp; | of <span class="number">{n}</span> passages | of <span class="number">{n}</span> passages',
      passages:
        '0 passages | <span class="number">{n}</span> passage | <span class="number">{n}</span> passages',
      clusters:
        '0 clusters | <span class="number">{n}</span> cluster | <span class="number">{n}</span> clusters',
      articles:
        'no articles | <span class="number">1</span> article | <span class="number">{n}</span> articles',
      articlesInCommon:
        'no articles | <span class="number">1</span> article in common | <span class="number">{n}</span> articles in common',
      images:
        'no images | <span class="number">1</span> image | <span class="number">{n}</span> images',
      pages:
        'no pages | <span class="number">1</span> article | <span class="number">{n}</span> pages',
      issues:
        'no issues | <span class="number">1</span> article | <span class="number">{n}</span> issues',
      results:
        'no results | <span class="number">1</span> result | <span class="number">{n}</span> results',
      resultsPercent: '<span class="number">{n}</span>%',
      resultsAbsolute:
        '<span class="number">0</span> | <span class="number">{n}</span> | <span class="number">{n}</span>',
      articlesMatching:
        'no article contains <span class="highlight">{q}</span> | <span class="number">1</span> article contains <span class="highlight">{q}</span> | <span class="number">{n}</span> articles contain <span class="highlight">{q}</span>',
      articlesMatchingWithinSearch:
        'no articles matching <span class="highlight">{q}</span> and your search filters | <span class="number">1</span> article contains <span class="highlight">{q}</span> and your search filters | <span class="number">{n}</span> articles contain <span class="highlight">{q}</span> and your search filters',
      articlesMatchingSearchFilters:
        'no articles matching your search filters | <span class="number">1</span> article matching your search filters | <span class="number">{n}</span> articles matching your search filters',
      relatedTopics:
        'no related topics | <span class="number">1</span> related topic | <span class="number">{n}</span> related topics',
      resultsParenthesis: '(empty, no results) | (1 result) | ({n} results)',
      collection: {
        countItems: '{countItems} saved items'
      },
      of: '<span class="number">{index}</span> of <span class="number">{total}</span>',
      unigramMentions:
        'no mentions of <span class="ngram-highlight">{unigram}</span> | <span class="number">1</span> mention of <span class="ngram-highlight">{unigram}</span> | <span class="number">{n}</span> mentions of <span class="ngram-highlight">{unigram}</span> ',
      ignoredFilters:
        // eslint-disable-next-line quotes
        "no message | * 1 search filter can't be applied. | * {n} search filters can't be applied.",
      ignoredFiltersDetailed:
        // eslint-disable-next-line quotes
        "no message | * 1 search filter can't be applied ({detail}). | * {n} search filters can't be applied ({detail})."
    },
    dates: {
      lastModifiedDate: 'last modified',
      publicationDate: 'published in {date}',
      publicationLifespan: '(published from {from} to {to})',
      includedLifespan:
        'available from <span class="date small-caps">{from}</span> to <span class="date small-caps">{to}</span>',
      notYetAvailable: 'not yet available',
      fromTo: 'from <span class="date">{from}</span> to <span class="date">{to}</span>',
      allResultsFallBetween:
        'All results fall between <span class="date">{from}</span> and <span class="date">{to}</span>'
    },
    result: {
      label: {
        image: {
          untitled: '(untitled image)'
        },
        entity: {
          untitled: '(untitled)'
        }
      }
    },
    pp: 'no pages | p.{pages} | pp.{pages} ({n} pages)',
    ppOf: 'p.{num} of {pages}',
    providedBy: 'provided by',
    readingTime: '{min} min read',
    reducedReadingTime: 'short text',
    applyCurrentSearchFiltersDisabled: 'Current filters cannot be applied.',
    errors: {
      changePassword: {
        wrongcredentials: 'Wrong credentials provided...',
        NotValidRegex: 'The new password is too easy to guess!'
      },
      GeneralError: 'An error occurred: "{error}". Please try again later.',
      loggedInOnly: 'You need to be logged in to access this content.',
      TypeError: 'TypeError:',
      Timeout: 'Timeout:',
      formError: 'Please correct the form below. <b>{error}</b>',
      BadRequest: 'Bad request.',
      NotImplemented: 'Not implemented.',
      Conflict: {
        UsernameExistError: 'This username is already taken!'
      },
      MethodNotAllowed: 'Method not allowed.',
      BadGateway: {
        SequelizeConnectionRefusedError:
          'Please reload the page. Connection troubles (network) with the impresso database',
        SequelizeConnectionError:
          'Please reload the page. Connection troubles (timeout) with the impresso database'
      },
      LoginFailed: 'Login Failed! The username and/or password was incorrect. Please try again.',
      Notauthenticated: 'Please logout, then login again. Authentication failed',
      Invalidauthenticationinformationnostrategyset:
        'Please reload the page, a couple of errors occurred',
      ResetPasswordGeneralError:
        'The reset password service is not is currently unavailable. Please try again later. <br/><br/>If the problem persists, please contact us at <a href="mailto:info@impresso-project.ch">info@impresso-project.ch</a>. <br/><br/> Message received: <b>{error}</b>'
    },
    paths: {
      newspapers: {
        find: 'while loading list of newspapers'
      },
      authentication: {
        remove: 'during logout.',
        create: 'while checking your credentials'
      },
      jobs: {
        find: 'while loading user activities'
      },
      images: {
        get: 'while loading contents'
      },
      entities: {
        find: 'while loading named entities'
      }
    },
    pages: {
      powervis: {
        title: 'XY visualisation'
      }
    },
    label: {
      useCurrentSearch: 'consider only results matching current search',
      isFront: 'only results on the front page',
      year: {
        title: 'Year | Year | Years',
        optionsTitle: 'Year of publication',
        optionsDescription: 'Total number of articles per year'
      },
      month: {
        title: 'Month | Month | Months',
        optionsTitle: 'Month of publication',
        optionsDescription: 'Total number of articles per month'
      },
      day: {
        title: 'Day | Day | Days',
        optionsTitle: 'Day of publication',
        optionsDescription: 'Total number of articles per day'
      },
      type: {
        title: 'Article content type | Article content types | Article content types',
        optionsTitle: 'Article content type',
        filterTitle: 'article type',
        filtered: 'results are filtered when:',
        selected: 'filter results if <b>one of {count} selected</b> article types applies',
        description: 'check one or more article types to filter results',
        empty: 'No articles types available',
        context: {
          include: 'tagged as',
          exclude: '<b>NOT</b> tagged as'
        }
      },
      topic: {
        title: 'Topic | Topic | Topics',
        filterTitle: 'topic',
        filtered: 'results are filtered when:',
        selected: 'filter results if <b>one of {count} selected</b> topic applies',
        description: 'check one or more topics to filter results',
        empty: 'There is no topic available'
      },
      person: {
        title: 'Person | Person | Persons',
        filterTitle: 'person',
        filtered: 'results are filtered when:',
        selected: 'filter results if <b>one of {count} selected</b> people are mentioned',
        description: 'check one or more persons to filter results',
        empty: 'No person has been recognized in results'
      },
      location: {
        title: 'Location | Location | Locations',
        filterTitle: 'location',
        filtered: 'results are filtered when:',
        selected: 'filter results if <b>one of {count} selected</b> locations are mentioned',
        description: 'check one or more locations to filter results',
        empty: 'There is no location available'
      },
      collection: {
        title: 'Collection | Collection | Collections',
        filterTitle: 'collection',
        filtered: 'results are filtered when:',
        selected: 'filter results if <b>one of {count} selected</b> collection applies',
        description: 'check one or more collection to filter results',
        // eslint-disable-next-line quotes
        empty: "... you haven't saved any result item in your collection"
      },
      newspaper: {
        title: 'Newspaper | Newspaper | Newspapers',
        filterTitle: 'newspaper titles',
        filtered: 'results are filtered when:',
        selected: 'filter results if they appear in <b>one of {count} selected</b> newspapers',
        description: 'check one or more newspaper to filter results',
        empty: '(no results)'
      },
      language: {
        title: 'Language | Language | Languages',
        filterTitle: 'language of articles',
        filtered: 'results are filtered when:',
        selected: 'filter results if they are written in <b>one of {count} selected</b> languages',
        description: 'check one or more language to filter results',
        empty: '(no results)'
      },
      country: {
        title: 'Country | Country | Countries',
        filterTitle: 'country of publication',
        filtered: 'results are filtered when:',
        selected:
          'filter results if they are published in <b>one of {count} selected</b> countries',
        description: 'check one or more countries to filter results',
        empty: '(no results)'
      },
      accessRight: {
        title: 'Access right | Access right | Access Rights',
        filterTitle: 'access right',
        filtered: 'results are filtered when:',
        selected: 'filter results if their access right is <b>one of {count} selected</b>',
        description: 'filter results based on access right',
        empty: '(no results)',
        context: {
          include: 'content available as',
          exclude: 'content <b>NOT</b> available as'
        }
      },
      partner: {
        title: 'Data Provider | Data Provider | Data Providers',
        filterTitle: 'archive',
        filtered: 'results are filtered when:',
        selected: 'filter results if they are published in <b>one of {count} selected</b> archives',
        description: 'check one or more data provider to filter results',
        empty: '(no results)'
      },
      contentLength: {
        title: 'Content Length | Content Length | Content Lengths',
        filterTitle: 'content length',
        filtered: 'results are filtered when:',
        selected: 'filter results if they are within the range',
        description: 'total number of articles per content length',
        empty: '(no results)'
      },
      textReuseClusterDayDelta: {
        filterTitle: 'Time span in days'
      },
      textReuseClusterSize: { filterTitle: 'Cluster size' },
      textReuseClusterLexicalOverlap: { filterTitle: 'Lexical overlap' },
      textReuseCluster: {
        title: 'Text reuse clusters',
        description: 'check one or more text reuse cluster to filter results',
        selected: 'filter results if <b>one of {count} selected</b> text reuse cluster applies',
        filterTitle: 'text reuse clusters',
        filtered: 'results are filtered when:',
        empty: '(no results)',
        context: {
          include: 'included in selected clusters',
          exclude: '<b>NOT</b> included in selected clusters'
        }
      }
    },
    tabs: {
      powervis: 'apply filters to visualisation',
      overview: 'overview',
      recommendations: 'recommendations',
      relatedArticles: '... related articles | 1 related article | {count} related articles',
      articles: '... articles | 1 article | {count} articles',
      entities: {
        observingList: 'observing list (<span style="color: blue">{n}</span>)',
        browseList: 'browse {n} entities'
      }
    },
    sort: {
      name: {
        asc: 'order by name, A-Z',
        desc: 'order by name, Z-A'
      },
      publicationDate: {
        asc: 'order by publication date, oldest',
        desc: 'order by publication date, most recent first'
      },
      relevanceArticles: {
        asc: 'order by relevance in articles, lowest first',
        desc: 'order by relevance in articles, highest first'
      },
      countArticles: {
        asc: 'order by n. of articles, lowest first',
        desc: 'order by n. of articles, highest first'
      },
      countMentions: {
        asc: 'order by n. of mentions, lowest first',
        desc: 'order by n. of mentions, highest first'
      },
      idMentions: {
        asc: 'order by publication date, oldest first',
        desc: 'order by publication date, most recent first'
      },
      relevance: {
        desc: 'relevance'
      },
      date: {
        asc: 'publication date, oldest first',
        desc: 'publication date, most recent first'
      }
    },
    sortBy: 'order by',
    more_info: 'More Info',
    currentSearch: 'current search',
    lexicalOverlap: 'lexical overlap',
    notFound: '(this is an empty list)',
    facsimileView: 'Facsimile',
    closeReadingView: 'Transcript'
  },
  nl: {
    language: 'Taal',
    languages: {
      de: 'Duits',
      fr: 'Frans',
      en: 'Engels'
    }
  },
  fr: {
    language: 'Langue'
  }
}
