export interface ITutorialTask {
  id: string
  title: string
  description: string
  status?: string
  coverUrl?: string
  videoUrl?: string
  creationDate?: Date
  completionDate?: Date
  tasks: Array<ITutorialTask>
}

export const StatusCompleted = 'completed'
export const StatusInProgress = 'in-progress'
export const StatusPending = 'pending'

export class TutorialTaskModel implements ITutorialTask {
  id: string
  title: string
  description: string
  status: string
  coverUrl: string
  videoUrl: string
  creationDate: Date
  completionDate: Date
  tasks: Array<ITutorialTask>

  constructor({
    id = '',
    title = '',
    description = '',
    status = StatusInProgress,
    creationDate = new Date(),
    completionDate = null,
    coverUrl = '',
    videoUrl = '',
    tasks = []
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
    this.tasks = tasks.map(task => {
      if (task instanceof TutorialTaskModel) {
        return task
      }
      return new TutorialTaskModel({ ...task })
    })
  }

  getCompletion(): { n: number; total: number; ratio: number; latestCompletionDate: Date | null } {
    const totalTasks = this.tasks.length
    if (totalTasks === 0) {
      return {
        total: 1,
        n: this.status === StatusCompleted ? 1 : 0,
        ratio: this.status === StatusCompleted ? 1 : 0,
        latestCompletionDate: this.completionDate
      }
    }
    const completedTasks = this.tasks.filter(task => task.status === 'completed')
    const latestCompletionDate = completedTasks.reduce(
      (latest, task) => {
        if (!task.completionDate) {
          return latest
        }
        return task.completionDate.getTime() > latest.getTime() ? task.completionDate : latest
      },
      this.completionDate ?? new Date(0)
    )

    return {
      n: completedTasks.length,
      total: totalTasks,
      ratio: completedTasks.length / totalTasks,
      latestCompletionDate: latestCompletionDate
    }
  }
}
