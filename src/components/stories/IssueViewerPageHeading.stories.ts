import type { Meta, StoryObj } from '@storybook/vue3'
import IssueViewerPageHeading, {
  IssueViewerPageHeadingProps
} from '@/components/IssueViewerPageHeading.vue'
import { ref } from 'vue'
import { AvailablePlans, PlanLabels } from '@/constants'
import { UserChangePlanRequest } from '@/services/types'

const meta: Meta<typeof IssueViewerPageHeading> = {
  title: 'Components/IssueViewerPageHeading',
  component: IssueViewerPageHeading,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: { IssueViewerPageHeading },
      template:
        '<div style="height: 400px; width: 100%"><IssueViewerPageHeading v-bind="args"></IssueViewerPageHeading></div>'
    }
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'issue',
    page: {
      num: 6,
      uid: 'luxembourg1937-6'
    },
    issue: {
      uid: 'luxembourg1937',
      countArticles: 90,
      countPages: 6,
      date: new Date()
    },
    mediaSource: {
      name: 'Luxembourg (1935)',
      id: 'luxembourg1937',
      type: 'newspaper'
    },
    dataProvider: {
      id: 'impresso',
      name: 'impresso'
    }
  } as IssueViewerPageHeadingProps
}

export const WithArticle: Story = {
  args: {
    label: 'article',
    page: {
      num: 6,
      uid: 'luxembourg1937-6'
    },
    article: {
      title: 'Zaldoteatonn'
    },
    mediaSource: {
      name: 'Luxembourg (1935)',
      id: 'luxembourg1937',
      type: 'newspaper'
    },
    dataProvider: {
      id: 'impresso',
      name: 'impresso'
    },
    issue: {
      uid: 'luxembourg1937',
      countArticles: 90,
      countPages: 6,
      date: new Date()
    }
  }
}
