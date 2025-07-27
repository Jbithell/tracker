import { Center } from "@mantine/core";
import { ClientOnly } from "remix-utils/client-only";
import { Map } from "./Map.client";
export interface MapProps {
  zoom: number;
  pins: {
    latitude: number;
    longitude: number;
    timestamp: number;
  }[];
  urlDate: string;
}
export const LiveMap = (props: MapProps) => (
  <ClientOnly fallback={<Center></Center>}>
    {() => <Map {...props} />}
  </ClientOnly>
);
