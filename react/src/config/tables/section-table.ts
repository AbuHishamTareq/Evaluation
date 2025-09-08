export const SectionsTableConfig = {
    columns: [
        {
            key: "en_label",
            label: "Domain (English)",
            sortable: true,
            className:
                "text-center px-6 py-4 text-left font-semibold text-sm tracking-wider hover: bg-black-600",
        },
        {
            key: "ar_label",
            label: "Domain (Arabic)",
            sortable: true,
            isArabic: true,
            className:
                "text-center px-6 py-4 text-left font-semibold text-sm tracking-wider hover: bg-black-600",
        },
        {
            key: "type",
            label: "Evaluation Type",
            sortable: false,
            className:
                "text-center px-6 py-4 text-left font-semibold text-sm tracking-wider",
            render: (value: string) => {
                const typeMap: Record<string, string> = {
                    regular: "Regular Evaluation",
                    tabular: "Tabular Evaluation",
                };
                return typeMap[value] ?? value;
            },
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
            permission: "view-section",
        },
        {
            key: "edit",
            label: "Edit",
            icon: "Edit" as const,
            route: "",
            className:
                "w-8 rounded-lg h-8 p-2 bg-amber-500 hover:bg-amber-600 text-white",
            tooltip: "Edit",
            permission: "edit-section",
        },
        {
            key: "delete",
            label: "Delete",
            icon: "Trash2" as const,
            route: "",
            className:
                "w-8 rounded-lg h-8 p-2 bg-red-500 hover:bg-red-600 text-white",
            tooltip: "Delete",
            permission: "delete-section",
        },
    ],
};
