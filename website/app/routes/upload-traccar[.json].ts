import {
  ActionFunctionArgs,
  json,
  redirect,
  type LoaderFunctionArgs,
} from "react-router";
import { db } from "../d1client.server";
import { withZod } from "@remix-validated-form/with-zod";
import { number, z as zod } from "zod";
import { GenericObject, validationError } from "remix-validated-form";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { Events } from "~/database/schema/Events";

export const loader = async ({ context, request }: ActionFunctionArgs) => {
  const { env, cf } = context.cloudflare;
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
  return json({ message: "Not yet developed" }, 200);
};

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const { env, cf } = context.cloudflare;
  if (request.method !== "PUT") {
    return json({ message: "Method not allowed" }, 405);
  }
  let payload: unknown;
  try {
    payload = await request.json();
  } catch (e) {
    return json({ message: "Invalid JSON" }, 400);
  }
  console.log("Payload", payload);
  return json({ message: "Not yet developed" }, 200);
};
