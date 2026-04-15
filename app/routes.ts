import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
        index("routes/home.tsx"),

        // Create new routes here like this:
        route("test", "routes/test.tsx"),
    ] satisfies RouteConfig;
