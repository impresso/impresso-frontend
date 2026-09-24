import type { Meta, StoryObj } from '@storybook/vue3-vite'
import MultiLinePlot, { type ItemsSet } from './MultiLinePlot.vue'

const meta: Meta<typeof MultiLinePlot> = {
  title: 'Modules/Vis/MultiLinePlot',
  component: MultiLinePlot,
  tags: ['autodocs'],
  argTypes: {
    height: { control: 'number', description: 'Chart height in pixels' },
    itemsSets: { control: 'object', description: 'Array of line datasets' }
  }
}

export default meta

type Story = StoryObj<typeof MultiLinePlot>

function makeYearlyData(label: string, seed: number, startYear = 1900, endYear = 2000): ItemsSet {
  let v = seed
  const items = []
  for (let year = startYear; year <= endYear; year++) {
    v = Math.max(0, v + (Math.random() - 0.48) * seed * 0.3)
    items.push({ time: new Date(year, 0, 1), value: Math.round(v) })
  }
  return { label, items }
}

const defaultItemsSets: ItemsSet[] = [
  makeYearlyData('Le Temps', 500),
  makeYearlyData('Gazette de Lausanne', 300),
  makeYearlyData('Journal de Genève', 200)
]

export const Default: Story = {
  args: {
    itemsSets: defaultItemsSets,
    height: 300
  }
}

export const SingleLine: Story = {
  args: {
    itemsSets: [makeYearlyData('Le Temps', 400)],
    height: 250
  }
}

export const WithValueFormatter: Story = {
  args: {
    itemsSets: defaultItemsSets,
    height: 300,
    roundValueFn: (v: number) => `${(v / 1000).toFixed(1)}k`
  }
}

export const TallChart: Story = {
  args: {
    itemsSets: defaultItemsSets,
    height: 500
  }
}
