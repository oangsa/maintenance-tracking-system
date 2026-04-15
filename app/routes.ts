import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
        layout("routes/layout.tsx", [
            index("routes/home.tsx"),
            route("test", "routes/test.tsx"),

            // master routes
            route("master/departments", "routes/Master/Departments/master.departments.tsx"),
            route("master/departments/new", "routes/Master/Departments/master.departments.new.tsx"),
            route("master/departments/:id/edit", "routes/Master/Departments/master.departments.$id.edit.tsx"),
            route("master/departments/:id", "routes/Master/Departments/master.departments.$id.tsx"),
            route("master/users", "routes/Master/Users/master.users.tsx"),
            route("master/users/new", "routes/Master/Users/master.users.new.tsx"),
            route("master/users/:id/edit", "routes/Master/Users/master.users.$id.edit.tsx"),
            route("master/users/:id", "routes/Master/Users/master.users.$id.tsx"),
        ]),
        route("auth/login", "routes/login.tsx"),
    ] satisfies RouteConfig;
