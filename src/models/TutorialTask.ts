export interface ITutorialTask {
  id: string
  title: string
  description: string
  status: string
  coverUrl: string
  videoUrl: string
  creationDate: Date
  completionDate: Date
}

export class TutorialTaskModel implements ITutorialTask {
  id: string
  title: string
  description: string
  status: string
  coverUrl: string
  videoUrl: string
  creationDate: Date
  completionDate: Date

  constructor({
    id = '',
    title = '',
    description = '',
    status = '',
    creationDate = null,
    completionDate = null,
    coverUrl = '',
    videoUrl = ''
  } = {}) {
    this.id = String(id)
    this.title = String(title)
    this.description = String(description)
    this.status = String(status)
    this.coverUrl = String(coverUrl)
    this.videoUrl = String(videoUrl)

    if (creationDate instanceof Date) {
      this.creationDate = creationDate
    } else if (creationDate) {
      this.creationDate = new Date(creationDate)
    }

    if (completionDate instanceof Date) {
      this.completionDate = completionDate
    } else if (completionDate) {
      this.completionDate = new Date(completionDate)
    }
  }
}
