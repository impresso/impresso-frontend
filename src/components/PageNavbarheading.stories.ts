import type { Meta, StoryObj } from '@storybook/vue3'
import PageNavbarHeading from './PageNavbarHeading.vue'

const meta: Meta<typeof PageNavbarHeading> = {
  title: 'components/PageNavbarHeading',
  component: PageNavbarHeading,
  tags: ['autodocs'],
  argTypes: {},
  args: {},
  render: args => {
    return {
      components: { PageNavbarHeading },
      setup() {
        return { args }
      },
      template: '<PageNavbarHeading />'
    }
  },
  decorators: []
} satisfies Meta<typeof PageNavbarHeading>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {}
}

export const WithActionSlot: Story = {
  args: {
    label: 'Search',
    title: 'Search Text'
  },
  render: args => {
    return {
      components: { PageNavbarHeading },
      setup() {
        return { args }
      },
      template: `
        <PageNavbarHeading v-bind="args">
          <template #actions>
            <button class="btn btn-primary">Action</button>
          </template>
        </PageNavbarHeading>
      `
    }
  }
}

export const withAllSlots: Story = {
  args: {
    label: 'Search',
    title: 'Search Text'
  },
  render: args => {
    return {
      components: { PageNavbarHeading },
      setup() {
        return { args }
      },
      template: `
        <PageNavbarHeading v-bind="args">
          <template #actions>
            <button class="btn btn-primary">Action</button>
          </template>
          <template #summary>
            (summary)
          </template>
          <template #summaryActions>
            <button class="btn btn-secondary">Summary Action</button>
          </template>
        </PageNavbarHeading>
      `
    }
  }
}
