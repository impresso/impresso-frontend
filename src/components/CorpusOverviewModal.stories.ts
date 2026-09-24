import type { Meta, StoryObj } from '@storybook/vue3-vite'
import CorpusOverviewModal from '@/components/CorpusOverviewModal.vue'
import type { Dataset } from '@/components/CorpusOverviewModal.vue'
import { AvailablePlans, PlanLabels } from '@/constants'

const meta: Meta<typeof CorpusOverviewModal> = {
  title: 'Components/CorpusOverviewModal',
  component: CorpusOverviewModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  },
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: { CorpusOverviewModal },
      template: '<CorpusOverviewModal v-bind="args"></CorpusOverviewModal>'
    }
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    userPlan: AvailablePlans[0],
    isVisible: true,
    isLoading: false,
    plansLabels: PlanLabels,
    datasets: [
      {
        id: 'SNL-BLB-1845-1847',
        associatedPartner: 'SNL',
        mediaId: 'BLB',
        mediaTitle: 'Bündner Landbote',
        timePeriod: '1845-1847',
        startYear: 1845,
        endYear: 1847,
        media: 'Newspaper',
        medium: 'print',
        copyright: 'Public Domain',
        permittedUse: 'Personal, Research and Educational',
        minimumUserPlanRequiredToExploreInWebapp: 'guest',
        minimumUserPlanRequiredToExportTranscripts: 'plan-basic',
        minimumUserPlanRequiredToExportIllustration: 'plan-basic',
        partnerBitmapIndex: 5
      },
      {
        id: 'SNL-BNN-1885-1892',
        associatedPartner: 'SNL',
        mediaId: 'BNN',
        mediaTitle: 'Bündner Nachrichten',
        timePeriod: '1885-1892',
        startYear: 1885,
        endYear: 1892,
        media: 'Newspaper',
        medium: 'print',
        copyright: 'Public Domain',
        permittedUse: 'Personal, Research and Educational',
        minimumUserPlanRequiredToExploreInWebapp: 'guest',
        minimumUserPlanRequiredToExportTranscripts: 'plan-basic',
        minimumUserPlanRequiredToExportIllustration: 'plan-basic',
        partnerBitmapIndex: 5
      },
      {
        id: 'BL-BRLB-1833-1833',
        associatedPartner: 'BL',
        mediaId: 'BRLB',
        mediaTitle: 'The British Liberator',
        timePeriod: '1833-1833',
        startYear: 1833,
        endYear: 1833,
        media: 'Newspaper',
        medium: 'print',
        copyright: 'Public Domain',
        permittedUse: 'Personal, Research and Educational',
        minimumUserPlanRequiredToExploreInWebapp: 'guest',
        minimumUserPlanRequiredToExportTranscripts: 'plan-basic',
        minimumUserPlanRequiredToExportIllustration: 'plan-basic',
        partnerBitmapIndex: 10
      },
      {
        id: 'BL-BRLU-1818-1823',
        associatedPartner: 'BL',
        mediaId: 'BRLU',
        mediaTitle: 'The British Luminary',
        timePeriod: '1818-1823',
        startYear: 1818,
        endYear: 1823,
        media: 'Newspaper',
        medium: 'print',
        copyright: 'Public Domain',
        permittedUse: 'Personal, Research and Educational',
        minimumUserPlanRequiredToExploreInWebapp: 'guest',
        minimumUserPlanRequiredToExportTranscripts: 'plan-basic',
        minimumUserPlanRequiredToExportIllustration: 'plan-basic',
        partnerBitmapIndex: 10
      }
    ] as Dataset[]
  }
}
