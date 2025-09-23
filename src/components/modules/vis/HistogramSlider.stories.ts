import type { Meta, StoryObj } from '@storybook/vue3-vite'
import HistogramSlider from './HistogramSlider.vue'

const meta = {
  title: 'Visualization/HistogramSlider',
  component: HistogramSlider,
  tags: ['autodocs'],
  argTypes: {
    modelValue: { control: 'object' },
    range: { control: 'object' },
    buckets: { control: 'object' },
    chartHeight: { control: 'number' },
    onlyRangeLabels: { control: 'boolean' },
    scaleType: {
      control: 'select',
      options: ['linear', 'sqrt', 'symlog']
    },
    valueLabel: { control: 'text' },
    'onUpdate:modelValue': { action: 'updated' },
    onChange: { action: 'changed' },
    onMousemove: { action: 'mousemoved' },
    onClick: { action: 'clicked' }
  }
} satisfies Meta<typeof HistogramSlider>

export default meta
type Story = StoryObj<typeof meta>

// Mock data for the stories
const mockBuckets = [
  { val: 1900, count: 150, lower: 1900, upper: 1900 },
  { val: 1901, count: 220, lower: 1901, upper: 1901 },
  { val: 1902, count: 340, lower: 1902, upper: 1902 },
  { val: 1903, count: 280, lower: 1903, upper: 1903 },
  { val: 1904, count: 420, lower: 1904, upper: 1904 },
  { val: 1905, count: 390, lower: 1905, upper: 1905 },
  { val: 1906, count: 280, lower: 1906, upper: 1906 },
  { val: 1907, count: 310, lower: 1907, upper: 1907 },
  { val: 1908, count: 260, lower: 1908, upper: 1908 },
  { val: 1909, count: 290, lower: 1909, upper: 1909 }
]

export const Default: Story = {
  args: {
    modelValue: [1900, 1909],
    buckets: mockBuckets,
    chartHeight: 50,
    onlyRangeLabels: false,
    scaleType: 'linear',
    valueLabel: 'valueLabel',
    showTooltip: false
  }
}

export const WithRange: Story = {
  args: {
    ...Default.args,
    range: [1895, 1915],
    modelValue: [1900, 1909]
  }
}

export const WithSquareRootScale: Story = {
  args: {
    ...Default.args,
    scaleType: 'sqrt'
  }
}

export const WithSymLogScale: Story = {
  args: {
    ...Default.args,
    scaleType: 'symlog'
  }
}

export const OnlyRangeLabels: Story = {
  args: {
    ...Default.args,
    onlyRangeLabels: true
  }
}

export const TallerChart: Story = {
  args: {
    ...Default.args,
    chartHeight: 100
  }
}

export const WithTooltip: Story = {
  args: {
    ...Default.args,
    showTooltip: true
  }
}
