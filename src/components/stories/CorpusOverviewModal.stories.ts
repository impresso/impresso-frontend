import type { Meta, StoryObj } from '@storybook/vue3'
import CorpusOverviewModal from '@/components/CorpusOverviewModal.vue'
import type { Dataset } from '@/components/CorpusOverviewModal.vue'
import { AvailablePlans, PlanLabels } from '@/constants'
import { UserChangePlanRequest } from '@/services/types'

const meta: Meta<typeof CorpusOverviewModal> = {
  title: 'Components/CorpusOverviewModal',
  component: CorpusOverviewModal,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: { CorpusOverviewModal },
      template:
        '<div style="height: 1000px; width: 100%"><CorpusOverviewModal v-bind="args"></CorpusOverviewModal></div>'
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
        dataPartnerInstitution: 'SNL',
        mediaId: 'BLB',
        mediaTitle: 'Bündner Landbote',
        timePeriod: '1846-1847',
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
        dataPartnerInstitution: 'SNL',
        mediaId: 'BNN',
        mediaTitle: 'Bündner Nachrichten',
        timePeriod: '1885-1892',
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
        dataPartnerInstitution: 'BCUL',
        mediaId: 'ACI',
        mediaTitle: 'Almanach pour le commerce',
        timePeriod: '1832-1832',
        media: 'Newspaper',
        medium: 'print',
        copyright: 'Public Domain',
        permittedUse: 'Personal, Research and Educational',
        minimumUserPlanRequiredToExploreInWebapp: 'guest',
        minimumUserPlanRequiredToExportTranscripts: 'plan-basic',
        minimumUserPlanRequiredToExportIllustration: 'plan-basic',
        partnerBitmapIndex: 22
      },
      {
        dataPartnerInstitution: 'BCUL',
        mediaId: 'RN',
        mediaTitle: 'Bulletins du Grand Conseil',
        timePeriod: '1829-2020',
        media: 'Newspaper',
        medium: 'print',
        copyright: 'Protected Domain: In copyright',
        permittedUse: 'Research',
        minimumUserPlanRequiredToExploreInWebapp: 'plan-researcher',
        minimumUserPlanRequiredToExportTranscripts: 'plan-researcher',
        minimumUserPlanRequiredToExportIllustration: 'plan-researcher',
        partnerBitmapIndex: 22
      },
      {
        dataPartnerInstitution: 'BNL',
        mediaId: 'waeschfra',
        mediaTitle: "D'Wäschfra",
        timePeriod: '1882-1884',
        media: 'Newspaper',
        medium: 'print',
        copyright: 'Protected Domain: In copyright',
        permittedUse: 'Academic users at least OR Archive members',
        minimumUserPlanRequiredToExploreInWebapp: 'plan-basic',
        minimumUserPlanRequiredToExportTranscripts: 'plan-researcher',
        minimumUserPlanRequiredToExportIllustration: 'plan-researcher',
        partnerBitmapIndex: 6
      },
      {
        dataPartnerInstitution: 'BNL',
        mediaId: 'waechtersauer',
        mediaTitle: 'Der Wächter an der Sauer',
        timePeriod: '1849-1869',
        media: 'Newspaper',
        medium: 'print',
        copyright: 'Public Domain',
        permittedUse: 'Personal, Research and Educational',
        minimumUserPlanRequiredToExploreInWebapp: 'guest',
        minimumUserPlanRequiredToExportTranscripts: 'plan-basic',
        minimumUserPlanRequiredToExportIllustration: 'plan-basic',
        partnerBitmapIndex: 6
      }
    ] as Dataset[]
  }
}
