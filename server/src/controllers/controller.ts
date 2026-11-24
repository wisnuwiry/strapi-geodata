import type { Core } from '@strapi/strapi';
import { PLUGIN_ID } from '../pluginId';

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  config(ctx) {
    ctx.set('Cache-Control', 'no-store');
    ctx.body = {
      cartoApiKey: strapi.plugin(PLUGIN_ID).config<string>('cartoApiKey', '').trim(),
    };
  },
  index(ctx) {
    ctx.body = strapi
      .plugin('strapi-location-picker')
      // the name of the service file & the method.
      .service('service')
      .getWelcomeMessage();
  },
});

export default controller;
