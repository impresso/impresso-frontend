import type { Meta, StoryObj } from '@storybook/vue3-vite'
import DataRundownModal from './DataRundownModal.vue'
import type { DataRundownModalProps } from './DataRundownModal.vue'
import type { DataReleaseExtended } from '@/services/types'
import { http, HttpResponse } from 'msw'

const meta = {
  title: 'DataRundown/DataRundownModal',
  component: DataRundownModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A base modal component that can be used to create various types of modals.'
      }
    }
  },
  tags: ['autodocs'],
  render: args => ({
    components: { DataRundownModal },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 900px; height: 600px; padding: 10px; background-color: #f0f0f0;">
        <DataRundownModal v-bind="args">
        [Content goes here]
        </DataRundownModal>
      </div>
    `
  })
} satisfies Meta<typeof DataRundownModal>

const mockData: DataReleaseExtended[] = [
  {
    id: 'MOCKdata-release-2025-05/corpus_release_card.json',
    releaseName: 'Mock Polar Night',
    releaseVersion: '2025-05',
    impressoCorpusOverview: {
      npsStats: {
        titles: 245,
        issues: 3200,
        pages: 89000,
        contentItems: 51000,
        images: 15400,
        tokens: 2_400_000
      }
    },
    impressoEnrichments: {
      lingproc: {
        models: [
          {
            taskName: 'linguistic processing',
            modelId: 'spacy_v3.6.0-multilingual',
            huggingFaceLink: 'n/a'
          }
        ]
      },
      langident: {
        models: [
          {
            taskName: 'language identification',
            modelId: '??',
            huggingFaceLink: 'https://huggingface.co/impresso-project/language-identifier'
          }
        ]
      },
      textreuse: {
        models: [
          {
            taskName: 'text-reuse detection',
            modelId: 'textreuse_passim-spark-scala_v0.2.0',
            huggingFaceLink: 'N/A'
          }
        ]
      },
      entities: {
        models: [
          {
            taskName: 'named entity recognition (ner)',
            modelId: 'ner_bert-stacked-2-medium-historic-multilingual_v1.0.0',
            huggingFaceLink: 'https://huggingface.co/impresso-project/ner-stacked-bert-multilingual'
          },
          {
            taskName: 'named entity linking (nel)',
            modelId: 'nel_mgenre-multilingual_v1.0.0',
            huggingFaceLink: 'https://huggingface.co/impresso-project/nel-mgenre-multilingual'
          }
        ]
      }
    }
  }
]

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(import.meta.env.VITE_DATA_RELEASE_CARDS_JSON_URL, () => {
          return HttpResponse.json(mockData)
        })
      ]
    }
  },
  args: {
    isVisible: true,
    dialogClass: 'modal-dialog-scrollable modal-lg'
  } as DataRundownModalProps
}
