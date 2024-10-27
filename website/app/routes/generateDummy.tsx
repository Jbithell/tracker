import { useState } from "react";
const GENERATE = false;
const getRandomTimestamp = () => {
  const now = Date.now();
  const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;
  return Math.floor(Math.random() * (now - oneYearAgo) + oneYearAgo);
};
export default function Index() {
  const [sending, setSending] = useState(true);
  if (GENERATE)
    fetch("http://127.0.0.1:5173/upload.json", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({
        location: {
          coords: {
            accuracy: 15,
            longitude: Math.random() * 360 - 180,
            altitude: 50,
            heading: 0,
            latitude: Math.random() * 180 - 90,
            altitudeAccuracy: 1,
            speed: 0,
          },
          mocked: false,
          timestamp: getRandomTimestamp(),
        },
        battery: {
          percentage: Math.floor(Math.random() * 100) + 1,
          charging: Math.random() > 0.5,
        },
      }),
    }).then(() => {
      setSending(false);
    });
  if (!GENERATE) return <div>Not generating dummy data</div>;
  if (sending) return <div>Sending dummy data</div>;
  return <div>Sent dummy data</div>;
}
