const FORM_TYPE = {
    ATTACH_FILE: "attach_file",
    CHECKBOX: "checkbox",
    CHECKBOX_GROUP: "checkbox_group",
    COMMENT_BOX: "textarea",
    CUSTOM: "custom",
    DATE: "date",
    DROPDOWN: "select",
    EMAIL: "email",
    INPUT: "input",
    LOOKUP: "lookup",
    NUMBER: "number",
    NUMERIC: "number",
    PASSWORD: "password",
    RADIO: "radio",
    RENDER: "custom",
    SELECT: "select",
    STRING: "text",
    SWITCH: "switch",
    TEXT: "text",
    TEXTAREA: "textarea",
    URL: "url",
} as const;

const FORM_LAYOUT = {
    HORIZONTAL: "horizontal",
    VERTICAL: "vertical",
} as const;

const FORM_FIELD_SPAN = {
    QUARTER: 6,
    THIRD: 8,
    HALF: 12,
    FULL: 24,
} as const;

const FORM_SECTION_GUTTER = {
    DEFAULT: [24, 16],
} as const;

const DEPARTMENT_FORM_ITEM = {
    CODE_LABEL: "Code",
    CODE_PLACEHOLDER: "Enter department code",
    NAME_LABEL: "Name",
    NAME_PLACEHOLDER: "Enter department name",
    SECTION_KEY: "department-fields",
} as const;

const USER_FORM_ITEM = {
    AVATAR_LABEL: "Avatar URL",
    AVATAR_PLACEHOLDER: "https://example.com/avatar.png",
    CLEAR_DEPARTMENT: "Clear",
    DEPARTMENT_HELPER_TEXT: "Search and select a department from the lookup table.",
    DEPARTMENT_LABEL: "Department",
    DEPARTMENT_PLACEHOLDER: "No department selected",
    EMAIL_LABEL: "Email",
    EMAIL_PLACEHOLDER: "user@example.com",
    LOOKUP_DEPARTMENT: "Lookup Department",
    NAME_LABEL: "Name",
    NAME_PLACEHOLDER: "Enter full name",
    PASSWORD_CREATE_DESCRIPTION: "Set an initial password for the new user.",
    PASSWORD_CREATE_PLACEHOLDER: "Minimum 6 characters",
    PASSWORD_EDIT_DESCRIPTION: "Only fill this in when you want to change the current password.",
    PASSWORD_EDIT_PLACEHOLDER: "Leave blank to keep current password",
    PASSWORD_LABEL: "Password",
    ROLE_LABEL: "Role",
    SECTION_KEY: "user-fields",
} as const;

const REPAIR_REQUEST_FORM_ITEM = {
    ADD_PRODUCT: "Add Product",
    DEPARTMENT_LABEL: "Department",
    EMPTY_ITEMS: "No repair request items added yet.",
    ITEMS_TITLE: "Repair Request Items",
    PRIORITY_LABEL: "Priority",
    PRODUCT_ITEM_LABEL: "product",
    REQUESTER_LABEL: "Requester",
    REQUEST_INFORMATION_SECTION_KEY: "request-information",
    REQUEST_INFORMATION_TITLE: "Request Information",
    SUMMARY_SECTION_KEY: "line-items-section",
} as const;

const REPAIR_REQUEST_ITEM_STATUS_FORM_ITEM = {
    CODE_LABEL: "Code",
    CODE_PLACEHOLDER: "Enter status code",
    NAME_LABEL: "Name",
    NAME_PLACEHOLDER: "Enter status name",
    IS_FINAL_LABEL: "Final Processing Status",
    ORDER_SEQUENCE_LABEL: "Order Sequence",
    SECTION_KEY: "repair-request-item-status-fields",
}

const PART_FORM_ITEM = {
    CODE_LABEL: "Code",
    CODE_PLACEHOLDER: "Enter part code",
    NAME_LABEL: "Name",
    NAME_PLACEHOLDER: "Enter part name",
    SECTION_KEY: "part-fields",
} as const;

const PRODUCT_TYPE_FORM_ITEM = {
    PRODUCT_TYPE_LABEL: "Product Type",
    PRODUCT_TYPE_PLACEHOLDER: "Select product type",
} as const;

const REPAIR_STATUS_FORM_ITEM = {
    CODE_LABEL: "Code",
    CODE_PLACEHOLDER: "Enter repair status code",
    NAME_LABEL: "Name",
    NAME_PLACEHOLDER: "Enter repair status name",
    SECTION_KEY: "repair-status-fields",
} as const;

const WORK_ORDER_FORM_ITEM = {
    REPAIR_REQUEST_ITEM_LABEL: "Repair Request Item",
    REPAIR_REQUEST_ITEM_PLACEHOLDER: "Select a repair request item",
    REPAIR_REQUEST_ITEM_LOOKUP: "Select Item",
    REPAIR_REQUEST_ITEM_CLEAR: "Clear Item",
    SCHEDULED_START_LABEL: "Scheduled Start",
    SCHEDULED_START_PLACEHOLDER: "Select start date",
    SCHEDULED_END_LABEL: "Scheduled End",
    SCHEDULED_END_PLACEHOLDER: "Select end date",
    ORDER_SEQUENCE_LABEL: "Order Sequence",
    ORDER_SEQUENCE_PLACEHOLDER: "e.g. 1",
    STATUS_LABEL: "Work Order Status",
    STATUS_PLACEHOLDER: "Select a status",
    STATUS_LOOKUP: "Select Status",
    STATUS_CLEAR: "Clear Status",
    SECTION_KEY: "work-order-fields",
} as const;


export {
    FORM_LAYOUT,
	FORM_FIELD_SPAN,
	FORM_SECTION_GUTTER,
	FORM_TYPE,
    DEPARTMENT_FORM_ITEM,
    REPAIR_REQUEST_FORM_ITEM,
    USER_FORM_ITEM,
    REPAIR_REQUEST_ITEM_STATUS_FORM_ITEM,
    PART_FORM_ITEM,
    PRODUCT_TYPE_FORM_ITEM,
    REPAIR_STATUS_FORM_ITEM,
    WORK_ORDER_FORM_ITEM,
};
