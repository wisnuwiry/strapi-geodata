import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngTuple, LeafletMouseEvent } from 'leaflet';

import { Box, Typography, JSONInput, TextInput, Button } from '@strapi/design-system';

import 'leaflet/dist/leaflet.css';
import { Field } from '@strapi/design-system';
import { useField } from '@strapi/strapi/admin';
import { Accordion } from '@strapi/design-system';

const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const customIcon = new L.Icon({
  iconUrl: iconUrl,
  iconRetinaUrl: iconRetinaUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  shadowUrl: shadowUrl,
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

interface Location {
  lat: number;
  lng: number;
}

interface InputProps {
  value: Location;
  [key: string]: any;
}

const mapProps = {
  zoom: 7,
  center: [41.9, 12.5] as LatLngTuple,
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  tileAttribution: 'OSM attribution',
  tileAccessToken: '',
};

const Input: React.FC<InputProps> = ({ hint, labelAction, label, name, required, ...props }) => {
  const field = useField(name);
  const [map, setMap] = useState<any>(null);
  const [location, _setLocation] = useState<any>(props.value);

  const searchRef = useRef<HTMLInputElement>(null);

  const onMapClick = useCallback(
    (e: LeafletMouseEvent) => {
      let lat = parseFloat(e.latlng.lat.toString());
      let lng = parseFloat(e.latlng.lng.toString());
      onSetLocation({ lat, lng });
    },
    []
  );

  useEffect(() => {
    if (!map) return;
    map.on('contextmenu', onMapClick);
    return () => {
      map.off('contextmenu', onMapClick);
    };
  }, [map, onMapClick]);

  useEffect(() => {
    field.onChange(name, location);
  }, [location]);

  async function searchLocation(e: React.MouseEvent) {
    let search = searchRef.current?.value;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${search}&format=json`
    );
    const data = await response.json();
    if (data.length > 0) {
      let lat = parseFloat(data[0].lat);
      let lng = parseFloat(data[0].lon);
      onSetLocation({ lat, lng });
      map.panTo({ lat, lng });
    }
  }

  const onSetLocation = ({ lat, lng }: { lat: number; lng: number }) => {
    _setLocation({ lat, lng });
  };

  const marginBottom = '1.5rem';
  const marginTop = '0.5rem';
  const display = 'block';

  return (
    <Field.Root error={props.error} name={name} id={name} hint={hint} required={required}>
      <Box>
        <Field.Label action={labelAction} style={{ marginBottom }}>
          {label}
        </Field.Label>

        <Box style={{ display: 'grid', gridTemplateColumns: '4fr 1fr', gap: '8px' }}>
          <TextInput ref={searchRef} name="search" placeholder="Address to search" />
          <Button onClick={searchLocation} size="l">
            Search
          </Button>
        </Box>

        <Typography variant="pi" style={{ marginBottom, display, marginTop }}>
          To set the location search for an address and press 'Search', or navigate on the map and
          right-click
        </Typography>

        <Box style={{ display: 'flex', height: '300px', width: '100%' }}>
          <Box style={{ width: '100% ' }}>
            <MapContainer
              zoom={mapProps.zoom}
              center={
                props.value?.lat && props.value?.lng
                  ? [props.value?.lat, props.value?.lng]
                  : (mapProps.center as LatLngTuple)
              }
              ref={setMap}
              style={{ height: '300px', zIndex: 299 }}
            >
              <TileLayer
                attribution={mapProps.tileAttribution}
                url={mapProps.tileUrl}
                accessToken={mapProps.tileAccessToken}
              />
              {location && <Marker position={[location?.lat, location?.lng]} icon={customIcon} />}
            </MapContainer>
          </Box>
        </Box>

        <Accordion.Root>
          <Accordion.Item value={`acc-${name}`}>
            <Accordion.Header>
              <Accordion.Trigger description="Coordinate">Coordinate</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>
              <JSONInput
                disabled
                name={props.name}
                value={
                  typeof field.value == 'object'
                    ? JSON.stringify(field.value, null, 2)
                    : field.value
                }
                onChange={(e: any) => onSetLocation(e)}
                style={{ height: '9rem' }}
              />
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>

        <Field.Hint />
        <Field.Error />
      </Box>
    </Field.Root>
  );
};

export default Input;
