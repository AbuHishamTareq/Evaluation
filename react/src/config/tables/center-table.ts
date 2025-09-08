export const CentersTableConfig = {
    columns: [
        {
            key: "phc_moh_code",
            label: "PHC Code",
            sortable: true,
            className:
                "text-center px-6 py-4 text-left font-semibold text-sm tracking-wider hover: bg-black-600",
        },
        {
            key: "label",
            label: "PHC Name",
            sortable: true,
            className:
                "text-center px-6 py-4 text-left font-semibold text-sm tracking-wider hover: bg-black-600",
        },
        {
            key: "zone_name",
            label: "Zone Name",
            sortable: true,
            className:
                "text-center px-6 py-4 text-left font-semibold text-sm tracking-wider hover: bg-black-600",
        },
        {
            key: "codes",
            label: "TBC",
            sortable: false,
            type: "multi-values",
            className:
                "text-center px-6 py-4 text-left font-semibold text-sm tracking-wider",
        },
        {
            key: "status",
            label: "Status",
            type: "switch",
            sortable: false,
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
            permission: "view-tbc",
        },
        {
            key: "edit",
            label: "Edit",
            icon: "Edit" as const,
            route: "",
            className:
                "w-8 rounded-lg h-8 p-2 bg-amber-500 hover:bg-amber-600 text-white",
            tooltip: "Edit",
            permission: "edit-tbc",
        },
        {
            key: "assign",
            label: "Assign",
            icon: "ArrowRightLeft" as const,
            route: "",
            className:
                "w-8 rounded-lg h-8 p-2 bg-green-500 hover:bg-green-600 text-white",
            tooltip: "Assign TBCs to PHC",
            permission: "assign-tbcs-to-center",
        },
        {
            key: "delete",
            label: "Delete",
            icon: "Trash2" as const,
            route: "",
            className:
                "w-8 rounded-lg h-8 p-2 bg-red-500 hover:bg-red-600 text-white",
            tooltip: "Delete",
            permission: "delete-tbc",
        },
    ],
};
