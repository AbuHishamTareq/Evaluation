/* eslint-disable @typescript-eslint/no-explicit-any */
import { CirclePlusIcon } from "lucide-react";
import api from "../../axios";
import { toast } from "../../hooks/use-toast";

export const ZonesModelFormConfig = {
    moduleTitle: "Manage Zones",
    title: "Create Zone",
    description: "Fill in details below to create a new zone",

    addButton: {
        id: "add-zone",
        key: "add-zone",
        label: "Create Zone",
        className:
            "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl",
        icon: CirclePlusIcon,
        type: "button" as const,
        variant: "default" as const,
        permission: "create-zone" as const,
    },
    fields: [
        {
            id: "zone-name",
            key: "label",
            name: "label",
            label: "Zone Name",
            type: "text" as const,
            placeholder: "Enter Zone name",
            autocomplete: "name",
            tabIndex: 1,
            autoFocus: true,
        },
        {
            id: "elt",
            key: "elt",
            name: "elt",
            label: "Elts List",
            selectLabel: "Elts",
            type: "select" as const,
            tabIndex: 2,
            options: [],
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
                response = await api.put(`/api/zones/edit/${id}`, data);
            } else {
                response = await api.post("/api/zones/create", data);
            }

            toast({
                title: "Success",
                description:
                    response.data?.message || "Zone saved successfully.",
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
