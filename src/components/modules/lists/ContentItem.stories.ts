import { Meta, StoryObj } from '@storybook/vue3'
import ContentItem from './ContentItem.vue'
import { vueRouter } from 'storybook-vue3-router'
import type { ContentItem as ContentItemType } from '@/models/generated/canonical/contentItem'
import { Routes } from '@/router/routes'

export const MockContentItem: ContentItemType = {
  id: 'DTT-1968-09-04-a-i0190',
  issueId: 'DTT-1968-09-04-a',
  meta: {
    sourceType: 'newspaper',
    date: '1968-09-04T00:00:00Z',
    mediaId: 'DTT',
    sourceMedium: 'print',
    countryCode: 'CH',
    provinceCode: 'na',
    partnerId: 'Migros'
  },
  access: {
    copyright: 'in_cpy',
    dataDomain: 'prt',
    accessBitmaps: {
      explore: 'AAAAAAAAAAI=',
      getTranscript: 'AAAAAAEAAAA=',
      getImages: 'AAAAAAEAAAA='
    }
  },
  text: {
    title: 'Bikinis Atomvertriebene kehren heim',
    contentLength: 719,
    documentType: 'ci',
    itemType: 'ar',
    langCode: 'de',
    snippet:
      'Bikinis Atomvertriebene kehren heim W. W. Bikini war bis zum Jahre 1946 ein idyllisches Atoll im Pazifischen Ozean. Amerika hatte nach dem Zweiten Wel',
    matches: [
      {
        fragment:
          '<em>Bikinis</em> Atomvertriebene kehren heim W. W. <em>Bikini</em> war bis zum Jahre 1946 ein idyllisches Atoll'
      },
      {
        fragment:
          ' und Australien übernommen und regierte somit auch über die rund 500 Einwohner von <em>Bikini</em>. Das Mandat wurde'
      },
      {
        fragment:
          ' zu geben braucht. Vor über 20 Jahren wählten die amerikanischen Strategen das Atoll <em>Bikini</em>'
      },
      {
        fragment:
          ' sich niemals auf Kili akklimatisiert habe. Kili sei eine kleine Insel ohne La g une, während <em>Bikini</em>'
      },
      {
        fragment:
          ' in der Kette eines ganzen Atollkreises eine herrliche Lagune habe. Wegen dieser schönen Lagune wurde <em>Bikini</em>'
      },
      {
        fragment:
          ' andere Inseln verpestete. Die Vertriebenen hatten immer wieder in unzähligen Petitionen die Rückkehr nach <em>Bikini</em>'
      },
      {
        fragment:
          ' wird dem Verteidigungsministerium übertragen, das ja schliesslich die Verantwortung für die Vernichtung des alten <em>Bikini</em> trägt'
      },
      {
        fragment:
          ', muss entfernt werden. Die Atomkraftkommission, die im Laufe der Jahre zahlreiche Untersuchungen auf <em>Bikini</em>'
      },
      {
        fragment:
          ' des Bikindvolkes zusammenarbeiten, um eine moderne Gemeinde auf <em>Bikini</em> zu errichten. Die Rückwanderung'
      },
      {
        fragment:
          '. Nicht nur die Einwohner von <em>Bikini</em> selbst, sondern auch vieler anderer Inseln der Marschallgruppe wurden'
      }
    ]
  },
  facsimile: {
    isCoordinatesConverted: true,
    isFrontPage: false,
    pagesCount: 1,
    pages: [
      {
        id: 'DTT-1968-09-04-a-p0003',
        number: 3,
        regionCoordinates: [
          [2214, 2404, 1226, 207],
          [2210, 2651, 657, 1398],
          [2214, 4080, 653, 1213],
          [2907, 2655, 657, 856],
          [2911, 3515, 657, 873],
          [2907, 4406, 661, 891]
        ],
        iiif: {
          manifestUrl: '/proxy/iiif/DTT-1968-09-04-a-p0003/info.json',
          thumbnailUrl: '/proxy/iiif/DTT-1968-09-04-a-p0003/full/150,/0/default.png'
        }
      }
    ]
  },
  semanticEnrichments: {
    ocrQuality: 0.93,
    namedEntities: {
      persons: [],
      locations: [
        {
          id: '2-54-Polynesien',
          count: 1,
          label: 'Polynesien'
        }
      ],
      newsagencies: [],
      organisations: []
    },
    mentions: {
      persons: [
        {
          surfaceForm: 'Bikinis',
          mentionConfidence: 72.58
        },
        {
          surfaceForm: 'Innenminister',
          mentionConfidence: null
        },
        {
          surfaceForm: 'Udall',
          mentionConfidence: 97.55
        },
        {
          surfaceForm: 'Präsident',
          mentionConfidence: null
        },
        {
          surfaceForm: 'Johnson',
          mentionConfidence: 98.05
        },
        {
          surfaceForm: 'Bikinivolkes',
          mentionConfidence: 66.41
        },
        {
          surfaceForm: 'Radioaktiver',
          mentionConfidence: null
        },
        {
          surfaceForm: 'Schrott',
          mentionConfidence: 83.28
        }
      ],
      locations: [
        {
          surfaceForm: 'Pazifischen',
          mentionConfidence: null
        },
        {
          surfaceForm: 'Ozean',
          mentionConfidence: 69.2
        },
        {
          surfaceForm: 'Amerika',
          mentionConfidence: 94.35
        },
        {
          surfaceForm: 'Japan',
          mentionConfidence: 96.1
        },
        {
          surfaceForm: 'Australien',
          mentionConfidence: 95.77
        },
        {
          surfaceForm: 'Pazifik',
          mentionConfidence: 95.17
        },
        {
          surfaceForm: 'Insel',
          mentionConfidence: null
        },
        {
          surfaceForm: 'Kili',
          mentionConfidence: 96.15
        },
        {
          surfaceForm: 'Bikinivolk',
          mentionConfidence: 37.33
        },
        {
          surfaceForm: 'Polynesien',
          mentionConfidence: 44.17
        },
        {
          surfaceForm: 'Frankreich',
          mentionConfidence: 85.75
        }
      ],
      organisations: [
        {
          surfaceForm: 'Nationen',
          mentionConfidence: 84.74
        }
      ],
      newsagencies: []
    },
    topics: [
      {
        id: 'tm-de-all-v2.0_tp77_de',
        relevance: 0.252,
        label: 'regierung · afp · sowjetunion · reuter · moskau'
      },
      {
        id: 'tm-de-all-v2.0_tp50_de',
        relevance: 0.22,
        label: 'china · japan · indien · peking · tokio'
      },
      {
        id: 'tm-de-all-v2.0_tp91_de',
        relevance: 0.158,
        label: 'wasser · betrieb · arbeit · energie · firma'
      },
      {
        id: 'tm-de-all-v2.0_tp93_de',
        relevance: 0.154,
        label: 'schiff · flugzeug · bord · dampfer · hafen'
      },
      {
        id: 'tm-de-all-v2.0_tp24_de',
        relevance: 0.057,
        label: 'könig · kaiser · königin · prinz · prinzessin'
      }
    ],
    collections: [
      {
        id: 'my-collection-1',
        title: 'Collection 1'
      }
    ]
  },
  audio: {}
}

const meta: Meta<typeof ContentItem> = {
  title: 'Components/Modules/lists/ContentItem',
  component: ContentItem,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A component that displays a content item, including its title, snippet, metadata, and other relevant information. It is designed to be used within lists of content items.'
      }
    }
  },
  decorators: [
    vueRouter([
      {
        name: Routes.contentItem.name,
        path: Routes.contentItem.path,
        redirect: '/content-item/mock',
        beforeEnter: () => true
      },
      {
        name: Routes.collections.children.collection.name,
        path: Routes.collections.children.collection.path,
        redirect: '/collections/mock',
        beforeEnter: () => true
      }
    ])
  ],
  tags: ['autodocs'],
  render: args => ({
    components: { ContentItem },
    setup() {
      return { args }
    },
    template: `
          <ContentItem v-bind="args">
            
          </ContentItem>
      `
  })
}

export default meta
type Story = StoryObj<typeof ContentItem>

export const Default: Story = {
  args: {
    contentItem: MockContentItem,
    showDate: true,
    showIcon: true,
    showLink: true,
    showTitle: true,
    showMeta: true,
    showSnippet: true,
    showMatches: true,
    showMediaSource: true,
    showProvider: true,
    showType: true,
    showTopics: true,
    showSpecs: true,
    showContentItemAccess: true
  }
}

export const NewspaperIssueTableOfContents: Story = {
  args: {
    contentItem: MockContentItem,
    showLink: true,
    showMatches: true,
    showSnippet: false,
    showMeta: false
  }
}

export const ShowMeta: Story = {
  args: {
    contentItem: MockContentItem,
    showLink: true,
    showMeta: true
  }
}

export const WithManyPagesAndCompleteWithCollections: Story = {
  args: {
    contentItem: {
      ...MockContentItem,
      facsimile: {
        ...MockContentItem.facsimile,
        pagesCount: 8,
        pages: [
          {
            id: 'DTT-1968-09-04-a-p0003',
            number: 3
          },
          {
            id: 'DTT-1968-09-04-a-p0004',
            number: 4
          },
          {
            id: 'DTT-1968-09-04-a-p0005',
            number: 5
          },
          {
            id: 'DTT-1968-09-04-a-p0006',
            number: 6
          },
          {
            id: 'DTT-1968-09-04-a-p0007',
            number: 7
          },
          {
            id: 'DTT-1968-09-04-a-p0008',
            number: 8
          },
          {
            id: 'DTT-1968-09-04-a-p0009',
            number: 9
          },
          {
            id: 'DTT-1968-09-04-a-p0010',
            number: 10
          }
        ]
      }
    },
    showCollections: true,
    showLink: true,
    showMeta: true,
    showTitle: true,
    showSnippet: true,
    showSpecs: true,
    showProvider: true,
    showContentItemAccess: true,
    showMediaSource: true,
    showDate: true,
    showIcon: true,
    showType: true,
    showTopics: true,
    showSemanticEnrichments: true
  }
}
