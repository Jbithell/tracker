import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [route("($date)/", "./routes/index.tsx")] satisfies RouteConfig;
