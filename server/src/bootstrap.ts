import type { Core } from '@strapi/strapi';
import geohash from 'ngeohash';

const bootstrap = ({ strapi }: { strapi: Core.Strapi }) => {
  // bootstrap phase
  strapi.db.lifecycles.subscribe((event) => {
    if (event.action === 'beforeCreate' || event.action === 'beforeUpdate') {
      // do something
      for (const key in event.model.attributes) {
        let field: any = event.model.attributes[key];
        if (field?.customField === 'plugin::geodata.geojson') {
          event.params.data.lat = event.params.data[key]?.lat;
          event.params.data.lng = event.params.data[key]?.lng;
          if (event.params.data.lat && event.params.data.lng) {
            event.params.data.geohash = geohash.encode(event.params.data.lat, event.params.data.lng);
            // console.log('geohash neighbors', geohash.neighbors(event.params.data.geohash));
            // console.log('geohash neighbors', geohash.neighbors(event.params.data.geohash.substr(0, 6)));
          }
        }
      }
    }
  });
};

export default bootstrap;
