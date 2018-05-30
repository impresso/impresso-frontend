/**
 * @class Article is an object representing a newspaper article
 * @param {String} articleUid Unique identifier for the article
 * @param {Array} regions Array of region objects
 */

function chunk(arr, len = 4) {
  const chunks = [];
  let i = 0;
  const n = arr.length;

  while (i < n) {
    chunks.push();

    const region = arr.slice(i, i += len);

    chunks.push({
      left: parseInt(region[0], 10),
      top: parseInt(region[1], 10),
      width: parseInt(region[2], 10),
      height: parseInt(region[3], 10),
    });
  }

  return chunks;
}

export default function Region({
  articleUid = '',
  regions = [],
} = {}) {
  this.articleUid = String(articleUid);

  if (Array.isArray(regions) && regions.length > 0) {
    this.regions = chunk(regions);
  }
}
