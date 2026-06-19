import { ContentItem } from '@/models/generated/canonical/contentItem'

export const MockContentItemPublicDomain: ContentItem = {
  id: 'waeschfra-1876-04-08-a-i0004',
  issueId: 'waeschfra-1876-04-08-a',
  meta: {
    sourceType: 'newspaper',
    date: '1876-04-08T00:00:00Z',
    mediaId: 'waeschfra',
    sourceMedium: 'print',
    countryCode: 'LU',
    provinceCode: 'na',
    partnerId: 'BNL'
  },
  access: {
    copyright: 'pbl',
    dataDomain: 'pbl',
    accessBitmaps: {
      explore: 'AAAAAAAAAAE=',
      getTranscript: 'AAAAAAAAAAE=',
      getImages: 'AAAAAAAAAAE='
    }
  },
  text: {
    title: '! Consummatum est !',
    content:
      "! Consummatum est ! In der Sonntagsnummer der Etoile belge lefen wir in der revue politique : Le prince de Bismarck est parfaitement remis. Il a repris ses promenades, et l'autre jour, dans la'discussion du projet relatif à l'incorporation «lu duché de I.uxembourg dans la monarchie prussienne, il a pris à cinq reprises la parole. Inutile d'ajouter que le prince chancelier a obtenu ce qu'il demandait: le rejet de tous les amendements et réserves. Le projet a été voté tel <jue le Gouvernement l'avait présenté — — — — — — — — — — — Angesichts dieser osficiellen Nachricht stellen wir an die Herren College« der Presse die kategorische Frage : Auf welcher Seite waren nun die Verräther ? ! —",
    contentLength: 122,
    documentType: 'ci',
    itemType: 'ar',
    langCode: 'fr',
    originalLangCode: 'fr',
    snippet:
      '! Consummatum est ! In der Sonntagsnummer der Etoile belge lefen wir in der revue politique : Le prince de Bismarck est parfaitement remis. Il a repri',
    matches: []
  },
  facsimile: {
    isCoordinatesConverted: true,
    isFrontPage: false,
    lineBreaks: [19, 75, 93, 151, 213, 253, 299, 363, 424, 449, 503, 534, 600, 663, 693],
    pagesCount: 1,
    paragraphBreaks: [20],
    regionBreaks: [20],
    pages: [
      {
        id: 'waeschfra-1876-04-08-a-p0004',
        number: 4,
        regionCoordinates: [
          [1710, 269, 661, 46],
          [1462, 337, 1153, 747]
        ],
        iiif: {
          manifestUrl:
            'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2fp836jb%2fpages%2f4/info.json',
          thumbnailUrl:
            'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2fp836jb%2fpages%2f4/full/150,/0/default.png'
        }
      }
    ]
  },
  semanticEnrichments: {
    ocrQuality: 0.92,
    topics: [
      {
        id: 'tm-fr-all-v2.0_tp19_fr',
        relevance: 0.252,
        label: 'roi · prince · empereur · comte · reine'
      },
      {
        id: 'tm-fr-all-v2.0_tp16_fr',
        relevance: 0.165,
        label: 'conseil · commission · projet · loi · rapport'
      },
      {
        id: 'tm-fr-all-v2.0_tp58_fr',
        relevance: 0.161,
        label: 'der · man · dan · pou · dos'
      }
    ]
  },
  audio: {}
}

export const MockAudioContentItem: ContentItem = {
  id: 'trib_prem-1986-12-14-a-i0001',
  issueId: 'trib_prem-1986-12-14-a',
  relevanceScore: 1,
  meta: {
    sourceType: 'radio_broadcast',
    date: '1986-12-14T00:00:00Z',
    mediaId: 'trib_prem',
    sourceMedium: 'audio',
    countryCode: 'CH',
    provinceCode: 'na',
    partnerId: 'RTS',
    partnerTitle: 'Swiss Broadcasting Corporation (French)'
  },
  access: {
    copyright: 'in_cpy',
    dataDomain: 'prt',
    accessBitmaps: {
      explore: 'AAAAAAAAAAI=',
      getTranscript: 'AAAAAAACAAA=',
      getImages: 'AAAAAAACAAA='
    },
    dataDomainLabel: 'Private',
    copyrightLabel: 'Protected domain: in copyright'
  },
  text: {
    title: 'Interview de Roselyne Crausaz, première femme de Suisse romande à fair[...]',
    contentLength: 3245,
    documentType: 'ci',
    itemType: 'radio_broadcast_episode',
    langCode: 'fr',
    originalLangCode: 'fr',
    snippet:
      'Pierre Berset Daniel Favre pour cette nouvelle édition de tribune de première. Et face à nous, Roselyne Crausaz, jeune célibataire économiste député d',
    matches: []
  },
  facsimile: { lineBreaks: [], paragraphBreaks: [], regionBreaks: [] },
  semanticEnrichments: {
    ocrQuality: 0.99,
    topics: [
      {
        id: 'tm-fr-all-v2.0_tp44_fr',
        relevance: 0.227,
        label: 'temps · argent · gens · foi · chose',
        languageCode: 'fr'
      },
      {
        id: 'tm-fr-all-v2.0_tp87_fr',
        relevance: 0.184,
        label: 'problème · fait · question · exemple · monde',
        languageCode: 'fr'
      },
      {
        id: 'tm-fr-all-v2.0_tp92_fr',
        relevance: 0.143,
        label: 'canton · projet · développement · recherche · région',
        languageCode: 'fr'
      },
      {
        id: 'tm-fr-all-v2.0_tp54_fr',
        relevance: 0.126,
        label: 'parti · conseil · voix · élection · liste',
        languageCode: 'fr'
      },
      {
        id: 'tm-fr-all-v2.0_tp98_fr',
        relevance: 0.059,
        label: 'gouvernement · parti · ministre · président · politique',
        languageCode: 'fr'
      },
      {
        id: 'tm-fr-all-v2.0_tp88_fr',
        relevance: 0.056,
        label: 'conseil · initiative · loi · peuple · projet',
        languageCode: 'fr'
      }
    ]
  },
  audio: { duration: '00:17:43', startTime: '00:00:00', recordsCount: 1 }
}
