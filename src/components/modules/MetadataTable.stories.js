import MetadataTable from './MetadataTable.vue'

import '../../assets/legacy/bootstrap-impresso-theme.css'

export default {
  title: 'Components/Modules/MetadataTable',
  component: MetadataTable
}

const Template = args => ({
  components: { MetadataTable },
  setup() {
    return { args }
  },
  template: `
    <div style="padding: 20px;">
      <MetadataTable v-bind="args" />
    </div>
  `
})

const sampleProperties = [
  {
    name: 'title',
    label: 'Title',
    value: 'Sample Newspaper',
    isUrl: false
  },
  {
    name: 'institutionNames',
    label: 'Institution Names',
    value: 'Sample Institution',
    isUrl: false
  },
  {
    name: 'institutionLinks',
    label: 'Institution Links',
    value: 'https://example.com',
    isUrl: true
  },
  {
    name: 'noteGenealogy',
    label: 'Note Genealogy',
    value: 'This newspaper was founded in 1850 and merged with another publication in 1920.',
    isUrl: false
  },
  {
    name: 'notePublicationDates',
    label: 'Note Publication Dates',
    value: 'Published daily except Sundays from 1850-1920',
    isUrl: false
  },
  {
    name: 'language',
    label: 'Language',
    value: 'English',
    isUrl: false
  }
]

export const Default = Template.bind({})
Default.args = {
  properties: sampleProperties
}

export const WithUrls = Template.bind({})
WithUrls.args = {
  properties: [
    ...sampleProperties,
    {
      name: 'website',
      label: 'Official Website',
      value: 'https://newspaper-archive.example.com',
      isUrl: true
    },
    {
      name: 'digitization',
      label: 'Digitization Portal',
      value: 'https://digital-archive.example.org/newspapers',
      isUrl: true
    }
  ]
}

export const Empty = Template.bind({})
Empty.args = {
  properties: []
}

export const InitiallyCollapsed = Template.bind({})
InitiallyCollapsed.args = {
  properties: sampleProperties,
  initialCollapsed: true
}