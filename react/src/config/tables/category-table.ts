export const CategoriesTableConfig = {
  columns: [
    {
      key: "en_sector",
      label: "Healthcare Field",
      sortable: true,
      className:
        "text-center px-6 py-4 text-left font-semibold text-sm tracking-wider hover: bg-black-600",
    },
    {
      key: "en_specialty",
      label: "Healthcare Specialty (EN)",
      sortable: true,
      className:
        "text-center px-6 py-4 text-left font-semibold text-sm tracking-wider hover: bg-black-600",
    },
    {
      key: "en_rank",
      label: "Healthcare Rank (EN)",
      sortable: true,
      className:
        "text-center px-6 py-4 text-left font-semibold text-sm tracking-wider hover: bg-black-600",
    },
    {
      key: "category",
      label: "Saudi Health Council Category",
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
      permission: "view-specialty",
    },
    {
      key: "edit",
      label: "Edit",
      icon: "Edit" as const,
      route: "",
      className:
        "w-8 rounded-lg h-8 p-2 bg-amber-500 hover:bg-amber-600 text-white",
      tooltip: "Edit",
      permission: "edit-specialty",
    },
    {
      key: "delete",
      label: "Delete",
      icon: "Trash2" as const,
      route: "",
      className:
        "w-8 rounded-lg h-8 p-2 bg-red-500 hover:bg-red-600 text-white",
      tooltip: "Delete",
      permission: "delete-specialty",
    },
  ],
};
