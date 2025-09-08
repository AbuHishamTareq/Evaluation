export const ZonesTableConfig = {
    columns: [
        {
            key: "label",
            label: "Zone Name",
            sortable: true,
            className:
                "text-center px-6 py-4 text-left font-semibold text-sm tracking-wider hover: bg-black-600",
        },
        {
            key: "elt_name",
            label: "Elt Name",
            sortable: true,
            className:
                "text-center px-6 py-4 text-left font-semibold text-sm tracking-wider hover: bg-black-600",
        },
        {
            key: "created_at",
            label: "Created At",
            sortable: true,
            className:
                "text-center px-6 py-4 text-left font-semibold text-sm tracking-wider hover: bg-black-600",
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
            permission: "view-zone",
        },
        {
            key: "edit",
            label: "Edit",
            icon: "Edit" as const,
            route: "",
            className:
                "w-8 rounded-lg h-8 p-2 bg-amber-500 hover:bg-amber-600 text-white",
            tooltip: "Edit",
            permission: "edit-zone",
        },
        {
            key: "delete",
            label: "Delete",
            icon: "Trash2" as const,
            route: "",
            className:
                "w-8 rounded-lg h-8 p-2 bg-red-500 hover:bg-red-600 text-white",
            tooltip: "Delete",
            permission: "delete-zone",
        },
    ],
};
