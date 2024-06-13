const OG_PROPERTIES = [
  'og:title',
  'og:site_name',
  'og:type',
  'og:description',
  'og:article:published_time',
]

const DC_PROPERTIES = [
  'DC.title',
  'DC.creator',
  'DC.type',
  'DC.identifier',
  'DC.rights',
  'DC.language',
  'DC.publisher',
  'DC.isPartOf',
  'DCTERMS.issued',
  'DCTERMS.publisher',
]

const META_PROPERTY = ['citation_newspaper_title', 'description']

const getOrCreate = (selector = 'meta[name=description]') => {
  const tag = document.querySelector(selector)
  if (tag) {
    return tag
  }
  const el = document.createElement('meta')
  document.getElementsByTagName('head')[0].appendChild(el)
  return el
}

const suffix = 'impresso'

export const renderMetaTags = ({
  title = 'title',
  // objects { property: content }
  og = {},
  // objects { name: content }
  dc = {},
  // objects { name: content }
  meta = {},
  updateZotero = false,
} = {}) => {
  console.info('$metaTags setting title:', title, updateZotero)
  document.title = suffix ? [suffix, title].join(' - ') : title
  // console.info('Vue.prototype.$renderMetaTag', title);
  META_PROPERTY.forEach(name => {
    // console.info('Vue.prototype.$renderMetaTag META_PROPERTY', `meta[name=${name}]`, meta[name]);
    const el = getOrCreate(`meta[name=${name}]`)
    el.setAttribute('content', meta[name] || 'ciu')
  })
  DC_PROPERTIES.forEach(name => {
    // console.info('Vue.prototype.$renderMetaTag DC_PROPERTIES', `meta[name=${name}]`, dc[name]);
    const el = getOrCreate(`meta[name="${name}"]`)
    el.setAttribute('content', dc[name] || '')
    el.setAttribute('name', name)
  })
  OG_PROPERTIES.forEach(prop => {
    // console.info('Vue.prototype.$renderMetaTag OG_PROPERTIES', `meta[property=${prop}]`,  og[prop]);
    // <meta property="og:title" content="The Rock" />
    const el = getOrCreate(`meta[property="${prop}"]`)
    el.setAttribute('content', og[prop] || '')
    el.setAttribute('property', prop)
  })

  if (updateZotero) {
    document.dispatchEvent(
      new Event('ZoteroItemUpdated', {
        bubbles: true,
        cancelable: true,
      }),
    )
  }
}
