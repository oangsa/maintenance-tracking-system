import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
        layout("routes/layout.tsx", [
            index("routes/home.tsx"),
            route("test", "routes/test.tsx"),

            // main feature routes
            route("repair-requests", "routes/Main/RepairRequests/repair-requests.tsx"),
            route("repair-requests/new", "routes/Main/RepairRequests/repair-requests.new.tsx"),
            route("repair-requests/:id", "routes/Main/RepairRequests/repair-requests.$id.tsx"),

            // Region: Master routes
            // departments
            route("master/departments", "routes/Master/Departments/master.departments.tsx"),
            route("master/departments/new", "routes/Master/Departments/master.departments.new.tsx"),
            route("master/departments/:id/edit", "routes/Master/Departments/master.departments.$id.edit.tsx"),
            route("master/departments/:id", "routes/Master/Departments/master.departments.$id.tsx"),

            // users
            route("master/users", "routes/Master/Users/master.users.tsx"),
            route("master/users/new", "routes/Master/Users/master.users.new.tsx"),
            route("master/users/:id/edit", "routes/Master/Users/master.users.$id.edit.tsx"),
            route("master/users/:id", "routes/Master/Users/master.users.$id.tsx"),

            // repair request item status
            route("master/repair-request-item-status", "routes/Master/RepairRequestItemStatus/master.repairRequestItemStatus.tsx"),
            route("master/repair-request-item-status/new", "routes/Master/RepairRequestItemStatus/master.repairRequestItemStatus.new.tsx"),
            route("master/repair-request-item-status/:id/edit", "routes/Master/RepairRequestItemStatus/master.repairRequestItemStatus.$id.edit.tsx"),
            route("master/repair-request-item-status/:id", "routes/Master/RepairRequestItemStatus/master.repairRequestItemStatus.$id.tsx"),

            // End Region: Master routes

            // Region: Manager routes
            // repair requests
            route("manager/repair-requests", "routes/Manager/RepairRequests/manager.repair-requests.tsx"),
            route("manager/repair-requests/:id", "routes/Manager/RepairRequests/manager.repair-requests.$id.tsx"),

            // End Region: Manager routes
        ]),
        route("auth/login", "routes/login.tsx"),
    ] satisfies RouteConfig;
