/* eslint-disable @typescript-eslint/no-explicit-any */
import { CirclePlusIcon } from "lucide-react";
import api from "../../axios";
import { toast } from "../../hooks/use-toast";

export const UsersModelFormConfig = {
    moduleTitle: "Manage Users",
    title: "Create Users",
    description: "Fill in details below to create a new user",

    addButton: {
        id: "add-user",
        key: "add-user",
        label: "Create User",
        className:
            "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl",
        icon: CirclePlusIcon,
        type: "button" as const,
        variant: "default" as const,
        permission: "create-user" as const
    },
    fields: [
        {
            id: "full-name",
            key: "name",
            name: "name",
            label: "Full Name:",
            type: "text" as const,
            placeholder: "Enter full name",
            autocomplete: "name",
            tabIndex: 1,
            autoFocus: true
        },
        {
            id: "email",
            key: "email",
            name: "email",
            label: "Email (ex. john@example.com):",
            type: "email" as const,
            placeholder: "Enter user email",
            autocomplete: "email",
            tabIndex: 2,
        },
        {
            id: "mobile",
            key: "mobile",
            name: "mobile",
            label: "Mobile Number:",
            type: "text" as const,
            placeholder: "Enter mobile number",
            autocomplete: "mobile",
            tabIndex: 3,
            autoFocus: true
        },
        {
            id: "password",
            key: "password",
            name: "password",
            label: "Password:",
            type: "password" as const,
            placeholder: "Enter user password",
            tabIndex: 4,
        },
        {
            id: "confirm-password",
            key: "confirm-password",
            name: "confirm_password",
            label: "Confirm Password:",
            type: "password" as const,
            placeholder: "Confirm user password",
            tabIndex: 5,
        },
        {
            id: "center",
            key: "center",
            name: "center",
            label: "Phc List:",
            selectLabel: "Phcs (Optional)",
            type: "select" as const,
            tabIndex: 6,
            options: [],
        },
        {
            id: "role",
            key: "role",
            name: "role",
            label: "Roles List:",
            selectLabel: "Roles",
            type: "select" as const,
            tabIndex: 7,
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
                response = await api.put(`/api/users/edit/${id}`, data);
            } else {
                response = await api.post("/api/users/create", data);
            }

            toast({
                title: "Success",
                description: response.data?.message || "User saved successfully.",
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
