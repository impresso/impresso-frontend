import { describe, test as it } from 'vitest'
import assert from 'assert';

import {
  getNamedEntitiesFromArticleResponse,
  getAnnotateTextTree
} from '../../../src/logic/articleAnnotations';


const TestAnnotationConfiguration = Object.freeze({
  line: {
    start: () => '<p class="line">',
    end: () => '</p>'
  },
  region: {
    start: () => '<div class="region">',
    end: () => '</div>'
  },
  passage: {
    start: (entity, isContinuation) => `<span class="tr-passage ${isContinuation ? ' continuation' : ''}" ${entity.id ? `data-id="${entity.id}"` : ''}>`,
    end: () => '</span>'
  },
  namedEntity: {
    start: (entity, isContinuation) => `<span class="entity ${entity.type}${isContinuation ? ' continuation' : ''}">`,
    end: () => '</span>'
  }
})

const articleResponse = {
  uid: 'indeplux-1923-09-04-a-i0071',
  type: 'ad',
  title: 'Publicité 9 Page 2',
  size: 938,
  nbPages: 1,
  pages: [
    {
      uid: 'indeplux-1923-09-04-a-p0002',
      num: 2,
      issueUid: 'indeplux-1923-09-04-a',
      newspaperUid: 'indeplux',
      iiif: 'https://iiif.eluxemburgensia.lu/iiif/2/ark:%2f70795%2fs6bvf8%2fpages%2f2/info.json',
      iiifThumbnail: 'https://iiif.eluxemburgensia.lu/iiif/2/ark:%2f70795%2fs6bvf8%2fpages%2f2/full/150,/0/default.png',
      accessRights: 'nd',
      labels: [
        'page'
      ],
      hasCoords: true,
      hasErrors: false,
      regions: []
    }
  ],
  isCC: true,
  excerpt: 'Succursale à Luxembourg Téléphone 503 La maison Mercier garantit sur facture que se vins ont été mis en bouteilles avant...',
  persons: [
    {
      uid: 'aida-0001-50-Roy_Mathias',
      relevance: 1
    }
  ],
  locations: [
    {
      uid: 'aida-0001-54-Luxembourg',
      relevance: 3
    },
    {
      uid: 'aida-0001-54-Thionville',
      relevance: 1
    }
  ],
  language: 'n/a',
  content: 'Succursale à Luxembourg Téléphone 503 La maison Mercier garantit sur facture que se vins ont été mis en bouteilles avant la guerre B— . " ~ LA MAISON Mathias LUX Télépli. 41-35, LUXEMBOURG, rue Fellip, 24,Télépli, 41-55 recommande aux £ cursionnistes et T&uristas ses 5728 Auto-Cars et Voitures de ville avec une et plusieurs places MIME AVEC tlIS E? MIETÎES Déménagement. Prix modérés B -P-.. •— .~B| I\' TH.JL1TSLU2I ! Société Anonyme de Transports et d\'Enfrepôfs { j Siège social à LUXEMBOURG Avenue de la Liberté (Rue Dicks) (Anciennement J.-P. BALANCE.-Maison fondée en 1890) j j | Téléphones : gggg, j 4M «g Transports Internationaux Agence en douane î Transit Affrètements - Consignations « Groupages SUCCURSALES à: Thionville Igel Wasserbillig Téléphone No 79 Téléphone No 2 Trêves — Téléphone No 226 5 5925 L’imprimerie Joseph BEFFORT, 3, Place d’Armes, 3 se recommande pour la confection de labeurs typographiques en tous genres ',
  contentLineBreaks: [23,37,83,130,139,149,161,219,234,263,272,303,332,358,385,401,417,452,468,494,527,583,612,638,665,706,721,750,781,814,863,899,937],
  regionBreaks: [],
  issue: {
    uid: 'indeplux-1923-09-04-a',
    cover: '',
    labels: [
      'issue'
    ],
    fresh: false,
    accessRights: 'Closed',
    date: '1923-09-04T00:00:00.000Z',
    year: '1923'
  },
  newspaper: {
    uid: 'indeplux',
    acronym: 'indeplux',
    labels: [
      'newspaper'
    ],
    languages: [],
    properties: [],
    included: true,
    name: 'L\'indépendance luxembourgeoise',
    endYear: null,
    startYear: null,
    firstIssue: {
      uid: 'indeplux-1871-10-01-a',
      cover: '',
      labels: [
        'issue'
      ],
      fresh: false,
      accessRights: 'Closed',
      date: '1871-10-01T00:00:00.000Z',
      year: '1871'
    },
    lastIssue: {
      uid: 'indeplux-1933-12-30-a',
      cover: '',
      labels: [
        'issue'
      ],
      fresh: false,
      accessRights: 'Closed',
      date: '1933-12-30T00:00:00.000Z',
      year: '1933'
    },
    countArticles: 753525,
    countIssues: 18350,
    countPages: 71650,
    fetched: true,
    deltaYear: null
  },
  collections: [],
  tags: [],
  country: 'LU',
  year: 1923,
  date: '1923-09-04T00:00:00.000Z',
  isFront: false,
  accessRight: 'na',
  labels: [
    'article'
  ],
  mentions: [
    {
      person: [
        [
          150,
          11
        ],
        [
          517,
          9
        ]
      ]
    },
    {
      location: [
        [
          13,
          10
        ],
        [
          178,
          10
        ],
        [
          484,
          10
        ],
        [
          722,
          10
        ]
      ]
    }
  ],
  regions: [
    {
      pageUid: 'indeplux-1923-09-04-a-p0002',
      coords: [
        2142,
        3618,
        1103,
        3106
      ],
      g: [
        'Succursale à <span class="location">Luxembourg</span>',
        ' Téléphone 503',
        ' La maison Mercier garantit sur facture que se',
        ' vins ont été mis en bouteilles avant la guerre',
        ' B— . " ~',
        ' LA MAISON',
        ' <span class="person">Mathias LUX</span>',
        ' Télépli. 41-35, <span class="location">LUXEMBOURG</span>, rue Fellip, 24,Télépli, 41-55',
        ' recommande aux',
        ' £ cursionnistes et T&uristas',
        ' ses 5728',
        ' Auto-Cars et Voitures de ville',
        ' avec une et plusieurs places',
        ' MIME AVEC tlIS E? MIETÎES',
        ' Déménagement. Prix modérés',
        ' B -P-.. •— .~B|',
        ' I\' TH.JL1TSLU2I',
        ' ! Société Anonyme de Transports et',
        ' d\'Enfrepôfs { j',
        ' Siège social à <span class="location">LUXEMBOURG</span>',
        ' Avenue de la Liberté (<span class="person">Rue Dicks</span>)',
        ' (Anciennement J.-P. BALANCE.-Maison fondée en 1890) j j',
        ' | Téléphones : gggg, j 4M «g',
        ' Transports Internationaux',
        ' Agence en douane î Transit',
        ' Affrètements - Consignations « Groupages',
        ' SUCCURSALES à:',
        ' <span class="location">Thionville</span> Igel Wasserbillig',
        ' Téléphone No 79 Téléphone No 2',
        ' Trêves — Téléphone No 226 5 5925',
        ' L’imprimerie Joseph BEFFORT, 3, Place d’Armes, 3',
        ' se recommande pour la confection de',
        ' labeurs typographiques en tous genres',
        ' '
      ],
      iiifFragment: 'https://iiif.eluxemburgensia.lu/iiif/2/ark:%2f70795%2fs6bvf8%2fpages%2f2/2142,3618,1103,3106/full/0/default.png'
    }
  ],
  v: ''
};

const articleResponseWithMultipleRegions = {
  uid: 'indeplux-1923-09-04-a-i0035',
  type: 'ar',
  title: 'A la Schobermesse',
  size: 515,
  nbPages: 1,
  pages: [
    {
      uid: 'indeplux-1923-09-04-a-p0002',
      num: 2,
      issueUid: 'indeplux-1923-09-04-a',
      newspaperUid: 'indeplux',
      iiif: 'https://iiif.eluxemburgensia.lu/iiif/2/ark:%2f70795%2fs6bvf8%2fpages%2f2/info.json',
      iiifThumbnail: 'https://iiif.eluxemburgensia.lu/iiif/2/ark:%2f70795%2fs6bvf8%2fpages%2f2/full/150,/0/default.png',
      accessRights: 'nd',
      labels: [
        'page'
      ],
      hasCoords: true,
      hasErrors: false,
      regions: []
    }
  ],
  isCC: true,
  excerpt: 'Le nombre des visiteurs du champ de foire a été moins considérable ces deux derniers jours, que pendant’ la journée...',
  locations: [
    {
      uid: 'aida-0001-54-Celle',
      relevance: 1
    }
  ],
  language: 'fr',
  content: 'A la Schobermesse Le nombre des visiteurs du champ de foire a été moins considérable ces deux derniers jours, que pendant’ la journée de dimanche. Les divers établissements ont néanmoins fait de bonnes recettes. Celle du dimanche se monte à environ 16.000 francs pour le «Watershut» et 9000 fr. pour le «Whip». Hier au soir, une femme d’origine allemande a fait une chute de cheval à l’Hippodrome. Elle tomba sur la rampe et se fit quelques blessures d’une certaine importance qui nécessiteront des soins médicaux. ',
  issue: {
    uid: 'indeplux-1923-09-04-a',
    cover: '',
    labels: [
      'issue'
    ],
    fresh: false,
    accessRights: 'Closed',
    date: '1923-09-04T00:00:00.000Z',
    year: '1923'
  },
  newspaper: {
    uid: 'indeplux',
    acronym: 'indeplux',
    labels: [
      'newspaper'
    ],
    languages: [],
    properties: [],
    included: true,
    name: 'L\'indépendance luxembourgeoise',
    endYear: null,
    startYear: null,
    firstIssue: {
      uid: 'indeplux-1871-10-01-a',
      cover: '',
      labels: [
        'issue'
      ],
      fresh: false,
      accessRights: 'Closed',
      date: '1871-10-01T00:00:00.000Z',
      year: '1871'
    },
    lastIssue: {
      uid: 'indeplux-1933-12-30-a',
      cover: '',
      labels: [
        'issue'
      ],
      fresh: false,
      accessRights: 'Closed',
      date: '1933-12-30T00:00:00.000Z',
      year: '1933'
    },
    countArticles: 753525,
    countIssues: 18350,
    countPages: 71650,
    fetched: true,
    deltaYear: null
  },
  collections: [],
  tags: [],
  country: 'LU',
  year: 1923,
  date: '1923-09-04T00:00:00.000Z',
  isFront: false,
  accessRight: 'na',
  labels: [
    'article'
  ],
  mentions: [
    null,
    {
      location: [
        [
          212,
          5
        ]
      ]
    }
  ],
  contentLineBreaks: [
    17,
    53,
    93,
    136,
    176,
    217,
    255,
    294,
    334,
    374,
    415,
    456,
    498,
    514
  ],
  regionBreaks: [18, 416],
  regions: [
    {
      pageUid: 'indeplux-1923-09-04-a-p0002',
      coords: [
        419,
        6193,
        389,
        43
      ],
      g: [
        'A la Schobermesse'
      ],
      iiifFragment: 'https://iiif.eluxemburgensia.lu/iiif/2/ark:%2f70795%2fs6bvf8%2fpages%2f2/419,6193,389,43/full/0/default.png'
    },
    {
      pageUid: 'indeplux-1923-09-04-a-p0002',
      coords: [
        160,
        6251,
        879,
        455
      ],
      g: [
        ' Le nombre des visiteurs du champ de',
        ' foire a été moins considérable ces deux',
        ' derniers jours, que pendant’ la journée de',
        ' dimanche. Les divers établissements ont',
        ' néanmoins fait de bonnes recettes. <span class="location">Celle</span>',
        ' du dimanche se monte à environ 16.000',
        ' francs pour le «Watershut» et 9000 fr.',
        ' pour le «Whip». Hier au soir, une femme',
        ' d’origine allemande a fait une chute de',
        ' cheval à l’Hippodrome. Elle tomba sur la'
      ],
      iiifFragment: 'https://iiif.eluxemburgensia.lu/iiif/2/ark:%2f70795%2fs6bvf8%2fpages%2f2/160,6251,879,455/full/0/default.png'
    },
    {
      pageUid: 'indeplux-1923-09-04-a-p0002',
      coords: [
        1073,
        1657,
        846,
        141
      ],
      g: [
        ' rampe et se fit quelques blessures d’une',
        ' certaine importance qui nécessiteront des',
        ' soins médicaux.',
        ' '
      ],
      iiifFragment: 'https://iiif.eluxemburgensia.lu/iiif/2/ark:%2f70795%2fs6bvf8%2fpages%2f2/1073,1657,846,141/full/0/default.png'
    }
  ],
  matches: [],
  v: ''
};

const articleResponseWithMultilineEntity = {
  uid: 'indeplux-1923-09-04-a-i0056',
  type: 'ar',
  title: 'Un télégramme du roi George',
  size: 534,
  nbPages: 1,
  isCC: true,
  excerpt: 'Le télégramme suivant a ete adresse par le roi George V à l’Empereur du Japon: «Je me hâte d’exprimer à...',
  locations: [
    {
      uid: 'aida-0001-54-Boy_George',
      relevance: 1
    },
    {
      uid: 'aida-0001-54-Japan',
      relevance: 1
    }
  ],
  language: 'fr',
  content: 'Un télégramme du roi George Le télégramme suivant a ete adresse par le roi George V à l’Empereur du Japon: «Je me hâte d’exprimer à V. M. Impériale l’horreur avec laquelle j’ai appris le désastre épouvantable qui a frappé votre pays ainsi que les terribles conséquences qui en ont été la suite, à Tokio et à Yokohama. Je sympathise profondément. avec V. M. dans ces circonstances effrayantes, qui ont entraîné la perte de vies et de propriétés, ainsi que des souffrances impossibles à décrire, subies par des milliers de vos sujets.» ',
  collections: [],
  tags: [],
  country: 'LU',
  year: 1923,
  date: '1923-09-04T00:00:00.000Z',
  isFront: true,
  accessRight: 'na',
  labels: [
    'article'
  ],
  mentions: [
    {
      person: [
        [
          17,
          13
        ]
      ]
    },
    {
      location: [
        [
          75,
          6
        ],
        [
          100,
          5
        ]
      ]
    }
  ],
  contentLineBreaks: [
    27,
    63,
    100,
    104,
    138,
    183,
    222,
    257,
    305,
    332,
    379,
    421,
    459,
    504,
    533
  ],
  regionBreaks: [
    28
  ],
  matches: [],
  v: ''
};

/**
 * Add line tags to legacy text, split it by tags and update classes.
 */
const expectedAnnotatedText = ['<div class="region">'].concat(articleResponse.regions[0].g.map(line => {
  const items = line
    .split(/[<>]/)
    .filter(x => x !== '')
    .map(l => {
      return l.startsWith('span') || l.startsWith('/span')
        ? `<${l.replace('person', 'entity person').replace('location', 'entity location')}>`
        : l
    });
  return ['<p class="line">', items, '</p>'].flat();
}).flat()).concat(['</div>']);

const expectedAnnotatedTextWithMultipleRegions = articleResponseWithMultipleRegions.regions.map(({ g }) => {
  return ['<div class="region">'].concat(g.map(line => {
    const items = line
      .split(/[<>]/)
      .filter(x => x !== '')
      .map(l => {
        return l.startsWith('span') || l.startsWith('/span')
          ? `<${l.replace('person', 'entity person').replace('location', 'entity location')}>`
          : l
      });
    return ['<p class="line">', items, '</p>'].flat();
  })).concat(['</div>']).flat();
}).flat();

describe('getNamedEntitiesFromArticleResponse', () => {
  it('extracts entities', () => {
    const entities = getNamedEntitiesFromArticleResponse(articleResponse);
    const expectedEntities = [
      {
        id: 'person-0',
        kind: 'namedEntity',
        type: 'person',
        offset: { start: 150, end: 161 }
      },
      {
        id: 'person-1',
        kind: 'namedEntity',
        type: 'person',
        offset: { start: 517, end: 526 }
      },
      {
        id: 'location-0',
        kind: 'namedEntity',
        type: 'location',
        offset: { start: 13, end: 23 }
      },
      {
        id: 'location-1',
        kind: 'namedEntity',
        type: 'location',
        offset: { start: 178, end: 188 }
      },
      {
        id: 'location-2',
        kind: 'namedEntity',
        type: 'location',
        offset: { start: 484, end: 494 }
      },
      {
        id: 'location-3',
        kind: 'namedEntity',
        type: 'location',
        offset: { start: 722, end: 732 }
      },
    ];

    assert.deepEqual(entities, expectedEntities);
  });
});

describe('getAnnotateTextTree', () => {

  const flattenDeep = (arr) => arr.flatMap((subArray) => Array.isArray(subArray) ? flattenDeep(subArray) : subArray)

  function annotationTreeAsText(item, annotationConfiguration) {
    if (typeof item === 'string') return [item]
    let textParts = []
    if (item.entity) textParts.push(annotationConfiguration[item.entity.kind].start(item.entity, item.isContinuation))

    textParts.push(item.children.map(child => annotationTreeAsText(child, annotationConfiguration)))

    if (item.entity) textParts.push(annotationConfiguration[item.entity.kind].end())

    return flattenDeep(textParts).join('')
  }

  it('annotates a text with a single region', () => {
    const entities = getNamedEntitiesFromArticleResponse(articleResponse);
    const lineBreaks = articleResponse.contentLineBreaks;
    const regionBreaks = articleResponse.regionBreaks;

    const elementsTree = getAnnotateTextTree(articleResponse.content, entities, lineBreaks, regionBreaks);
    // console.log(elementsTree)
    const annotatedText = annotationTreeAsText(elementsTree, TestAnnotationConfiguration)

    assert.deepStrictEqual(annotatedText, expectedAnnotatedText.join(''));
  })

  it('annotates a text with multiple regions', () => {
    const entities = getNamedEntitiesFromArticleResponse(articleResponseWithMultipleRegions);
    const lineBreaks = articleResponseWithMultipleRegions.contentLineBreaks;
    const regionBreaks = articleResponseWithMultipleRegions.regionBreaks;

    const elementsTree = getAnnotateTextTree(articleResponseWithMultipleRegions.content, entities, lineBreaks, regionBreaks);
    // console.log(elementsTree)
    const annotatedText = annotationTreeAsText(elementsTree, TestAnnotationConfiguration)

    assert.deepStrictEqual(annotatedText, expectedAnnotatedTextWithMultipleRegions.join(''));
  })

  it('annotates a text with a multiline entity', () => {
    const entities = getNamedEntitiesFromArticleResponse(articleResponseWithMultilineEntity);
    const lineBreaks = articleResponseWithMultilineEntity.contentLineBreaks;
    const regionBreaks = articleResponseWithMultilineEntity.regionBreaks;

    const elementsTree = getAnnotateTextTree(articleResponseWithMultilineEntity.content, entities, lineBreaks, regionBreaks);
    const annotatedText = annotationTreeAsText(elementsTree, TestAnnotationConfiguration)

    const expectedAnnotatedText = [
      '<div class="region">',
      '<p class="line">',
      'Un télégramme du ',
      '<span class="entity person">',
      'roi George',
      '</span>',
      '</p>',
      '</div>',
      '<div class="region">',
      '<p class="line">',
      '<span class="entity person continuation">',
      ' Le',
      '</span>',
      ' télégramme suivant a ete adresse',
      '</p>',
      '<p class="line">',
      ' par le roi ',
      '<span class="entity location">',
      'George',
      '</span>',
      ' V à l’Empereur du ',
      '</p>',
      '<p class="line">',
      '<span class="entity location">',
      'Japo',
      '</span>',
      '</p>',
      '<p class="line">',
      '<span class="entity location continuation">',
      'n',
      '</span>',
      ': «Je me hâte d’exprimer à V. M. ',
      '</p>',
      '<p class="line">',
      'Impériale l’horreur avec laquelle j’ai appris',
      '</p>',
      '<p class="line">',
      ' le désastre épouvantable qui a frappé ',
      '</p>',
      '<p class="line">',
      'votre pays ainsi que les terribles ',
      '</p>',
      '<p class="line">',
      'conséquences qui en ont été la suite, à Tokio et',
      '</p>',
      '<p class="line">',
      ' à Yokohama. Je sympathise ',
      '</p>',
      '<p class="line">',
      'profondément. avec V. M. dans ces circonstances',
      '</p>',
      '<p class="line">',
      ' effrayantes, qui ont entraîné la perte de',
      '</p>',
      '<p class="line">',
      ' vies et de propriétés, ainsi que des ',
      '</p>',
      '<p class="line">',
      'souffrances impossibles à décrire, subies par',
      '</p>',
      '<p class="line">',
      ' des milliers de vos sujets.»',
      '</p>',
      '<p class="line">',
      ' ',
      '</p>',
      '</div>',
    ];

    assert.deepStrictEqual(annotatedText, expectedAnnotatedText.join(''));
  })
});
