import { getPowerStateAsync } from "expo-battery";
import { LocationObject } from "expo-location";
export const sendLocation = (location: LocationObject) => {
  getPowerStateAsync()
    .then((powerState) => {
      console.log("Power state:", powerState);
      return fetch("https://example.com/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location,
          powerState,
        }),
      });
    })
    .then((fetchResponse) => {
      console.log("Response:", fetchResponse);
    })
    .catch((error) => {
      console.error("Error sending location:", error);
    });
};
