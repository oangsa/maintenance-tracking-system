const DATA_TABLE_FILTER_TYPE = {
    DATE: "date",
    MULTI_SELECT: "multi-select",
    SELECT: "select",
    TEXT: "text",
} as const;

const USER_FIELD_FILTER = {
    DEPARTMENT_OPTION_QUERY: {
        ORDER_BY: "name asc",
        PAGE_NUMBER: 1,
        PAGE_SIZE: 100,
    },
    FIELD_KEY: {
        DEPARTMENT: "department",
        ROLE: "role",
    },
    LABEL: {
        DEPARTMENT: "Department",
        ROLE: "Role",
    },
    PARAM_KEY: {
        DEPARTMENT: "filterDepartment",
        ROLE: "filterRole",
    },
    SEARCH_FIELD: {
        DEPARTMENT_ID: "department_id",
        ROLE: "role",
    },
    SEARCH_TERM: "name,email",
} as const;

const REPAIR_REQUEST_FIELD_FILTER = {
    FIELD_KEY: {
        REQUESTED_AT_FROM: "requestedAtFrom",
        REQUESTED_AT_TO: "requestedAtTo",
        PRIORITY: "priority",
        STATUS: "status",
    },
    LABEL: {
        REQUESTED_AT_FROM: "Requested Date From",
        REQUESTED_AT_TO: "Requested Date To",
        PRIORITY: "Priority",
        STATUS: "Status",
    },
    PARAM_KEY: {
        REQUESTED_AT_FROM: "filterRequestedAtFrom",
        REQUESTED_AT_TO: "filterRequestedAtTo",
        PRIORITY: "filterPriority",
        STATUS: "filterStatus",
    },
    SEARCH_FIELD: {
        PRIORITY: "priority",
        REQUESTER_ID: "requester_id",
        REQUESTED_AT: "requested_at",
        STATUS: "current_status_code",
    },
    SEARCH_TERM: "request_no",
} as const;

const WORK_ORDER_FIELD_FILTER = {
    FIELD_KEY: {
        STATUS: "statusId",
    },
    LABEL: {
        STATUS: "Status",
    },
    PARAM_KEY: {
        STATUS: "filterStatus",
    },
    SEARCH_FIELD: {
        DEPARTMENT: "repair_request_item_department_id",
        STATUS: "repair_request_item_repair_status_id",
    },
    SEARCH_TERM: "work_order_no",
} as const;

export {
    DATA_TABLE_FILTER_TYPE,
    REPAIR_REQUEST_FIELD_FILTER,
    WORK_ORDER_FIELD_FILTER,
    USER_FIELD_FILTER,
};
