import type { Meta, StoryObj } from '@storybook/vue3'
import ContentItemAccess from '@/components/ContentItemAccess.vue'
import type { ContentItemAccessProps } from '@/components/ContentItemAccess.vue'
import { useUserStore } from '@/stores/user'
import { bigIntToBase64 } from '@/util/bitmask'

const meta: Meta<typeof ContentItemAccess> = {
  title: 'Components/ContentItemAccess',
  component: ContentItemAccess,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        const userStore = useUserStore()
        userStore
          .refreshUser()
          .catch(() => {})
          .finally(() => {
            userStore.setAcceptTermsDate(new Date().toISOString())
          })

        return { args }
      },
      components: { ContentItemAccess },
      template: `
        <div class="bg-light d-flex align-items-center p-4" style="height: 400px;width: 100%;">
          <ContentItemAccess v-bind="args">
          </ContentItemAccess>
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
        explore: bigIntToBase64(2n),
        transcript: bigIntToBase64(16384n)
      }
    }
  } as ContentItemAccessProps
}

export const fullAccess: Story = {
  args: {
    item: {
      id: 'open-article',
      type: 'ar',
      dataProvider: 'Impresso',
      publicationDate: '2024-01-01',
      title: 'Open Access Article',
      nbPages: 10,
      pages: [],
      transcriptLength: 0,
      access: {
        dataDomain: 'prt',
        copyright: 'in_cpy',
        explore: 'AAE=', // Different bitmap for testing full access
        transcript: 'AAE='
      }
    }
  } as ContentItemAccessProps
}

export const noAccess: Story = {
  args: {
    item: {
      id: 'very-closed-article',
      type: 'ar',
      dataProvider: 'Impresso',
      publicationDate: '2024-01-01',
      title: 'Very Closed Article',
      nbPages: 10,
      pages: [],
      transcriptLength: 0,
      access: {
        dataDomain: 'prt',
        copyright: 'in_cpy',
        explore: 'AAAAAAAAAAAAAAAA=', // Different bitmap for testing no access
        transcript: 'AAAAAAAAAAAAAAAA='
      }
    }
  } as ContentItemAccessProps
}

// export const NoAccess: Story = {
//   args: {
//     item: {
//       id: 'restricted-article',
//       type: 'ar',
//       dataProvider: 'Impresso',
//       publicationDate: '2024-01-01',
//       title: 'Restricted Article',
//       nbPages: 10,
//       pages: [],
//       transcriptLength: 0,
//       access: {
//         dataDomain: 'prt',
//         copyright: 'in_cpy',
//         explore: 'ZmZm' // Different bitmap for testing no access
//       }
//     }
//   } as ContentItemAccessProps
// }

// export const NoAccessProperty: Story = {
//   args: {
//     item: {
//       id: 'open-article',
//       type: 'ar',
//       dataProvider: 'Impresso',
//       publicationDate: '2024-01-01',
//       title: 'Open Access Article',
//       nbPages: 10,
//       pages: [],
//       transcriptLength: 0
//       // No access property - prevent access
//     }
//   } as ContentItemAccessProps
// }

// export const WithCustomSlots: Story = {
//   args: {
//     item: {
//       id: 'article-with-slots',
//       type: 'ar',
//       dataProvider: 'Impresso',
//       publicationDate: '2024-01-01',
//       title: 'Article with Custom Slots',
//       nbPages: 10,
//       pages: [],
//       transcriptLength: 0,
//       access: {
//         dataDomain: 'prt',
//         copyright: 'in_cpy',
//         explore: 'AAA='
//       }
//     }
//   } as ContentItemAccessProps,
//   render: args => ({
//     setup() {
//       const userStore = useUserStore()
//       userStore.refreshUser().catch(() => {})
//       return { args }
//     },
//     components: { ContentItemAccess },
//     template: `
//       <div style="height: 400px; background:grey; width: 100%; text-align:end">
//         <ContentItemAccess v-bind="args">
//           <template #access-granted>
//             <div style="background: green; color: white; padding: 10px; border-radius: 4px;">
//               🎉 Welcome! You have full access to this premium content.
//             </div>
//           </template>
//           <template #access-denied>
//             <div style="background: red; color: white; padding: 10px; border-radius: 4px;">
//               🔒 Upgrade your plan to access this exclusive content.
//             </div>
//           </template>
//         </ContentItemAccess>
//       </div>
//     `
//   })
// }
