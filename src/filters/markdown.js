import MarkdownIt from 'markdown-it'

import markdownItDecorate from 'markdown-it-decorate'

const md = new MarkdownIt({
  html: true
})

md.use(markdownItDecorate)

export default function markdown(data) {
  return md.render(data)
}
