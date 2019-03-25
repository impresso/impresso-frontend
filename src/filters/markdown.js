import MarkdownIt from 'markdown-it';

const markdownItDecorate = require('markdown-it-decorate');

const md = new MarkdownIt({
  html: true,
});

md.use(markdownItDecorate);

export default function markdown(data) {
  return md.render(data);
}
