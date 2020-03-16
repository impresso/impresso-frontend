export const DefaultCoords = '0,0,200,200';

export const options = {
  backgroundColor: {
    default: 'transparent',
    validate: (d) => /^[a-f\d]{2,6}$/.test(d),
    transform: (d) => `#${d}`,
  },
  backgroundSize: {
    default: 'normal',
    validate: (d) => ['contain', 'normal', 'cover'].includes(d),
  },
  overlayBackgroundColor: {
    default: '#56ccf294',
    validate: (d) => /^[a-f\d]{2,8}$/.test(d),
    transform: (d) => `#${d}`,
  },
  coords: {
    default: DefaultCoords,
    validate: (d) => /^\d{1,5},\d{1,5},\d{1,4},\d{1,4}$/.test(d),
  },
  coordsMargin: {
    default: '50',
    validate: (d) => !isNaN(d),
  },
  cssFilter: {
    default: [],
    validate: (d) => [
      'contrast-0.5',
      'contrast-0.75',
      'contrast-1.5',
      'contrast-1.75',
      'brightness-0.5',
      'brightness-0.75',
      'brightness-1.5',
      'brightness-1.75',
      'brightness-2',
    ].includes(d),
    transform: (d) => d.split('-'),
  },
};


export function validateOrIgnore (prop, value, defaultValue) {
  console.info('validateOrIgnore', prop, value);
  if (options[prop].validate(value)) {
    if (typeof options[prop].transform === 'function') {
      return options[prop].transform(value);
    }
    return value;
  }
  console.warn('validateOrIgnore() value for:', prop, 'is not valid:', value);
  if (typeof defaultValue !== 'undefined') {
    return defaultValue;
  }
  return options[prop].default;
}
