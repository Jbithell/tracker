import React, { useState } from "react";
import { Text, Pressable } from "react-native";
import * as Location from "expo-location";
import { baseStyles } from "./baseStyles";
import { sendLocation } from "./sendLocation";

const SendTestButton = () => {
  const [sending, setSending] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Highest,
  }).then((location) => {
    setLocation(location);
  });
  if (sending)
    return <Text style={baseStyles.text}>Sending manual update...</Text>;
  if (location === null) return;
  return (
    <>
      <Text>
        {location !== null
          ? `${location.coords.latitude},${
              location.coords.longitude
            }  ${Math.round(location.coords.altitude ?? 0)}m ${new Date(
              location.timestamp
            ).toLocaleTimeString()}`
          : ""}
      </Text>
      <Pressable
        style={baseStyles.button}
        onPress={() => {
          sendLocation(location).then((response) => setSending(false));
          setSending(true);
        }}
      >
        <Text style={baseStyles.buttonText}>Send location manually now</Text>
      </Pressable>
    </>
  );
};
export default SendTestButton;
