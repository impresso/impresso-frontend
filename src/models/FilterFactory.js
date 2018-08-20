import FilterEntity from '@/models/FilterEntity';
import FilterString from '@/models/FilterString';

export default {
  create: (filter) => {
    if (filter.type === 'string') {
      return new FilterString(filter);
    }

    if (filter.type === 'entity') {
      return new FilterEntity(filter);
    }

    return null;
  },
};
