export const TbcsTableConfig = {
    columns: [
        {
            key: "code",
            label: "TBC Code",
            sortable: true,
            className:
                "text-center px-6 py-4 text-left font-semibold text-sm tracking-wider hover: bg-black-600",
        },
        {
            key: "center_name",
            label: "PHC Name",
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
            permission: "view-center",
        },
        {
            key: "edit",
            label: "Edit",
            icon: "Edit" as const,
            route: "",
            className:
                "w-8 rounded-lg h-8 p-2 bg-amber-500 hover:bg-amber-600 text-white",
            tooltip: "Edit",
            permission: "edit-center",
        },
        {
            key: "delete",
            label: "Delete",
            icon: "Trash2" as const,
            route: "",
            className:
                "w-8 rounded-lg h-8 p-2 bg-red-500 hover:bg-red-600 text-white",
            tooltip: "Delete",
            permission: "delete-center",
        },
    ],
};
