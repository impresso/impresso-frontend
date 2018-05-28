export default function NamedEntityFilter({
  title = '',
  context = 'include',
  uid = '',
  label = '', // e.g. person, location, etc.
} = {}) {
  this.type = 'NamedEntity';
  this.title = title;
  this.context = context;
  this.uid = uid;
  this.label = label;
}
