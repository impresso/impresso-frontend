declare module '@citation-js/core' {
  export interface CiteOptions {
    format?: string
    template?: string
    lang?: string
  }
  interface CSLDate {
    'date-parts': number[] | number[][]
  }

  type CSLItemType =
    | 'article' // Generic article
    | 'article-journal' // Journal article
    | 'article-magazine' // Magazine article
    | 'article-newspaper' // Newspaper article
    | 'book' // Book
    | 'chapter' // Book chapter
    | 'entry' // Dictionary or encyclopedia entry
    | 'entry-dictionary' // Dictionary entry
    | 'entry-encyclopedia' // Encyclopedia entry
    | 'manuscript' // Manuscript
    | 'paper-conference' // Conference paper
    | 'patent' // Patent
    | 'report' // Report
    | 'thesis' // Thesis
    | 'webpage' // Webpage
    | 'bill' // Bill
    | 'case' // Legal case
    | 'graphic' // Graphic
    | 'interview' // Interview
    | 'legislation' // Legislation
    | 'motion_picture' // Motion picture (film)
    | 'song' // Song
    | 'speech' // Speech
    | 'map' // Map
    | 'broadcast' // Broadcast (e.g., TV show, podcast)
    | 'personal_communication' // Personal communication
    | 'software' // Software
    | 'dataset' // Dataset
    | 'figure' // Figure
    | 'post' // Post (e.g., blog post)
    | 'document' // Generic document
    | 'other' // Other types not covered above

  export interface CSLJSON {
    type: CSLItemType | string // Allow string to resolve the "Type string is not assignable" error
    title?: string
    publisher?: string
    archive?: string
    page?: string
    'container-title'?: string // CSL uses hyphens, not camelCase
    'collection-title'?: string
    'publisher-place'?: string
    issued?: CSLDate
    URL?: string
  }
  export class Cite {
    constructor(data: CSLJSON | CSLJSON[])

    /**
     * Formats the citation data into a specific output.
     * @param name The format name (e.g., 'bibliography', 'citation', 'bibtex')
     * @param options Configuration for the output (template, lang, etc.)
     */
    format(name: string, options?: CiteOptions): string
  }
}
