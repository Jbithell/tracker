import {
  type RouteConfig,
  index,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  route("generateDummyDataLocally", "./routes/generateDummy.tsx"),
  route("upload-traccar.json", "./routes/api/traccarUpload.ts"),
  route("upload.json", "./routes/api/appUpload.ts"),
  ...prefix(":date?", [
    route("table/:cursor?", "./routes/table.tsx"),
    route("timings", "./routes/timingPoints.tsx"),
    route("export.gpx", "./routes/downloadGPX.ts"),
    index("./routes/map.tsx"),
  ]),
] satisfies RouteConfig;
