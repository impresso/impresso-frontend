import { MediaSource } from '@/models/generated/canonical'

export const MockMediaSources: MediaSource[] = [
  {
    id: 'waeschfra',
    type: 'newspaper',
    name: "D'Wäschfra",
    languageCodes: ['fr', 'de', 'lb'],
    availableDatesRange: ['1868-05-16T00:00:00.000Z', '1884-07-05T00:00:00.000Z'],
    publishedPeriodYears: [1868, 1884],
    totals: {
      articles: 14032,
      issues: 660,
      pages: 2658
    },
    properties: [
      {
        id: 'countryCode',
        label: 'country code',
        value: 'LU'
      },
      {
        id: 'partnerId',
        label: 'partner id',
        value: 'BNL'
      }
    ]
  }
]

export const GDL: MediaSource = {
  id: 'tageblatt',
  type: 'newspaper',
  name: 'Escher Tageblatt',
  languageCodes: ['fr', 'de', 'lb'],
  availableDatesRange: ['1913-06-30T00:00:00.000Z', '1950-12-30T00:00:00.000Z'],
  publishedPeriodYears: [1913, 1950],
  totals: {
    articles: 281422,
    issues: 11338,
    pages: 79163
  },
  properties: [
    {
      id: 'countryCode',
      label: 'country code',
      value: 'LU'
    },
    {
      id: 'partnerUid',
      label: 'partner uid',
      value: 'BNL'
    },
    {
      id: 'ingestionBatch',
      label: 'ingestion batch',
      value: 'bnl'
    },
    {
      id: 'permalink',
      label: 'permalink',
      value:
        'https://a-z.lu/primo-explore/fulldisplay?docid=ALEPH_LUX01000006009&context=L&vid=BIBNET&search_scope=All_content&tab=all_content&lang=fr_FR'
    },
    {
      id: 'institutionNames',
      label: 'institution names',
      value: 'Bibliothèque Nationale du Luxembourg'
    },
    {
      id: 'institutionLinks',
      label: 'institution links',
      value: 'https://bnl.public.lu'
    },
    {
      id: 'institutionLogos',
      label: 'institution logos',
      value: 'bnl-logo.png'
    },
    {
      id: 'institutionPortal',
      label: 'institution portal',
      value: 'http://www.eluxemburgensia.lu'
    },
    {
      id: 'firstPubYear',
      label: 'first pub year',
      value: '1913'
    },
    {
      id: 'lastPubYear',
      label: 'last pub year',
      value: '1950'
    },
    {
      id: 'ocr',
      label: 'ocr',
      value: 'y'
    },
    {
      id: 'ocrFormat',
      label: 'ocr format',
      value: 'METS/ALTO'
    },
    {
      id: 'olr',
      label: 'olr',
      value: 'y'
    },
    {
      id: 'olrQuality',
      label: 'olr quality',
      value: 'OLR manually corrected and sample-based evaluated, estimated quality high'
    },
    {
      id: 'genericRightStatement',
      label: 'generic right statement',
      value: 'Protected (1913-1950) - Personal, Research and Educational use'
    },
    {
      id: 'topics',
      label: 'topics',
      value: 'Generalist'
    },
    {
      id: 'publisher',
      label: 'publisher',
      value: 'Esch-sur-Alzette:Editpress'
    },
    {
      id: 'bibRecLink',
      label: 'bib record link',
      value:
        'http://www.eluxemburgensia.lu/R/XGERJF3M98DC3G1IUL9BPVVF4BF4KA7PHQ9VMPJLGAJQ8TD8Q7-01446?func=file&file_name=titleinfo&coll=1'
    },
    {
      id: 'bibRecText',
      label: 'bib record text',
      value:
        "Attention : Pendant l'occupation du Grand-Duché de Luxembourg par l'Allemagne nazie - du 10 mai 1940 au 10 septembre 1944 - la presse était d'abord censurée, puis, après confiscation des maisons d'édition et des imprimeries, éditée par l'occupant lui-même, tout en maintenant les entêtes d'avant-guerre. Les éditions du Tageblatt après 1950 sont consultables sur microfilm pour tout lecteur inscrit à la Bibliothèque nationale."
    },
    {
      id: 'letterFont',
      label: 'letter font',
      value: 'gothic then latin after 1945'
    }
  ]
}

export const JDG: MediaSource = {
  id: 'JDG',
  type: 'newspaper',
  name: 'Journal de Geneve',
  publishedPeriodYears: [1826, 1828],
  availableDatesRange: ['1826-01-02', '1828-11-30'],
  languageCodes: ['fr'],
  totals: {
    articles: 7,
    issues: 3,
    pages: 21
  },
  properties: undefined
}

export const Fronde: MediaSource = {
  id: 'Fronde',
  type: 'newspaper',
  name: 'La Fronde',
  publishedPeriodYears: [1872, 1872],
  availableDatesRange: ['1872-03-17T00:00:00.000Z', '1872-12-25T00:00:00.000Z'],
  totals: {
    articles: 211,
    issues: 28,
    pages: 220
  },
  languageCodes: ['fr'],
  properties: [
    {
      label: 'country code',
      value: 'CH',
      id: 'countryCode'
    }
  ]
}
