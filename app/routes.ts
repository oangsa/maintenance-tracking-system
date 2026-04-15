import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
        layout("routes/layout.tsx", [
            index("routes/home.tsx"),
            route("test", "routes/test.tsx"),
            route("master/users", "routes/master.users.tsx"),
            route("master/users/new", "routes/master.users.new.tsx"),
            route("master/users/:id/edit", "routes/master.users.$id.edit.tsx"),
            route("master/users/:id", "routes/master.users.$id.tsx"),
        ]),
        route("auth/login", "routes/login.tsx"),
    ] satisfies RouteConfig;
