export default {
  default: {
    cartoApiKey: '',
  },
  validator(config: { cartoApiKey?: string }) {
    if (config.cartoApiKey !== undefined && typeof config.cartoApiKey !== 'string') {
      throw new Error('cartoApiKey must be a string');
    }
  },
};
