export const RolesTableConfig = {
    columns: [
        {
            key: "label",
            label: "Role Name",
            sortable: true,
            className:
                "text-center px-6 py-4 text-left font-semibold text-sm tracking-wider",
        },
        {
            key: "description",
            label: "Description",
            sortable: true,
            className:
                "text-center w-90 px-6 py-4 text-left font-semibold text-sm tracking-wider",
        },
        {
            key: "permissions",
            label: "Permissions",
            sortable: false,
            type: "multi-values",
            className:
                "text-center px-6 py-4 text-left font-semibold text-sm tracking-wider",
        },
        {
            key: "actions",
            label: "Actions",
            sortable: false,
            isAction: true,
            className:
                "text-center px-6 py-4 text-left font-semibold text-sm tracking-wider",
        },
    ],
    actions: [
        {
            key: "view",
            label: "View",
            icon: "Eye" as const,
            route: "",
            className:
                "w-8 rounded-lg h-8 p-2 bg-blue-500 hover: bg-blue-600 text-white",
            tooltip: "View",
            permission: "view-role",
        },
        {
            key: "edit",
            label: "Edit",
            icon: "Edit" as const,
            route: "",
            className:
                "w-8 rounded-lg h-8 p-2 bg-amber-500 hover:bg-amber-600 text-white",
            tooltip: "Edit",
            permission: "edit-role",
        },
        {
            key: "delete",
            label: "Delete",
            icon: "Trash2" as const,
            route: "",
            className:
                "w-8 rounded-lg h-8 p-2 bg-red-500 hover:bg-red-600 text-white",
            tooltip: "Delete",
            permission: "delete-role",
        },
    ],
};
