/* eslint-disable @typescript-eslint/no-explicit-any */
import { CirclePlusIcon } from "lucide-react";
import api from "../../axios";
import { toast } from "../../hooks/use-toast";

export const MedicationsModelFormConfig = {
    moduleTitle: "Manage Medications",
    title: "Create Medication",
    description: "Fill in details below to create a new Medication",

    addButton: {
        id: "add-medication",
        key: "add-medication",
        label: "Create Medication",
        className:
            "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl",
        icon: CirclePlusIcon,
        type: "button" as const,
        variant: "default" as const,
        permission: "create-medication" as const,
    },
    fields: [
        {
            id: "drug_name",
            key: "drug_name",
            name: "drug_name",
            label: "Drug Name",
            type: "text" as const,
            placeholder: "Enter Drug Name",
            tabIndex: 1,
            autoFocus: true,
        },
        {
            id: "allocation",
            key: "allocation", // 👈 update key
            name: "allocation", // 👈 update name
            label: "Allocation",
            type: "text" as const,
            placeholder: "Enter Allcoation",
            tabIndex: 2,
        },
        {
            id: "standard_quantity",
            key: "standard_quantity", // 👈 update key
            name: "standard_quantity", // 👈 update name
            label: "Standard Quantity",
            type: "number" as const,
            tabIndex: 2,
        },
        {
            id: "section",
            key: "section", // 👈 update key    
            name: "section", // 👈 update name
            label: "Section List",
            selectLabel: "Sections",
            type: "select" as const,
            tabIndex: 3,
            optionsKey: "section",
        },
        {
            id: "domain",
            key: "domain", // 👈 update key    
            name: "domain", // 👈 update name
            label: "Domain List",
            selectLabel: "Domais",
            type: "select" as const,
            tabIndex: 3,
            optionsKey: "domain",
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
                response = await api.put(`/api/medications/edit/${id}`, data);
            } else {
                response = await api.post("/api/medications/create", data);
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
