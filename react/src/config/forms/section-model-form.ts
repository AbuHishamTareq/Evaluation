/* eslint-disable @typescript-eslint/no-explicit-any */
import { CirclePlusIcon } from "lucide-react";
import api from "../../axios";
import { toast } from "../../hooks/use-toast";

export const SectionsModelFormConfig = {
    moduleTitle: "Manage Sections",
    title: "Create Section",
    description: "Fill in details below to create a new Section",

    addButton: {
        id: "add-section",
        key: "add-section",
        label: "Create Section",
        className:
            "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl",
        icon: CirclePlusIcon,
        type: "button" as const,
        variant: "default" as const,
        permission: "create-section" as const,
    },
    fields: [
        {
            id: "en-label",
            key: "en_label",
            name: "en_label",
            label: "Section Name (EN):",
            type: "text" as const,
            placeholder: "Enter section name (English)",
            autocomplete: "en_label",
            tabIndex: 1,
        },
        {
            id: "ar-label",
            key: "ar_label",
            name: "ar_label",
            label: "Section Name (AR):",
            type: "text" as const,
            placeholder: "ادخل اسم القسم (بالعربية)",
            autocomplete: "ar_label",
            tabIndex: 2,
            isArabic: true,
        },
        {
            id: "type",
            key: "type",
            name: "type",
            label: "Evaluation Type",
            selectLabel: "Evaluation Type",
            type: "select" as const,
            tabIndex: 3,
            options: [
                { label: "Regular Evaluation", value: "regular", key: "regular" },
                { label: "Tabular Evaluation", value: "tabular", key: "tabular" },
            ],
        },
    ],

    buttons: [
        {
            key: "submit",
            id: "submit",
            type: "submit" as const,
            label: "Save Changes",
            variant: "default" as const,
            className:
                "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl",
        },
    ],

    // ⬇️ Enhanced onSubmit function with validation error handling
    onSubmit: async (
        data: Record<string, any>,
        mode: "create" | "edit" | "view" | "assign",
        id?: number,
        setErrors?: (errors: Record<string, string[]>) => void
    ) => {
        try {
            let response;

            if (mode === "edit" && id) {
                response = await api.put(`/api/sections/edit/${id}`, data);
            } else {
                response = await api.post("/api/sections/create", data);
            }

            toast({
                title: "Success",
                description:
                    response.data?.message || "Section saved successfully.",
                backgroundColor: "bg-green-600",
                color: "text-white",
                variant: "default",
            });
        } catch (error: any) {
            if (error.response?.status === 422 && setErrors) {
                setErrors(error.response.data.errors);
            } else {
                toast({
                    title: "Error",
                    description:
                        error.response?.data?.message ||
                        "An unexpected error occurred.",
                    backgroundColor: "bg-red-600",
                    color: "text-white",
                    variant: "destructive",
                });
            }
            throw error; // prevents modal from closing
        }
    },
};
