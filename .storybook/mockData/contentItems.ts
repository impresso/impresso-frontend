import { ContentItem } from '@/models/generated/schemas/contentItem'

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
  image: {
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
          thumnbnailUrl:
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
