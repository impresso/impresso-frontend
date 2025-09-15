import type { Meta, StoryObj } from '@storybook/vue3'
import ContentItemRedactor, { ContentItemRedactorProps } from '@/components/ContentItemRedactor.vue'
import {
  PlanGuestAsBigInt,
  PlanEducationalAsBigInt,
  PlanImpressoUserAsBigInt,
  PlanResearcherAsBigInt
} from '@/constants'
import { bigIntToBase64Bytes } from '@/util/bigint'

const ThisRequiresStudentPlan = bigIntToBase64Bytes(BigInt('0b100')) // educational
const ThisIsForEveryone = bigIntToBase64Bytes(BigInt('0b1'))
const ThisRequiresBasicUserPlan = bigIntToBase64Bytes(BigInt('0b10')) // basic user
const ThisRequiresAcademicUserPlan = bigIntToBase64Bytes(BigInt('0b1000')) // researcher
const ThisRequiresSpecialMembership = bigIntToBase64Bytes(BigInt('0b1000000000000')) // all bits on

const mockContentItem = {
  id: 'article',
  type: 'ar',
  dataProvider: 'Impresso',
  publicationDate: '2024-01-01',
  title: 'Sample Article',
  nbPages: 10,
  pages: [],
  transcriptLength: 0,
  access: {
    dataDomain: 'prt',
    copyright: 'in_cpy',
    accessBitmaps: {
      explore: ThisRequiresBasicUserPlan,
      getTranscript: ThisRequiresStudentPlan,
      getImages: ThisRequiresAcademicUserPlan
    }
  }
}

const meta: Meta<typeof ContentItemRedactor> = {
  title: 'Components/ContentItemRedactor',
  component: ContentItemRedactor,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: { ContentItemRedactor },
      template: `
        <div class="bg-light p-4" >
          <ContentItemRedactor v-bind="args">
          </ContentItemRedactor>
        </div>
      `
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    item: {
      ...mockContentItem
    },
    userBitmap: bigIntToBase64Bytes(PlanGuestAsBigInt), // guest
    context: 'explore'
  } as ContentItemRedactorProps
}

export const WithDebugInfo: Story = {
  args: {
    item: {
      ...mockContentItem
    },
    userBitmap: bigIntToBase64Bytes(PlanGuestAsBigInt), // guest
    context: 'explore',
    debug: true
  } as ContentItemRedactorProps
}

export const StudentUserAgainstAcademicPlanPublicApiWithDebugInfo: Story = {
  args: {
    item: {
      ...mockContentItem,
      access: {
        ...mockContentItem.access,
        accessBitmaps: {
          ...mockContentItem.access.accessBitmaps,
          transcript: ThisRequiresAcademicUserPlan
        }
      }
    },
    userBitmap: bigIntToBase64Bytes(PlanEducationalAsBigInt), // student
    context: 'publicApi',
    debug: true
  } as ContentItemRedactorProps
}

export const StudentUserAgainstSpecialMembershipPublicApiWithDebugInfo: Story = {
  args: {
    item: {
      ...mockContentItem,
      access: {
        ...mockContentItem.access,
        accessBitmaps: {
          ...mockContentItem.access.accessBitmaps,
          transcript: ThisRequiresSpecialMembership
        }
      }
    },
    userBitmap: bigIntToBase64Bytes(PlanEducationalAsBigInt), // student
    context: 'publicApi',
    debug: true
  } as ContentItemRedactorProps
}

export const NoRedactionNeeded: Story = {
  args: {
    item: {
      ...mockContentItem
    },
    userBitmap: bigIntToBase64Bytes(PlanImpressoUserAsBigInt), // full access
    context: 'explore'
  } as ContentItemRedactorProps
}

export const NoRedactionWithStudentPlanNeeded: Story = {
  args: {
    item: {
      ...mockContentItem,
      access: {
        ...mockContentItem.access,
        accessBitmaps: {
          ...mockContentItem.access.accessBitmaps,
          explore: ThisRequiresStudentPlan
        }
      } // requires educational plan
    },
    userBitmap: bigIntToBase64Bytes(PlanEducationalAsBigInt), // student
    context: 'explore'
  } as ContentItemRedactorProps
}
