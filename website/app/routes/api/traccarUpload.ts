import { data } from "react-router";
import { z as zod } from "zod";
import type { Route } from "./+types/traccarUpload";

export const loader = async ({ context, request }: Route.LoaderArgs) => {
  const getRequestParameters = zod.object({
    name: zod.string().optional(),
    uniqueId: zod.string().optional(),
    status: zod.string().optional(),
    deviceId: zod.coerce.number().optional(),
    protocol: zod.string().optional(),
    deviceTime: zod.string().optional(),
    fixTime: zod.string().optional(),
    valid: zod.boolean().optional(),
    latitude: zod.coerce.number().optional(),
    longitude: zod.coerce.number().optional(),
    altitude: zod.coerce.number().optional(),
    speed: zod.coerce.number().optional(),
    course: zod.coerce.number().optional(),
    accuracy: zod.coerce.number().optional(),
    statusCode: zod.string().optional(),
    address: zod.string().optional(),
    attributes: zod.string().optional(),
    gprmc: zod.string().optional(),
  });
  // Get parameters from the request
  const url = new URL(request.url);
  console.log(
    `Request received, method ${
      request.method
    }, parameters ${url.searchParams.toString()}, body ${await request.text()}`
  );
  const parsedRequestParameters = await getRequestParameters.safeParseAsync(
    Object.fromEntries(url.searchParams)
  );
  if (!parsedRequestParameters.success)
    console.log(parsedRequestParameters.error);
  console.log(parsedRequestParameters.data);
  return data({ message: "Not yet developed" }, 200);
};

export const action = async ({ context, request }: Route.ActionArgs) => {
  if (request.method === "POST") {
    const postPayloadSchema = zod.object({
      event: zod.object({
        id: zod.coerce.number(),
        attributes: zod.object({}).optional(),
        deviceId: zod.coerce.number(),
        type: zod.string(),
        eventTime: zod.string(),
        positionId: zod.coerce.number(),
        geofenceId: zod.coerce.number(),
        maintenanceId: zod.coerce.number(),
      }),
      device: zod.object({
        id: zod.coerce.number(),
        attributes: zod.object({}).optional(),
        groupId: zod.coerce.number(),
        calendarId: zod.coerce.number(),
        name: zod.string(),
        uniqueId: zod.string(),
        status: zod.string(),
        lastUpdate: zod.string(),
        positionId: zod.coerce.number(),
        phone: zod.string().optional(),
        model: zod.string().optional(),
        contact: zod.string().optional(),
        category: zod.string().optional(),
        disabled: zod.boolean(),
        expirationTime: zod.string().optional(),
      }),
    });
    let payload: unknown;
    try {
      payload = await request.json();
    } catch (e) {
      return data({ message: "Invalid JSON" }, 400);
    }
    const parsedPayload = await postPayloadSchema.safeParseAsync(payload);
    if (!parsedPayload.success) console.log(parsedPayload.error);
    console.log(`Payload is ${JSON.stringify(payload)}`);
    return data({ message: "Not yet developed" }, 200);
  } else return data({ message: "Method not allowed" }, 405);
};
