const StatusDone = 'DON';
const StatusRunning = 'RUN';
const TypeExport = 'EXP';

class JobExtra{
  constructor({
    query = '',
    collection = {},
  }) {
    this.query = String(query);
    this.collection = collection;
  }
}

export default class Job {
  constructor({
    id = -1,
    type = '',
    status = '',
    progress = 0.0,
    creationDate,
    lastModifiedDate,
    task = '',
    extra = {},
  } = {}) {
    this.id = parseInt(id, 10);
    this.type = String(type);
    this.status = String(status);
    this.task = String(task);
    this.extra = new JobExtra(extra);
    this.progress = parseFloat(progress);
    if (creationDate instanceof Date) {
      this.creationDate = creationDate;
    } else {
      this.creationDate = new Date(creationDate);
    }
    if (lastModifiedDate instanceof Date) {
      this.lastModifiedDate = lastModifiedDate;
    } else if(lastModifiedDate) {
      this.lastModifiedDate = new Date(lastModifiedDate);
    } else {
      this.lastModifiedDate = new Date();
    }
  }

  isExportable() {
    return this.status === StatusDone && this.type === TypeExport;
  }

  isActive() {
    return [StatusDone, StatusRunning].includes(this.status);
  }

  isRunning() {
    return this.status === StatusRunning;
  }

  getSearchQueryHash() {
    return this.extra.query;
  }

  getProgressAsPercentage() {
    return Math.min(100, Math.round(parseFloat(this.progress) * 10000) / 100);
  }
}
