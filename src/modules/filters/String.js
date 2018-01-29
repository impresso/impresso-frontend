export default function StringFilter({
  title = '',
  context = 'include',
  query = '', // the query as a string
} = {}) {
  this.type = 'String';
  this.title = title;
  this.context = context;
  this.query = query;
}
