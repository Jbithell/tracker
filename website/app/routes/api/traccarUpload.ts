import { data } from "react-router";
import type { Route } from "./+types/traccarUpload";

export const loader = async ({ context, request }: Route.LoaderArgs) => {
  // Get parameters from the request
  const url = new URL(request.url);
  console.log(
    `Request received, method ${
      request.method
    }, parameters ${url.searchParams.toString()}, body ${await request.text()}`
  );
  url.searchParams.forEach((value, key) => {
    console.log(key, value);
  });
  return data({ message: "Not yet developed" }, 200);
};

export const action = async ({ context, request }: Route.ActionArgs) => {
  if (request.method === "PUT") {
    let payload: unknown;
    try {
      payload = await request.json();
    } catch (e) {
      return data({ message: "Invalid JSON" }, 400);
    }
    console.log("Payload", payload);
    return data({ message: "Not yet developed" }, 200);
  }
  if (request.method === "POST") {
    let payload: unknown;
    try {
      payload = await request.json();
    } catch (e) {
      return data({ message: "Invalid JSON" }, 400);
    }
    console.log("Payload", payload);
    console.log(`Payload is ${JSON.stringify(payload)}`);
    return data({ message: "Not yet developed" }, 200);
  }
};
