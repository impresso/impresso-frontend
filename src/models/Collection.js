export default function Collection({
  uid = '',
  label = '',
  countArticles = 0,
  countEntities = 0,
} = {}) {
  this.uid = String(uid);
  this.label = String(label);
  this.countArticles = parseInt(countArticles, 10);
  this.countEntities = parseInt(countEntities, 10);
}
