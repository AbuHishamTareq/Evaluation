/* eslint-disable @typescript-eslint/no-explicit-any */
import { CirclePlusIcon } from "lucide-react";
import api from "../../axios";
import { toast } from "../../hooks/use-toast";

export const RoleModelFormConfig = {
    moduleTitle: "Manage Roles",
    title: "Create Roles",
    description: "Fill in details below to create a new role",

    addButton: {
        id: "add-role",
        key: "add-role",
        label: "Create Role",
        className:
            "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl",
        icon: CirclePlusIcon,
        type: "button" as const,
        variant: "default" as const,
        permission: 'create-role'
    },

    fields: [
        {
            id: "role-label",
            key: "label",
            name: "label",
            label: "Role (ex. Super Admin)",
            type: "text" as const,
            placeholder: "Enter Role",
            autocomplete: "label",
            tabIndex: 1,
            autoFocus: true
        },
        {
            id: "role-description",
            key: "description",
            name: "description",
            label: "Description",
            type: "textarea" as const,
            placeholder: "Enter Role Description",
            autocomplete: "description",
            tabIndex: 2,
            rows: 2,
        },
        {
            id: "permissions",
            key: "permissions",
            name: "permissions",
            label: "Permissions:",
            type: "grouped-checkboxes" as const,
            tabIndex: 3,
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
                response = await api.put(`/api/roles/edit/${id}`, data);
            } else {
                response = await api.post("/api/roles/create", data);
            }

            toast({
                title: "Success",
                description: response.data?.message || "Role saved successfully.",
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
