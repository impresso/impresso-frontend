import faqContent from '@/assets/faqpage.json'
// flatten down the faqContent object to get a dict like {language : { id : <item> } }
export const FaqContentsMap = Object.entries(faqContent).reduce((acc, [language, item]) => {
  acc[language] = item.groups.reduce((acc, group) => {
    group.faq.forEach(faq => {
      acc[faq.id] = faq
    })
    return acc
  }, {})
  return acc
}, {})
console.debug('[data/faq]', FaqContentsMap)
