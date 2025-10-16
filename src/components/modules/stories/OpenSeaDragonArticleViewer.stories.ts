import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { fn } from 'storybook/test'
import { http, HttpResponse } from 'msw'
import OpenSeadragonArticleViewer from '../OpenSeadragonArticleViewer.vue'

const meta: Meta<typeof OpenSeadragonArticleViewer> = {
  title: 'Components/Modules/OpenSeadragonArticleViewer',
  component: OpenSeadragonArticleViewer,
  tags: ['autodocs'],
  argTypes: {},
  args: {
    'onPage-changed': fn(),
    'onArticle-selected': fn()
  },
  decorators: [() => ({ template: '<div style="width: 800px; height:600px;"><story/></div>' })]
} satisfies Meta<typeof OpenSeadragonArticleViewer>

export default meta
type Story = StoryObj<typeof meta>

const testPages = [
  'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f9tdv2g%2fpages%2f1/info.json',
  'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f9tdv2g%2fpages%2f2/info.json',
  'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f9tdv2g%2fpages%2f3/info.json',
  'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f9tdv2g%2fpages%2f4/info.json',
  'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f9tdv2g%2fpages%2f5/info.json',
  'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f9tdv2g%2fpages%2f6/info.json',
  'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f9tdv2g%2fpages%2f7/info.json',
  'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f9tdv2g%2fpages%2f8/info.json',
  'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f9tdv2g%2fpages%2f9/info.json',
  'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f9tdv2g%2fpages%2f10/info.json',
  'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f9tdv2g%2fpages%2f11/info.json',
  'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f9tdv2g%2fpages%2f12/info.json'
]

const testRegions = [
  {
    articleUid: 'luxland-1957-12-20-a-i0115',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 2381, y: 4425, w: 725, h: 553 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0039',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 1928, y: 4374, w: 140, h: 44 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0039',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 1797, y: 4451, w: 393, h: 60 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0039',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 1645, y: 4547, w: 706, h: 263 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0112',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 1645, y: 3655, w: 702, h: 682 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0117',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 2446, y: 5065, w: 1340, h: 405 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0040',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 2403, y: 4054, w: 677, h: 63 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0040',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 2678, y: 4151, w: 121, h: 48 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0040',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 2383, y: 4237, w: 712, h: 98 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0110',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 162, y: 2398, w: 714, h: 376 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0024',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 2609, y: 3337, w: 263, h: 33 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0024',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 2384, y: 3386, w: 716, h: 498 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0024',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 2384, y: 3896, w: 713, h: 72 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0024',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 3127, y: 2468, w: 716, h: 183 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0024',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 3127, y: 2663, w: 716, h: 538 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0024',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 3129, y: 3207, w: 713, h: 109 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0024',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 3127, y: 3323, w: 716, h: 504 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0024',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 3127, y: 3833, w: 716, h: 148 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0024',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 3127, y: 3989, w: 716, h: 150 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0113',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 1645, y: 4817, w: 703, h: 644 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0025',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 3292, y: 4163, w: 382, h: 33 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0025',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 3127, y: 4210, w: 716, h: 305 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0025',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 3688, y: 4492, w: 122, h: 23 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0111',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 244, y: 5050, w: 1267, h: 321 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0114',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 2472, y: 1987, w: 1268, h: 203 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0022',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 993, y: 1407, w: 536, h: 47 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0022',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 896, y: 1469, w: 713, h: 650 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0022',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 897, y: 2129, w: 716, h: 1547 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0022',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 894, y: 3689, w: 714, h: 259 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0022',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 901, y: 3966, w: 705, h: 301 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0022',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 901, y: 4276, w: 510, h: 22 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0022',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 1483, y: 4275, w: 81, h: 21 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0037',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 1888, y: 324, w: 1696, h: 115 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0037',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 2400, y: 453, w: 679, h: 44 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0037',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 1637, y: 522, w: 716, h: 990 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0037',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 1640, y: 1517, w: 713, h: 302 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0037',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 2378, y: 522, w: 719, h: 1293 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0037',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 3129, y: 523, w: 709, h: 1246 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0037',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 3721, y: 1788, w: 82, h: 16 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0036',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 1179, y: 4362, w: 147, h: 43 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0036',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 1057, y: 4440, w: 395, h: 17 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0036',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 899, y: 4483, w: 707, h: 471 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0021',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 329, y: 4267, w: 362, h: 27 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0021',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 152, y: 4305, w: 714, h: 654 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0021',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 896, y: 465, w: 716, h: 565 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0021',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 901, y: 1052, w: 705, h: 295 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0021',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 901, y: 1362, w: 147, h: 21 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0021',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 1518, y: 1364, w: 50, h: 20 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0038',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 1922, y: 1907, w: 145, h: 48 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0038',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 1638, y: 1991, w: 719, h: 1559 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0020',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 205, y: 662, w: 615, h: 28 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0020',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 155, y: 701, w: 714, h: 1393 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0020',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 157, y: 2101, w: 713, h: 264 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0020',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 153, y: 2814, w: 718, h: 1436 }
  },
  {
    articleUid: 'luxland-1957-12-20-a-i0019',
    pageUid: 'luxland-1957-12-20-a-p0008',
    coords: { x: 161, y: 504, w: 703, h: 138 }
  }
]

const testCurrentPageIndex = 8
const testArticleId = 'luxland-1957-12-20-a-i0038'
const testMarginaliaSections = [
  {
    title: 'Locations',
    isLeft: false,
    items: [
      'Luxembourg (3)',
      'Auch (1)',
      'Battle of Loos (1)',
      'Belgium (1)',
      'Bristol (1)',
      'Charlotte Ray (1)',
      'Esch-sur-Alzette (1)',
      'Globe Theatre (1)',
      'Grenoble (1)',
      'Netherlands (1)'
    ]
  },
  {
    title: 'Persons',
    isLeft: false,
    items: ['Jacqueline Mars (1)', 'Les Bons (1)', 'Ricky Berens (1)']
  },
  {
    title: 'Topics',
    isLeft: true,
    items: [
      'gericht · gefängnis · polizei · angeklagt · fall (6)',
      'arbeit · jugend · schweiz · hilfe · leben (5)',
      'armee · oberst · mann · major · hauptmann (4)',
      'welt · leben · mensch · wort · art (4)',
      'mois · numéro · carte · adresse · poste (4)',
      'zimmer · wort · expedition · mädchen · luxemburg (3)',
      'recht · kirche · freiheit · volk · wort (3)',
      'mann · hand · kopf · nacht · gesicht (3)',
      'janvier · novembre · décembre · octobre · février (3)',
      'membre · comité · assemblée · président · section (3)'
    ]
  }
]

export const Default: Story = {
  args: {
    pages: testPages,
    regions: testRegions,
    defaultCurrentPageIndex: testCurrentPageIndex,
    article: { uid: testArticleId },
    marginaliaSections: testMarginaliaSections
  }
}

export const ForbiddenAccess: Story = {
  parameters: {
    msw: {
      handlers: [
        // Simulate a 403 Forbidden response for the info.json request
        http.get('/forbidden/access/info.json', () => {
          return HttpResponse.json(
            {
              error: 'Forbidden',
              message: 'You do not have permission to access this resource'
            },
            { status: 403 }
          )
        })
      ]
    }
  },
  args: {
    pages: ['/forbidden/access/info.json'],
    regions: [],
    defaultCurrentPageIndex: 0,
    article: { uid: 'test-article-id' },
    marginaliaSections: testMarginaliaSections
  }
}

export const ImagesOnlyForbidden: Story = {
  parameters: {
    msw: {
      handlers: [
        // The info.json request succeeds with proper IIIF manifest data
        http.get(/\/restricted\/images\/info-\d+\.json/, () => {
          return HttpResponse.json({
            '@context': 'http://iiif.io/api/image/2/context.json',
            '@id': '/restricted/images',
            protocol: 'http://iiif.io/api/image',
            width: 4000,
            height: 6000,
            sizes: [
              { width: 2000, height: 3000 },
              { width: 1000, height: 1500 },
              { width: 500, height: 750 },
              { width: 250, height: 375 }
            ],
            tiles: [{ width: 512, height: 512, scaleFactors: [1, 2, 4, 8, 16] }],
            profile: ['http://iiif.io/api/image/2/level2.json']
          })
        }),
        // But any image request returns a 403 Forbidden
        http.get(/\/restricted\/images\/.*\.jpg$/, () => {
          return HttpResponse.json(
            {
              error: 'Forbidden',
              message: 'You need appropriate permissions to view this image'
            },
            { status: 403 }
          )
        })
      ]
    }
  },
  args: {
    pages: ['/restricted/images/info-1.json', '/restricted/images/info-2.json'],
    regions: [],
    defaultCurrentPageIndex: 0,
    article: { uid: 'test-article-id' },
    marginaliaSections: testMarginaliaSections
  }
}
