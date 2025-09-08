/* eslint-disable @typescript-eslint/no-explicit-any */
import { CirclePlusIcon } from "lucide-react";
import api from "../../axios";
import { toast } from "../../hooks/use-toast";

export const DomainsModelFormConfig = {
    moduleTitle: "Manage Domain",
    title: "Create Domain",
    description: "Fill in details below to create a new domain",

    addButton: {
        id: "add-domain",
        key: "add-domain",
        label: "Create Domain",
        className:
            "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl",
        icon: CirclePlusIcon,
        type: "button" as const,
        variant: "default" as const,
        permission: "create-domain" as const,
    },
    fields: [
        {
            id: "label",
            key: "label",
            name: "label",
            label: "Domain Name (EN):",
            type: "text" as const,
            placeholder: "Enter domain name (English)",
            autocomplete: "label",
            tabIndex: 1,
            autoFocus: true,
        },
        {
            id: "ar_label",
            key: "ar_label",
            name: "ar_label",
            label: "Domain Name (AR):",
            type: "text" as const,
            placeholder: "ادخل المجال (بالعربية)",
            autocomplete: "ar_label",
            tabIndex: 2,
            isArabic: true
        },
        {
            id: "section",
            key: "section",
            name: "section",
            label: "Sections List",
            selectLabel: "Sections",
            type: "select" as const,
            tabIndex: 3,
            optionsKey: "section",
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
        mode: "create" | "edit" | "view",
        id?: number,
        setErrors?: (errors: Record<string, string[]>) => void
    ) => {
        try {
            let response;
            if (mode === "edit" && id) {
                response = await api.put(`/api/domains/edit/${id}`, data);
            } else {
                response = await api.post("/api/domains/create", data);
            }

            toast({
                title: "Success",
                description:
                    response.data?.message || "Center saved successfully.",
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
