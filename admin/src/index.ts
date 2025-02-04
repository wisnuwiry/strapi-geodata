import { PLUGIN_ID, FIELD_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { PluginIcon } from './components/PluginIcon';
import * as yup from 'yup';

export default {
  register(app: any) {
    // Custom Field Input Location
    app.customFields.register({
      name: FIELD_ID,
      pluginId: PLUGIN_ID,
      type: 'json', // the field will be stored as a json
      intlLabel: {
        id: PLUGIN_ID + '.' + FIELD_ID + '.label',
        defaultMessage: 'Location Picker',
      },
      intlDescription: {
        id: PLUGIN_ID + '.' + FIELD_ID + '.description',
        defaultMessage:
          'Allows to save and manage geographic locations, supporting latitude, longitude',
      },
      default: 12,
      isResizable: true,
      icon: PluginIcon,
      components: {
        Input: async () => import('./components/Input'),
      },
      options: {
        base: [
          /*
            Declare settings to be added to the "Base settings" section
            of the field in the Content-Type Builder
          */
          {
            sectionTitle: {
              // Add a "Format" settings section
              id: 'geodata.geojson.section.info',
              defaultMessage: 'Information about the setup',
            },
            items: [
              // Add settings items to the section
              {
                /*
                  Add a "Color format" dropdown
                  to choose between 2 different format options
                  for the color value: hexadecimal or RGBA
                */
                intlLabel: {
                  id: 'geodata.geojson.info.label',
                  defaultMessage:
                    'Only one GeoJSON field is allowed per content type',
                },
                name: 'options.info',
                type: 'checkbox',
                value: 'ok', // option selected by default
                required: true,
                options: [
                  // List all available "Color format" options
                  {
                    key: 'confirm',
                    defaultValue: 'off',
                    value: 'on',
                    metadatas: {
                      intlLabel: {
                        id: 'geodata.geojson.info.confirm',
                        defaultMessage: 'Confirm',
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
        validator: (args: any) => ({
          info: yup.bool().required({
            id: 'geodata.geojson.info.error',
            defaultMessage: 'Confirm the understanding of the information',
          }),
        }),
      },
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);

          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};
