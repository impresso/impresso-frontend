export default class Job {
  constructor({
    id = -1,
    type = '',
    status = '',
    progress = 0.0,
    creationDate,
    task = '',
    extra = {},
  } = {}) {
    this.id = parseInt(id, 10);
    this.type = String(type);
    this.status = String(status);
    this.task = String(task);
    this.extra = extra;
    this.progress = parseFloat(progress);
    if (creationDate instanceof Date) {
      this.creationDate = creationDate;
    } else {
      this.creationDate = new Date(creationDate);
    }
  }
}
