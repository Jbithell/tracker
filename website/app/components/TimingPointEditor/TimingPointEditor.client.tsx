import {
  Button,
  MantineProvider,
  Modal,
  NumberInput,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import { IconPinned } from "@tabler/icons-react";
import { divIcon, type LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  AttributionControl,
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import { useFetcher } from "react-router";
import { theme } from "~/root";
import type { TimingPointEditorProps } from "./TimingPointEditor";

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

function NewPointCreator({
  newPoint,
  setNewPoint,
}: {
  newPoint: LatLng | null;
  setNewPoint: (point: LatLng | null) => void;
}) {
  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      setNewPoint(null);
    }
  }, [fetcher.state, fetcher.data, setNewPoint]);

  useMapEvents({
    click(e) {
      setNewPoint(e.latlng);
    },
  });

  if (newPoint === null) return null;

  return (
    <Modal
      opened={newPoint !== null}
      onClose={() => setNewPoint(null)}
      title="Create new Timing Point"
    >
      <fetcher.Form method="post" action="/timingPointEditor">
        <TextInput
          label="Name"
          placeholder="Enter name for timing point"
          name="name"
          required
        />
        <NumberInput
          label="Radius"
          placeholder="Enter radius in metres"
          name="radius"
          required
          defaultValue={10}
          min={1}
          step={1}
        />
        <input type="hidden" name="latitude" value={newPoint.lat} />
        <input type="hidden" name="longitude" value={newPoint.lng} />
        <Button type="submit" mt="md">
          Create
        </Button>
      </fetcher.Form>
    </Modal>
  );
}

export const TimingPointEditor = (props: TimingPointEditorProps) => {
  const { width, height } = useViewportSize();
  const [newPoint, setNewPoint] = useState<LatLng | null>(null);

  if (!width || !height || width === 0 || height === 0)
    return null; // You can only render the map once, subsequent re-renders won't do anything - so we need to wait until we have the viewport size
  else
    return (
      <div style={{ height: height, width: width }}>
        <MapContainer
          zoom={13}
          center={[51.505, -0.09]}
          scrollWheelZoom={false}
          style={{
            height: `${height}px`,
            width: `${width}px`,
            zIndex: 0,
          }}
          attributionControl={false}
        >
          <NewPointCreator newPoint={newPoint} setNewPoint={setNewPoint} />
          <TileLayer
            attribution='Map &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <AttributionControl
            position="bottomright"
            prefix={`
              <a href="https://leafletjs.com" title="A JavaScript library for interactive maps" target="_blank" rel="noopener noreferrer">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" class="leaflet-attribution-flag"><path fill="#4C7BE1" d="M0 0h12v4H0z"></path><path fill="#FFD500" d="M0 4h12v3H0z"></path><path fill="#E0BC00" d="M0 7h12v1H0z"></path></svg> Leaflet
              </a>`}
          />
          {props.timingPoints.map((pin, index) => (
            <>
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
                  <Text>{pin.name}</Text>
                  <Text>Radius: {pin.radius}m</Text>
                  <Text>
                    Applicable Dates: {pin.applicableDates.join(", ")}
                  </Text>
                  <Text>Order: {pin.order}</Text>
                </Popup>
              </Marker>
              <Circle
                center={[pin.latitude, pin.longitude]}
                radius={pin.radius}
                pathOptions={{ color: "blue" }}
              />
            </>
          ))}
          {newPoint && (
            <Marker position={newPoint}>
              <Popup>New Timing Point Location</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    );
};
