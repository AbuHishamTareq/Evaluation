/* eslint-disable @typescript-eslint/no-explicit-any */
import { CirclePlusIcon } from "lucide-react";
import api from "../../axios";
import { toast } from "../../hooks/use-toast";

export const CentersModelFormConfig = {
    moduleTitle: "Manage Primary Health Care",
    title: "Create PHC",
    description: "Fill in details below to create a new Primary Health Care",

    addButton: {
        id: "add-center",
        key: "add-center",
        label: "Create PHC",
        className:
            "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl",
        icon: CirclePlusIcon,
        type: "button" as const,
        variant: "default" as const,
        permission: "create-center" as const,
    },
    fields: [
        {
            id: "center-name",
            key: "label",
            name: "label",
            label: "PHC Name",
            type: "text" as const,
            placeholder: "Enter Phc name",
            autocomplete: "name",
            tabIndex: 1,
            autoFocus: true,
        },
        {
            id: "phc-moh-code",
            key: "phc_moh_code", // 👈 update key
            name: "phc_moh_code", // 👈 update name
            label: "PHC Code",
            type: "text" as const,
            placeholder: "Enter Phc Code",
            autocomplete: "phc_moh_code",
            tabIndex: 2,
        },
        {
            id: "zone",
            key: "zone", // 👈 update key    
            name: "zone", // 👈 update name
            label: "Zones List",
            selectLabel: "Zones",
            type: "select" as const,
            tabIndex: 3,
            optionsKey: "zone", // still use elts because that's where the list lives
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
                response = await api.put(`/api/centers/edit/${id}`, data);
            } else {
                response = await api.post("/api/centers/create", data);
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
