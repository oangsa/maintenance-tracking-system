const DATA_TABLE_FILTER_TYPE = {
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
        PRIORITY: "priority",
        STATUS: "status",
    },
    LABEL: {
        PRIORITY: "Priority",
        STATUS: "Status",
    },
    PARAM_KEY: {
        PRIORITY: "filterPriority",
        STATUS: "filterStatus",
    },
    SEARCH_FIELD: {
        PRIORITY: "priority",
        REQUESTER_ID: "requester_id",
        STATUS: "current_status_code",
    },
    SEARCH_TERM: "request_no",
} as const;

export {
    DATA_TABLE_FILTER_TYPE,
    REPAIR_REQUEST_FIELD_FILTER,
    USER_FIELD_FILTER,
};
