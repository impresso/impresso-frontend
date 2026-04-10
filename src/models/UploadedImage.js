export default class UploadedImage {
  constructor({
    creationDate = null,
    thumbnail = '',
    name = '',
    id = '',
  } = {}) {
    this.creationDate = new Date(creationDate);
    this.thumbnail = String(thumbnail);
    this.name = String(name);
    this.id = String(id);
  }
}
