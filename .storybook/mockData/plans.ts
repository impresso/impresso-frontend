export const MockPlansModalContent = {
  values: {
    RequirementToU: 'terms-of-use',
    RequirementImpressoAccount: 'impresso-account',
    RequirementProofStudentEnrollment: 'proof-of-student-enrollment',
    RequirementProofAcademicAffiliation: 'proof-of-academic-affiliation',
    RequirementDataAccessGranted: 'data-access-granted',
    GenericFeatureExploreAll: 'explore-all-features',
    GenericFeatureCreateStoreExportCollections: 'create-store-export-collections',
    GenericFeatureGenerateApiKeys: 'generate-api-keys',
    DataFeatureMetadataPublicDomain: 'metadata-public-domain',
    DataFeatureMetadata: 'metadata',
    DataFeatureFacsimilesPublicDomain: 'facsimiles-public-domain',
    DataFeatureFacsimiles: 'facsimiles',
    DataFeatureAudioPublicDomain: 'audio-public-domain',
    DataFeatureAudio: 'audio',
    DataFeatureTranscriptsPublicDomain: 'transcripts-public-domain',
    DataFeatureTranscripts: 'transcripts',
    DataFeatureImagesPublicDomain: 'images-public-domain',
    DataFeatureImages: 'images',
    DataFeatureSemanticEnrichmentsPublicDomain: 'semantic-enrichments-public-domain',
    DataFeatureSemanticEnrichments: 'semantic-enrichments',
    ExportFeatureMetadataPublicDomain: 'export-metadata-public-domain',
    ExportFeatureMetadata: 'export-metadata',
    ExportFeatureFacsimilesPublicDomain: 'export-facsimiles-public-domain',
    ExportFeatureFacsimiles: 'export-facsimiles',
    ExportFeatureAudioPublicDomain: 'export-audio-public-domain',
    ExportFeatureAudio: 'export-audio',
    ExportFeatureTranscriptsPublicDomain: 'export-transcripts-public-domain',
    ExportFeatureTranscripts: 'export-transcripts',
    ExportFeatureImagesPublicDomain: 'export-images-public-domain',
    ExportFeatureImages: 'export-images',
    ExportFeatureSemanticEnrichmentsPublicDomain: 'semantic-enrichments-public-domain',
    ExportFeatureSemanticEnrichments: 'export-semantic-enrichments',
    PlanIconRestrictedAccessNoDownload: 'restricted-yes-access-no-download',
    PlanIconRestrictedAccessDownload: 'restricted-yes-access-download',
    PlanIconPublicDomainAccessNoDownload: 'public-domain-yes-access-no-download',
    PlanGuest: 'guest',
    PlanImpressoUser: 'plan-basic',
    PlanEducational: 'plan-educational',
    PlanResearcher: 'plan-researcher',
    PlanResearcherPlus: 'academic-user-plus',
    PlanNone: 'no-plan',
    PlanSpecialMembership: 'plan-special-membership'
  },
  AvailablePlans: ['plan-basic', 'plan-educational', 'plan-researcher'],
  PlanLabels: {
    guest: 'Guest',
    'plan-basic': 'Basic User',
    'plan-educational': 'Student User',
    'plan-researcher': 'Academic User',
    'academic-user-plus': 'Academic User +',
    'no-plan': 'No Plan',
    'plan-special-membership': 'Special Membership'
  },
  DataFeatureLabels: {
    metadata: 'Metadata (bibliographic, descriptive, technical - public and protected domain)',
    facsimiles: 'Facsimiles  - Protected Domain',
    'facsimiles-public-domain': 'Facsimiles - Public domain',
    audio: 'Audio records - Protected Domain',
    'audio-public-domain': 'Audio records - Public Domain',
    transcripts: 'Transcripts - Protected Domain',
    'transcripts-public-domain': 'Transcripts - Public Domain',
    images: 'Images (illustrations, photographs, etc.) - Protected Domain',
    'images-public-domain': 'Images (illustrations, photographs, etc.) - Public Domain',
    'semantic-enrichments':
      'Named entities, text reuse clusters, topics, image classification etc. (for both public and protected data)',
    'semantic-enrichments-public-domain':
      'Named entities, text reuse clusters, topics, image classification etc. </br><b>Public Domain</b>'
  },
  PlanAvailabilityLabels: {
    guest: 'Public Domain, always accessible',
    'plan-basic': 'Feature accessible with a basic account',
    'plan-educational': 'Feature accessible with a student account',
    'plan-researcher': 'Feature accessible with an academic account',
    'academic-user-plus': 'Feature accessible with an academic account',
    'no-plan': 'Feature not accessible'
  },
  PlanIconLabels: {
    'restricted-yes-access-no-download':
      'Access to protected data determined only by Impresso partners. <b>No download possible<b>',
    'restricted-yes-access-download':
      'Access and download to protected data determined only by Impresso partners.',
    'public-domain-yes-access-no-download': 'Access Granted, <b>Download Not Available<b>',
    'by-collection': 'Subject to partner conditions – see Corpus Catalogue'
  },
  GenericFeatureLabels: {
    'explore-all-features': 'Explore all features of the Impresso Web App and Datalab.',
    'create-store-export-collections': 'Create, store and export personal collections.',
    'generate-api-keys': 'Generate API keys to access parts of our corpus via the Impresso Datalab.'
  },
  RequirementsLabels: {
    'terms-of-use': 'Agreement to Terms of Use',
    'impresso-account': 'Impresso Account creation',
    'proof-of-student-enrollment': 'Proof of enrollment in higher education (for students)',
    'proof-of-academic-affiliation': 'Proof of academic affiliation',
    'data-access-granted': 'Account creation request must receive approval from content provider'
  },
  ExportFeatureLabels: {
    'export-metadata': 'Export Metadata',
    'export-metadata-public-domain': 'Export Metadata - Public Domain',
    'export-facsimiles': 'Export Facsimiles',
    'export-facsimiles-public-domain': 'Export Facsimiles - Public Domain',
    'export-audio': 'Export Audio',
    'export-audio-public-domain': 'Export Audio - Public Domain',
    'export-transcripts': 'Export Transcripts',
    'export-transcripts-public-domain': 'Export Transcripts - Public Domain',
    'export-images': 'Export Images',
    'export-images-public-domain': 'Export Images - Public Domain',
    'export-semantic-enrichments': 'Export Semantic Enrichments',
    'semantic-enrichments-public-domain': 'Export Semantic Enrichments - Public Domain'
  },
  plans: [
    {
      title: 'Guest User',
      icon: 'basic',
      id: 'guest',
      name: 'guest',
      ordering: 1,
      features: [
        {
          ref: 'metadata'
        },
        {
          ref: 'export-metadata'
        },
        {
          ref: 'facsimiles-public-domain'
        },
        {
          ref: 'audio-public-domain'
        },
        {
          ref: 'transcripts-public-domain'
        },
        {
          ref: 'export-transcripts-public-domain'
        },
        {
          ref: 'images-public-domain'
        },
        {
          ref: 'semantic-enrichments'
        },
        {
          ref: 'export-semantic-enrichments'
        }
      ],
      requirements: ['terms-of-use'],
      body: 'The Guest User Plan allows anyone to explore the public domain part of the Impresso Corpus, as well as to access all metadata and semantic enrichments through the Impresso Web App and Datalab, without the need to create an account.'
    },
    {
      title: 'Basic User',
      icon: 'basic',
      id: 'plan-basic',
      name: 'plan-basic',
      ordering: 2,
      features: [
        {
          ref: 'explore-all-features'
        },
        {
          ref: 'create-store-export-collections'
        },
        {
          ref: 'generate-api-keys'
        },
        {
          ref: 'metadata-public-domain'
        },
        {
          ref: 'metadata'
        },
        {
          ref: 'export-metadata'
        },
        {
          ref: 'facsimiles-public-domain'
        },
        {
          ref: 'facsimiles',
          icon: 'by-collection'
        },
        {
          ref: 'audio-public-domain'
        },
        {
          ref: 'audio',
          icon: 'by-collection'
        },
        {
          ref: 'transcripts-public-domain'
        },
        {
          ref: 'transcripts',
          icon: 'by-collection'
        },
        {
          ref: 'export-transcripts-public-domain'
        },
        {
          ref: 'export-transcripts',
          icon: 'by-collection'
        },
        {
          ref: 'images-public-domain'
        },
        {
          ref: 'images',
          icon: 'by-collection'
        },
        {
          ref: 'export-images-public-domain'
        },
        {
          ref: 'export-images',
          icon: 'by-collection'
        },
        {
          ref: 'semantic-enrichments-public-domain'
        },
        {
          ref: 'semantic-enrichments'
        },
        {
          ref: 'export-semantic-enrichments'
        }
      ],
      requirements: ['terms-of-use', 'impresso-account'],
      body: 'The Basic User Plan offers access to the public domain part of the Impresso Corpus, some protected domain data, as well as metadata and semantic enrichments. With this plan, users can create, save, and export personal collections.'
    },
    {
      title: 'Student User',
      icon: 'basic',
      id: 'plan-educational',
      name: 'plan-educational',
      ordering: 3,
      features: [
        {
          ref: 'explore-all-features'
        },
        {
          ref: 'create-store-export-collections'
        },
        {
          ref: 'generate-api-keys'
        },
        {
          ref: 'metadata-public-domain'
        },
        {
          ref: 'metadata'
        },
        {
          ref: 'export-metadata'
        },
        {
          ref: 'facsimiles-public-domain'
        },
        {
          ref: 'facsimiles',
          icon: 'by-collection'
        },
        {
          ref: 'audio-public-domain'
        },
        {
          ref: 'audio',
          icon: 'by-collection'
        },
        {
          ref: 'transcripts-public-domain'
        },
        {
          ref: 'transcripts',
          icon: 'by-collection'
        },
        {
          ref: 'export-transcripts-public-domain'
        },
        {
          ref: 'export-transcripts',
          icon: 'by-collection'
        },
        {
          ref: 'images-public-domain'
        },
        {
          ref: 'images',
          icon: 'by-collection'
        },
        {
          ref: 'export-images-public-domain'
        },
        {
          ref: 'export-images',
          icon: 'by-collection'
        },
        {
          ref: 'semantic-enrichments-public-domain'
        },
        {
          ref: 'semantic-enrichments'
        },
        {
          ref: 'export-semantic-enrichments'
        }
      ],
      requirements: ['terms-of-use', 'impresso-account', 'proof-of-student-enrollment'],
      body: 'The Student User Plan provides students with the same benefits as the Basic Plan, along with access to additional protected domain data.'
    },
    {
      title: 'Academic User',
      icon: 'basic',
      id: 'plan-researcher',
      name: 'plan-researcher',
      ordering: 4,
      features: [
        {
          ref: 'explore-all-features'
        },
        {
          ref: 'create-store-export-collections'
        },
        {
          ref: 'generate-api-keys'
        },
        {
          ref: 'metadata-public-domain'
        },
        {
          ref: 'metadata'
        },
        {
          ref: 'export-metadata'
        },
        {
          ref: 'facsimiles-public-domain'
        },
        {
          ref: 'facsimiles',
          icon: 'by-collection'
        },
        {
          ref: 'audio-public-domain'
        },
        {
          ref: 'audio',
          icon: 'by-collection'
        },
        {
          ref: 'transcripts-public-domain'
        },
        {
          ref: 'transcripts',
          icon: 'by-collection'
        },
        {
          ref: 'export-transcripts-public-domain'
        },
        {
          ref: 'export-transcripts',
          icon: 'by-collection'
        },
        {
          ref: 'images-public-domain'
        },
        {
          ref: 'images',
          icon: 'by-collection'
        },
        {
          ref: 'export-images-public-domain'
        },
        {
          ref: 'export-images',
          icon: 'by-collection'
        },
        {
          ref: 'semantic-enrichments-public-domain'
        },
        {
          ref: 'semantic-enrichments'
        },
        {
          ref: 'export-semantic-enrichments'
        }
      ],
      requirements: ['terms-of-use', 'impresso-account', 'proof-of-academic-affiliation'],
      body: 'The Academic User Plan, available to those with an academic affiliation, includes all benefits of the Basic Plan, with access to an expanded range of protected domain data.'
    },
    {
      title: 'Coming soon: Special Membership',
      icon: 'basic',
      id: 'plan-special-membership',
      name: 'plan-special-membership',
      ordering: 5,
      features: [
        {
          ref: 'explore-all-features'
        },
        {
          ref: 'create-store-export-collections'
        },
        {
          ref: 'generate-api-keys'
        },
        {
          ref: 'metadata-public-domain'
        },
        {
          ref: 'metadata'
        },
        {
          ref: 'export-metadata'
        },
        {
          ref: 'facsimiles-public-domain'
        },
        {
          ref: 'facsimiles',
          icon: 'by-collection'
        },
        {
          ref: 'audio-public-domain'
        },
        {
          ref: 'audio',
          icon: 'by-collection'
        },
        {
          ref: 'transcripts-public-domain'
        },
        {
          ref: 'transcripts',
          icon: 'by-collection'
        },
        {
          ref: 'export-transcripts-public-domain'
        },
        {
          ref: 'export-transcripts',
          icon: 'by-collection'
        },
        {
          ref: 'images-public-domain'
        },
        {
          ref: 'images',
          icon: 'by-collection'
        },
        {
          ref: 'export-images-public-domain'
        },
        {
          ref: 'export-images',
          icon: 'by-collection'
        },
        {
          ref: 'semantic-enrichments-public-domain'
        },
        {
          ref: 'semantic-enrichments'
        },
        {
          ref: 'export-semantic-enrichments'
        }
      ],
      requirements: ['terms-of-use', 'impresso-account', 'data-access-granted'],
      body: 'The Special Membership Plan offers extended access, including collections that require approval from content providers for an Impresso user account.'
    }
  ],
  planContent: {
    title: 'Impresso User Plans',
    modalTitle: 'User Plans Overview',
    excerpt: 'Overview of the different user plans available for the Impresso Project',
    body: 'The Impresso Project is committed to respecting copyright and content provider requirements while maximising research opportunities. Impresso User Plans reflect this goal, providing access to the [Impresso Corpus](/datalab/corpus-overview) and enabling different actions based on user status, data copyright restrictions, and content provider permissions.'
  }
}
