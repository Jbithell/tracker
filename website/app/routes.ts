import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("generateDummyDataLocally", "./routes/generateDummy.tsx"),
  route("upload-traccar.json", "./routes/api/traccarUpload.ts"),
  route("upload.json", "./routes/api/appUpload.ts"),
  route(":date/table/:cursor?", "./routes/table.tsx"),
  route(":date?", "./routes/map.tsx"),
] satisfies RouteConfig;
