import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ModalDraggable from '@/components/ModalDraggable.vue'
import type { ModalDraggableProps } from '@/components/ModalDraggable.vue'

const meta: Meta<typeof ModalDraggable> = {
  title: 'modals/ModalDraggable',
  component: ModalDraggable,
  tags: ['autodocs'],
  render: args => {
    return {
      components: {
        ModalDraggable
      },
      setup() {
        return { args }
      },
      template: `
        <div style="position: relative; width: 500px; height: 400px; border: 1px dashed #ced4da; overflow: hidden;">
          <ModalDraggable
            v-bind="args"
            class="bg-light border border-dark rounded shadow"
          >
            <template #header="{ isReduced, toggleReduced }">
              <div class="p-2 d-flex justify-content-between align-items-center bg-dark text-white border-bottom border-dark rounded-top gap-2">
                <span class="very-small-caps-bold">Draggable modal</span>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-light"
                  @click.stop="toggleReduced()"
                >
                  {{ isReduced ? '+' : '-' }}
                </button>
              </div>
            </template>

            <div style="padding: 12px; font-size: 12px; color: #495057; min-width: 240px;">
              Drag this box and use the button to reduce it to the bottom-right corner.
            </div>
          </ModalDraggable>
        </div>
      `
    }
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    zIndex: 2,
    respectBoundaries: true,
    centerOnMount: true
  } as ModalDraggableProps
}
