export interface ICollapsibleParagraph {
  id: string
  title: string
  summary: string
  description?: string
  paragraphs: Array<ICollapsibleParagraph>
}

export class CollapsibleParagraph implements ICollapsibleParagraph {
  id: string
  title: string
  summary: string
  description?: string
  paragraphs: Array<ICollapsibleParagraph>

  constructor({ id = '', title = '', summary = '', description = '', paragraphs = [] } = {}) {
    this.id = String(id)
    this.title = String(title)
    this.summary = String(summary)
    this.description = String(description)
    this.paragraphs = paragraphs.map(paragraph => {
      if (paragraph instanceof CollapsibleParagraph) {
        return paragraph
      }
      return new CollapsibleParagraph({ ...paragraph })
    })
  }
}
