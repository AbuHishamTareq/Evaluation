/* eslint-disable @typescript-eslint/no-explicit-any */
import { CirclePlusIcon } from "lucide-react";
import api from "../../axios";
import { toast } from "../../hooks/use-toast";

export const TbcsModelFormConfig = {
    moduleTitle: "Manage Team Based Codes",
    title: "Create Team Based Code (TBC)",
    description: "Fill in details below to create a new Tbc",

    addButton: {
        id: "add-tbc",
        key: "add-tbc",
        label: "Create Team Based Code",
        className:
            "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl",
        icon: CirclePlusIcon,
        type: "button" as const,
        variant: "default" as const,
        permission: "create-tbc" as const,
    },
    fields: [
        {
            id: "tbc-code",
            key: "code",
            name: "code",
            label: "Team Based Code:",
            type: "text" as const,
            placeholder: "Enter Team Based Code",
            autocomplete: "code",
            tabIndex: 1,
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
                response = await api.put(`/api/tbcs/edit/${id}`, data);
            } else {
                response = await api.post("/api/tbcs/create", data);
            }

            toast({
                title: "Success",
                description:
                    response.data?.message || "Team Based Code saved successfully.",
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
