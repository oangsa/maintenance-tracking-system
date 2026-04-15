import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
        layout("routes/layout.tsx", [
            index("routes/home.tsx"),
            route("test", "routes/test.tsx"),
        ]),
        route("auth/login", "routes/login.tsx"),
    ] satisfies RouteConfig;
