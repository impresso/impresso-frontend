export default class UploadedImage {
  constructor({
    creationDate = null,
    thumbnail = '',
    name = '',
    uid = '',
  } = {}) {
    this.creationDate = new Date(creationDate);
    this.thumbnail = String(thumbnail);
    this.name = String(name);
    this.uid = String(uid);
  }
}
