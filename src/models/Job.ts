const StatusDone = 'DON'
const StatusRunning = 'RUN'
const TypeExport = 'EXP'
const typeExportCollection = 'EXC'

class JobExtra {
  channel: string
  taskname: string
  taskstate: string
  progress: number
  message: string
  total: number
  collection?: Record<string, any>
  query?: string
  sq?: string

  constructor({
    channel = '',
    taskname = '',
    taskstate = '',
    progress = 0.0,
    message = '',
    total = -1,
    collection = {},
    query = '',
    sq = ''
  } = {}) {
    this.channel = String(channel)
    this.taskname = String(taskname)
    this.taskstate = String(taskstate)
    this.progress = progress
    this.total = total
    this.message = String(message)
    this.query = String(query)
    this.sq = String(sq)
    this.collection = collection
  }
  // }
  // ) {
  //   this.query = String(query)
  //   this.serializedQuery = String(serializedQuery)
  //   this.collection = collection
  //   this.total = parseInt(total, 10)
  //   this.allowed = parseInt(allowed, 10)
  // }
}

export default class Job {
  id: number
  type: string
  status: string
  progress: number
  creationDate: Date
  lastModifiedDate: Date
  description: string
  task: string
  extra: JobExtra

  constructor({
    id = -1,
    type = '',
    status = '',
    progress = 0.0,
    creationDate = new Date(),
    lastModifiedDate = new Date(),
    description = '',
    task = '',
    extra = {}
  } = {}) {
    this.id = id
    this.type = String(type)
    this.status = String(status)
    this.task = String(task)
    this.extra = new JobExtra(extra)

    this.description = String(description)
    this.progress = progress
    if (creationDate instanceof Date) {
      this.creationDate = creationDate
    } else {
      this.creationDate = new Date(creationDate)
    }
    if (lastModifiedDate instanceof Date) {
      this.lastModifiedDate = lastModifiedDate
    } else if (lastModifiedDate) {
      this.lastModifiedDate = new Date(lastModifiedDate)
    } else {
      this.lastModifiedDate = new Date()
    }
  }

  isExportable() {
    return (
      this.status === StatusDone && (this.type === TypeExport || this.type === typeExportCollection)
    )
  }

  isActive() {
    return [StatusDone, StatusRunning].includes(this.status)
  }

  isRunning() {
    return this.status === StatusRunning
  }

  getSearchQueryHash() {
    if (this.extra.sq && this.extra.sq.length > 0) {
      return this.extra.sq
    }
    return this.extra.query
  }

  getProgressAsPercentage() {
    return Math.min(100, Math.round(this.progress * 10000) / 100)
  }
}
