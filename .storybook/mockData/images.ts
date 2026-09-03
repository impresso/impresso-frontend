import type { IImage, MediaSource } from '@/models'

const MockMediaSource: MediaSource = {
  id: 'waeschfra',
  type: 'newspaper',
  name: "D'Wäschfra"
}

const MockMediaSourceGDL: MediaSource = {
  id: 'GDL',
  type: 'newspaper',
  name: 'La Gazette de Lausanne'
}

const iiifPreviewUrls = [
  'https://impresso-project.ch/img/impresso-preview-1.jpg',
  'https://impresso-project.ch/img/impresso-preview-2.jpg',
  'https://impresso-project.ch/img/impresso-preview-3.jpg',
  'https://impresso-project.ch/img/impresso-preview-4.jpg'
]

function buildImage(index: number): IImage {
  const isEven = index % 2 === 0
  const year = 1900 + (index % 40)
  return {
    id: `img-${String(index).padStart(4, '0')}`,
    caption: `Sample caption for image #${index}`,
    issueId: `issue-${year}-${index}`,
    contentItemId: `ci-${index}`,
    previewUrl: iiifPreviewUrls[index % iiifPreviewUrls.length],
    pageNumbers: [1 + (index % 8)],
    mediaSourceRef: isEven ? MockMediaSource : MockMediaSourceGDL,
    date: new Date(`${year}-06-${String(1 + (index % 28)).padStart(2, '0')}T00:00:00.000Z`)
  }
}

export const MockImages: IImage[] = Array.from({ length: 48 }, (_, i) => buildImage(i))

export const MockImagePublic: IImage = MockImages[0]
