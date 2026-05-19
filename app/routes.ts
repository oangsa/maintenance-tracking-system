import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
        layout("routes/layout.tsx", [
            index("routes/home.tsx"),

            // main feature routes
            route("repair-requests", "routes/Main/RepairRequests/repair-requests.tsx"),
            route("repair-requests/new", "routes/Main/RepairRequests/repair-requests.new.tsx"),
            route("repair-requests/:id", "routes/Main/RepairRequests/repair-requests.$id.tsx"),

            route("employee/work-orders", "routes/Main/WorkOrders/work-orders.tsx"),
            route("employee/work-orders/:id", "routes/Main/WorkOrders/work-orders.$id.tsx"),

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

            // repair statuses
            route("master/repair-statuses", "routes/Master/RepairStatuses/master.repair-statuses.tsx"),
            route("master/repair-statuses/new", "routes/Master/RepairStatuses/master.repair-statuses.new.tsx"),
            route("master/repair-statuses/:id/edit", "routes/Master/RepairStatuses/master.repair-statuses.$id.edit.tsx"),
            route("master/repair-statuses/:id", "routes/Master/RepairStatuses/master.repair-statuses.$id.tsx"),

            // End Region: Master routes

            // Region: Manager routes
            // repair requests
            route("manager/repair-requests", "routes/Manager/RepairRequests/manager.repair-requests.tsx"),
            route("manager/repair-requests/:id", "routes/Manager/RepairRequests/manager.repair-requests.$id.tsx"),

            // work orders
            route("manager/work-orders", "routes/Manager/WorkOrders/manager.work-orders.tsx"),
            route("manager/work-orders/new", "routes/Manager/WorkOrders/manager.work-orders.new.tsx"),
            route("manager/work-orders/:id/edit", "routes/Manager/WorkOrders/manager.work-orders.$id.edit.tsx"),
            route("manager/work-orders/:id", "routes/Manager/WorkOrders/manager.work-orders.$id.tsx"),

            // End Region: Manager routes

            // Parts
            route("master/parts", "routes/Master/Parts/master.parts.tsx"),
            route("master/parts/new", "routes/Master/Parts/master.parts.new.tsx"),
            route("master/parts/:id/edit", "routes/Master/Parts/master.parts.$id.edit.tsx"),
            route("master/parts/:id", "routes/Master/Parts/master.parts.$id.tsx"),
        ]),
        route("auth/login", "routes/login.tsx"),
    ] satisfies RouteConfig;
