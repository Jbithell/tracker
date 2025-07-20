import {
  Button,
  Group,
  MantineProvider,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconBrandApple,
  IconBrandGoogleMaps,
  IconCar,
  IconCompass,
  IconCurrentLocation,
  IconFlagBolt,
  IconPinned,
  IconRefresh,
  IconSailboat,
} from "@tabler/icons-react";
import { DivIcon, divIcon, LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import { renderToStaticMarkup } from "react-dom/server";
import {
  AttributionControl,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { MapProps } from "./LiveMap";
import { useViewportSize } from "@mantine/hooks";
import { theme } from "~/root";
import { Link, useFetcher, useRevalidator } from "react-router";
import { DateTime } from "luxon";
import { useState } from "react";

export const MantineProviderWrapper = (props: {
  children: React.ReactNode;
}) => <MantineProvider theme={theme}>{props.children}</MantineProvider>;

const tablerMapIcon = (children: React.ReactNode) =>
  divIcon({
    html: renderToStaticMarkup(
      <MantineProviderWrapper>{children}</MantineProviderWrapper>
    ),
    iconSize: [20, 20],
    className: "myDivIcon",
  });
const ReCentreButton = (props: {
  lat: number;
  lon: number;
  zoom: number | undefined;
}) => {
  const map = useMap();
  return (
    <Button
      onClick={() => map.setView(new LatLng(props.lat, props.lon), props.zoom)}
    >
      <IconCurrentLocation />
    </Button>
  );
};
const RefreshButton = () => {
  const revalidator = useRevalidator();
  return (
    <Button onClick={() => revalidator.revalidate()}>
      <IconRefresh />
    </Button>
  );
};
const ThisUserCurrentLocation = (props: { icon: DivIcon }) => {
  const [position, setPosition] = useState<LatLng | null>(null);
  const map = useMapEvents({
    click() {
      map.locate();
    },
    locationfound(e) {
      setPosition(e.latlng);
    },
  });
  return position === null ? null : (
    <Marker position={position} icon={props.icon} zIndexOffset={900}>
      <Popup>Your location</Popup>
    </Marker>
  );
};

export const Map = (props: MapProps) => {
  const { width, height } = useViewportSize();
  if (!props.pins || props.pins.length === 0) {
    return <Text>No data</Text>;
  }

  const uniquePins = Object.values(
    props.pins.reduce((acc, pin) => {
      const key = `${pin.latitude.toFixed(7)},${pin.longitude.toFixed(7)}`;
      if (!acc[key] || acc[key].timestamp < pin.timestamp) {
        acc[key] = pin;
      }
      return acc;
    }, {} as Record<string, (typeof props.pins)[0]>)
  );

  const highestTimestampPin = props.pins.reduce((maxPin, currentPin) => {
    return currentPin.timestamp > maxPin.timestamp ? currentPin : maxPin;
  }, props.pins[0]);

  if (!width || !height || width === 0 || height === 0)
    return null; // You can only render the map once, subsequent re-renders won't do anything - so we need to wait until we have the viewport size
  else
    return (
      <div style={{ height: height, width: width }}>
        <MapContainer
          center={[highestTimestampPin.latitude, highestTimestampPin.longitude]}
          zoom={props.zoom}
          scrollWheelZoom={false}
          style={{
            height: `${height}px`,
            width: `${width}px`,
            zIndex: 0,
          }}
          attributionControl={false}
        >
          <TileLayer
            attribution='Map &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <AttributionControl
            position="bottomright"
            prefix='
              <a href="table">
                Position History
              </a>&nbsp;|&nbsp;
              <a href="https://leafletjs.com" title="A JavaScript library for interactive maps" target="_blank" rel="noopener noreferrer">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" class="leaflet-attribution-flag"><path fill="#4C7BE1" d="M0 0h12v4H0z"></path><path fill="#FFD500" d="M0 4h12v3H0z"></path><path fill="#E0BC00" d="M0 7h12v1H0z"></path></svg> Leaflet
              </a>'
          />
          <ThisUserCurrentLocation
            icon={tablerMapIcon(
              <ThemeIcon radius="md" size="lg">
                <IconCompass style={{ width: "70%", height: "70%" }} />
              </ThemeIcon>
            )}
          />
          <Polyline
            positions={uniquePins.map((pin) => [pin.latitude, pin.longitude])}
            color={"red"}
            smoothFactor={10}
          />
          {/*uniquePins.map((pin, index) => (
            <Marker
              key={index}
              position={[pin.latitude, pin.longitude]}
              icon={tablerMapIcon(
                <ThemeIcon radius="xl" size="sm" color="orange">
                  <IconPinned style={{ width: "70%", height: "70%" }} />
                </ThemeIcon>
              )}
            >
              <Popup>
                <Text>
                  {DateTime.fromSeconds(pin.timestamp / 1000, {
                    zone: "local",
                  }).toLocaleString(DateTime.DATETIME_MED)}
                </Text>
              </Popup>
            </Marker>
          ))*/}
          <Marker
            position={[
              highestTimestampPin.latitude,
              highestTimestampPin.longitude,
            ]}
            zIndexOffset={1000}
            icon={tablerMapIcon(
              <ThemeIcon radius="md" size="lg">
                <IconCar style={{ width: "70%", height: "70%" }} />
              </ThemeIcon>
            )}
          >
            <Popup>
              <Text>
                Tracker last seen{" "}
                {DateTime.fromSeconds(highestTimestampPin.timestamp / 1000, {
                  zone: "local",
                }).toRelative()}
                <br />
                {DateTime.fromSeconds(highestTimestampPin.timestamp / 1000, {
                  zone: "local",
                }).toLocaleString(DateTime.DATETIME_MED)}
              </Text>
              <Link
                to={`https://www.google.com/maps?q=${highestTimestampPin.latitude},${highestTimestampPin.longitude}`}
                target="_blank"
              >
                <Button
                  size="xs"
                  m="xs"
                  rightSection={
                    <IconBrandGoogleMaps
                      style={{ width: "70%", height: "70%" }}
                    />
                  }
                >
                  Google Maps
                </Button>
              </Link>
              <Link
                to={`https://maps.apple.com/?q=${highestTimestampPin.latitude},${highestTimestampPin.longitude}`}
                target="_blank"
              >
                <Button
                  size="xs"
                  m="xs"
                  rightSection={
                    <IconBrandApple style={{ width: "70%", height: "70%" }} />
                  }
                >
                  Apple Maps
                </Button>
              </Link>
            </Popup>
          </Marker>
          <div className="leaflet-top leaflet-right">
            <div className="leaflet-control leaflet-bar">
              <Group>
                <ReCentreButton
                  lat={highestTimestampPin.latitude}
                  lon={highestTimestampPin.longitude}
                  zoom={props.zoom}
                />
                <RefreshButton />
              </Group>
            </div>
          </div>
        </MapContainer>
      </div>
    );
};
