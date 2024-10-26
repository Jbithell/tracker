import { BatteryState, getPowerStateAsync } from "expo-battery";
import { LocationObject } from "expo-location";
export const sendLocation = async (location: LocationObject) => {
  console.log("Sending location:", location);
  return getPowerStateAsync()
    .then((powerState) => {
      const body = JSON.stringify({
        location,
        battery: {
          percentage: Math.round(powerState.batteryLevel * 100),
          charging: powerState.batteryState === BatteryState.CHARGING,
        },
      });
      console.log("Sending request with body", body);
      return fetch("https://event-tracker-91r.pages.dev/upload.json", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });
    })
    .then((fetchResponse) => {
      console.log("Response:", fetchResponse);
      return true;
    })
    .catch((error) => {
      console.error("Error sending location:", error);
      return false;
    });
};
