import type { Core } from '@strapi/strapi';
import { PLUGIN_ID, FIELD_ID } from './pluginId';

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.customFields.register({
    name: FIELD_ID,
    plugin: PLUGIN_ID,
    type: 'json',
    inputSize: {
      default: 12,
      isResizable: true,
    }
  });
};

export default register;
