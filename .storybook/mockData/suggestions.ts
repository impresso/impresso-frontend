export interface MockAutocompleteSuggestion {
  type: 'newspaper' | 'topic' | 'location' | 'person' | 'mention'
  h: string
  item: {
    id: string
    name?: string
    label?: string
    type?: string
    frequence?: string
  }
  q?: string
  precision?: string
}

export const MockAutocompleteSuggestions: MockAutocompleteSuggestion[] = [
  {
    type: 'newspaper',
    h: 'Gazette de <b>Lausanne</b>',
    item: {
      id: 'GDL',
      name: 'Gazette de Lausanne'
    }
  },
  {
    type: 'topic',
    h: '<b>Railway</b> development in Switzerland',
    item: {
      id: 'tm-fr-all-v2.0_tp45_fr',
      label: 'railway · train · station · tunnel · line'
    },
    q: 'railway',
    precision: 'exact'
  },
  {
    type: 'location',
    h: '<b>Geneva</b> canton',
    item: {
      id: 'Q71',
      name: 'Geneva'
    }
  },
  {
    type: 'person',
    h: 'Albert <b>Einstein</b>',
    item: {
      id: 'Q937',
      name: 'Albert Einstein'
    }
  },
  {
    type: 'mention',
    h: '... industrial <b>strike</b> ...',
    item: {
      id: 'mention-1',
      name: 'industrial strike',
      type: 'mention',
      frequence: '24'
    }
  }
]
