import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

export default function markdown(data) {
  return md.render(data);
}
