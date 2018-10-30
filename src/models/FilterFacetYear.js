import Bucket from './Bucket';
/**
 * FilterEntity object
 * @param {Object} buckets Array with Bucket objects
 * @param {String} type type of filter, eg, 'newspaper', 'language'...
 * @param {Boolean} touched wether the user has interacted with the filter
 */

export default function FilterFacetYear({
  buckets = {},
  touched = false,
} = {}) {
  this.type = 'year';
  this.context = 'include';
  this.touched = touched;

  this.end = new Date(buckets[0].val);
  this.start = new Date(buckets[buckets.length - 1].val);

  this.buckets = buckets.map((bucket) => {
    if (bucket instanceof Bucket) {
      return bucket;
    }

    return new Bucket(bucket);
  });

  this.getQuery = function () {
    const start = new Date(this.start);
    const end = new Date(this.end);
    const daterange = `${start.toISOString().replace('.000Z', 'Z')} TO ${end.toISOString().replace('.000Z', 'Z')}`;

    return {
      context: this.context,
      type: 'daterange',
      daterange,
    };
  };

  this.touch = function () {
    this.touched = true;
  };
}
