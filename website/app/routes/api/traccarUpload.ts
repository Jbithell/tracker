import { data } from "react-router";
import type { Route } from "./+types/traccarUpload";

export const loader = async ({ context, request }: Route.LoaderArgs) => {
  // Get parameters from the request
  const url = new URL(request.url);
  console.log("Request info", {
    url,
    method: request.method,
    headers: request.headers,
    body: request.body,
  });
  url.searchParams.forEach((value, key) => {
    console.log(key, value);
  });
  return data({ message: "Not yet developed" }, 200);
};

export const action = async ({ context, request }: Route.ActionArgs) => {
  if (request.method !== "PUT") {
    return data({ message: "Method not allowed" }, 405);
  }
  let payload: unknown;
  try {
    payload = await request.json();
  } catch (e) {
    return data({ message: "Invalid JSON" }, 400);
  }
  console.log("Payload", payload);
  return data({ message: "Not yet developed" }, 200);
};
