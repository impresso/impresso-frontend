import Bucket from './Bucket';
/**
 * FilterEntity object
 * @param {Object} buckets Array with Bucket objects
 * e.g.: { "language": [ "dutch", "french", "english" ] }
 */

export default function FilterYear({
  buckets = {},
  type = '',
} = {}) {
  this.type = type;
  this.context = 'include';

  this.buckets = buckets.map((bucket) => {
    if (bucket instanceof Bucket) {
      return bucket;
    }

    return new Bucket(bucket);
  });

  this.getQuery = () => ({
    context: this.context,
    type: this.type,
    q: this.buckets.map(bucket => bucket.val),
  });
}
