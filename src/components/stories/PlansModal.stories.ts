import type { Meta, StoryObj } from '@storybook/vue3'
import PlansModal from '@/components/PlansModal.vue'

const meta: Meta<typeof PlansModal> = {
  title: 'Components/PlansModal',
  component: PlansModal,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: { PlansModal },
      template:
        '<div style="height: 800px; width: 100%"><PlansModal v-bind="args"></PlansModal></div>'
    }
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    isVisible: true,
    modalTitle: 'User plans overview',
    title: 'Impresso User Plans',
    userPlan: 'plan-basic',
    isLoading: false,
    acceptedTermsDate: '2021-09-01T00:00:00.000Z',
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
      PlanIconRestrictedAccessNoDownload: 'restricted-only-access-no-download',
      PlanIconRestrictedAccessDownload: 'restricted-only-access-download',
      PlanIconPublicDomainAccessNoDownload: 'public-domain-only-access-no-download',
      PlanGuest: 'guest',
      PlanImpressoUser: 'plan-basic',
      PlanEducational: 'plan-educational',
      PlanResearcher: 'plan-researcher',
      PlanResearcherPlus: 'academic-user-plus',
      PlanNone: 'no-plan',
      PlanSpecialMembership: 'plan-special-membership'
    },

    dataFeatureLabels: {
      metadata: 'Metadata (bibliographic, descriptive, technical - public and protected domain)',
      facsimiles: 'Facsimiles',
      'facsimiles-public-domain': 'Facsimiles',
      audio: 'Audio records',
      'audio-public-domain': 'Audio records',
      transcripts: 'Transcripts',
      'transcripts-public-domain': 'Transcripts',
      images: 'Images (illustrations, photographs, etc.)',
      'images-public-domain': 'Images (illustrations, photographs, etc.)',
      'semantic-enrichments':
        'Named entities, text reuse clusters, topics, image classification etc.',
      'semantic-enrichments-public-domain':
        'Named entities, text reuse clusters, topics, image classification etc. '
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
      'restricted-only-access-no-download':
        'Access to protected data determined only by Impresso partners. <b>No download possible<b>',
      'restricted-only-access-download':
        'Access and download to protected data determined only by Impresso partners.',
      'public-domain-only-access-no-download': 'Access Granted, <b>Download Not Available<b>'
    },
    GenericFeatureLabels: {
      'explore-all-features': 'Explore all features of the Impresso Web App and Datalab.',
      'create-store-export-collections': 'Create, store and export personal collections.',
      'generate-api-keys':
        'Generate API keys to access parts of our corpus via the Impresso Datalab.'
    },
    requirementsLabels: {
      'terms-of-use': 'Agreement to Terms of Use',
      'impresso-account': 'Impresso Account creation',
      'proof-of-student-enrollment': 'Proof of enrollement in higher education (for students)',
      'proof-of-academic-affiliation': 'Proof of academic affiliation',
      'data-access-granted': 'Account creation request must receive approval from content provider'
    },
    ExportFeatureLabels: {
      'export-metadata': 'Export Metadata',
      'export-metadata-public-domain': 'Export Metadata',
      'export-facsimiles': 'Export Facsimiles',
      'export-facsimiles-public-domain': 'Export Facsimiles',
      'export-audio': 'Export Audio',
      'export-audio-public-domain': 'Export Audio',
      'export-transcripts': 'Export Transcripts',
      'export-transcripts-public-domain': 'Export Transcripts',
      'export-images': 'Export Images',
      'export-images-public-domain': 'Export Images',
      'export-semantic-enrichments': 'Export Semantic Enrichments',
      'semantic-enrichments-public-domain': 'Export Semantic Enrichments'
    },
    plans: [
      {
        title: 'Guest User',
        icon: 'basic',
        id: 'guest',
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
            ref: 'facsimiles-public-domain',
            icon: 'public-domain-only-access-no-download'
          },
          {
            ref: 'facsimiles',
            icon: 'restricted-only-access-no-download'
          },
          {
            ref: 'audio-public-domain',
            icon: 'public-domain-only-access-no-download'
          },
          {
            ref: 'audio',
            icon: 'restricted-only-access-no-download'
          },
          {
            ref: 'transcripts-public-domain'
          },
          {
            ref: 'transcripts',
            icon: 'restricted-only-access-download'
          },
          {
            ref: 'images-public-domain'
          },
          {
            ref: 'images',
            icon: 'restricted-only-access-download'
          },
          {
            ref: 'semantic-enrichments-public-domain'
          },
          {
            ref: 'semantic-enrichments'
          }
        ],
        requirements: ['terms-of-use', 'impresso-account'],
        body: 'The Basic User Plan offers access to the public domain part of the Impresso Corpus, some protected domain data, as well as metadata and semantic enrichments. With this plan, users can create, save, and export personal collections.'
      },
      {
        title: 'Student User',
        icon: 'basic',
        id: 'plan-educational',
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
            ref: 'facsimiles-public-domain',
            icon: 'public-domain-only-access-no-download'
          },
          {
            ref: 'facsimiles',
            icon: 'restricted-only-access-no-download'
          },
          {
            ref: 'audio-public-domain',
            icon: 'public-domain-only-access-no-download'
          },
          {
            ref: 'audio',
            icon: 'restricted-only-access-no-download'
          },
          {
            ref: 'transcripts-public-domain'
          },
          {
            ref: 'transcripts',
            icon: 'restricted-only-access-download'
          },
          {
            ref: 'images-public-domain'
          },
          {
            ref: 'images',
            icon: 'restricted-only-access-download'
          },
          {
            ref: 'semantic-enrichments-public-domain'
          },
          {
            ref: 'semantic-enrichments'
          }
        ],
        requirements: ['terms-of-use', 'impresso-account', 'proof-of-student-enrollment'],
        body: 'The Student User Plan provides students with the same benefits as the Basic Plan, along with access to additional protected domain data.'
      },
      {
        title: 'Academic User',
        icon: 'basic',
        id: 'plan-researcher',
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
            ref: 'facsimiles-public-domain',
            icon: 'public-domain-only-access-no-download'
          },
          {
            ref: 'facsimiles',
            icon: 'restricted-only-access-no-download'
          },
          {
            ref: 'audio-public-domain',
            icon: 'public-domain-only-access-no-download'
          },
          {
            ref: 'audio',
            icon: 'restricted-only-access-no-download'
          },
          {
            ref: 'transcripts-public-domain'
          },
          {
            ref: 'transcripts',
            icon: 'restricted-only-access-download'
          },
          {
            ref: 'images-public-domain'
          },
          {
            ref: 'images',
            icon: 'restricted-only-access-download'
          },
          {
            ref: 'semantic-enrichments-public-domain'
          },
          {
            ref: 'semantic-enrichments'
          }
        ],
        requirements: ['terms-of-use', 'impresso-account', 'proof-of-academic-affiliation'],
        body: 'The Academic User Plan, available to those with an academic affiliation, includes all benefits of the Basic Plan, with access to an expanded range of protected domain data.'
      },
      {
        title: 'Coming soon: Special Membership',
        icon: 'basic',
        id: 'plan-special-membership',
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
            ref: 'facsimiles-public-domain',
            icon: 'public-domain-only-access-no-download'
          },
          {
            ref: 'facsimiles',
            icon: 'restricted-only-access-no-download'
          },
          {
            ref: 'audio-public-domain',
            icon: 'public-domain-only-access-no-download'
          },
          {
            ref: 'audio',
            icon: 'restricted-only-access-no-download'
          },
          {
            ref: 'transcripts-public-domain'
          },
          {
            ref: 'transcripts',
            icon: 'restricted-only-access-download'
          },
          {
            ref: 'images-public-domain'
          },
          {
            ref: 'images',
            icon: 'restricted-only-access-download'
          },
          {
            ref: 'semantic-enrichments-public-domain'
          },
          {
            ref: 'semantic-enrichments'
          }
        ],
        requirements: ['terms-of-use', 'impresso-account', 'data-access-granted'],
        body: 'The Academic User+ Plan offers extended access, including collections that require approval from content providers for an Impresso user account.'
      }
    ],
    content:
      'The Impresso Project is committed to respecting copyright and content provider requirements while maximizing research opportunities. Impresso User Plans reflect this goal, providing access to the Impresso Corpus and enabling different actions based on user status, data copyright restrictions, and content provider permissions.'
  }
}
