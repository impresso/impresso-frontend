import { protobuf } from 'impresso-jscommons';

export function toCanonicalFilter(filter) {
  const {
    context,
    op,
    type,
    precision,
    q,
    daterange,
    uids
  } = filter || {}
  return { context, op, type, precision, q, daterange, uids }
}

export function toSerializedFilter(filter) {
  return protobuf.filter.serialize(toCanonicalFilter(filter))
}
