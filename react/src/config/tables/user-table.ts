export const UsersTableConfig = {
    columns: [
        {
            key: "name",
            label: "Name",
            sortable: true,
            className:
                "text-center px-6 py-4 text-left font-semibold text-sm tracking-wider",
        },
        // {
        //     key: "email",
        //     label: "Email",
        //     sortable: true,
        //     className:
        //         "text-center w-90 px-6 py-4 text-left font-semibold text-sm tracking-wider",
        // },
        {
            key: "centers",
            label: "Phc Name",
            sortable: true,
            className:
                "text-center px-6 py-4 text-left font-semibold text-sm tracking-wider",
        },
        // {
        //     key: "mobile",
        //     label: "Mobile No.",
        //     className:
        //         "text-center px-6 py-4 text-left font-semibold text-sm tracking-wider",
        // },
        {
            key: "tbc",
            label: "TBC",
            className:
                "text-center px-6 py-4 text-left font-semibold text-sm tracking-wider",
        },
        {
            key: "roles",
            label: "Roles",
            sortable: true,
            type: "multi-values",
            className:
                "text-center px-6 py-4 text-left font-semibold text-sm tracking-wider",
            permission: 'show-roles'
        },
        {
            key: "status",
            label: "Status",
            type: "switch",
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
            permission: "view-user",
        },
        {
            key: "edit",
            label: "Edit",
            icon: "Edit" as const,
            route: "",
            className:
                "w-8 rounded-lg h-8 p-2 bg-amber-500 hover:bg-amber-600 text-white",
            tooltip: "Edit",
            permission: "edit-user",
        },
        {
            key: "assign",
            label: "Assign",
            icon: "ArrowRightLeft" as const,
            route: "",
            className:
                "w-8 rounded-lg h-8 p-2 bg-green-500 hover:bg-green-600 text-white",
            tooltip: "Assign TBC to User",
            permission: "assign-users-to-tbc",
        },
        {
            key: "delete",
            label: "Delete",
            icon: "Trash2" as const,
            route: "",
            className:
                "w-8 rounded-lg h-8 p-2 bg-red-500 hover:bg-red-600 text-white",
            tooltip: "Delete",
            permission: "delete-user",
        },
    ],
};
