/* eslint-disable @typescript-eslint/no-explicit-any */
import { CirclePlusIcon } from "lucide-react";
import api from "../../axios";
import { toast } from "../../hooks/use-toast";

export const EvaluationsModelFormConfig = {
    moduleTitle: "Manage Evaluations",
    title: "Create Evaluation",
    description: "Fill in details below to create a new question",

    addButton: {
        id: "add-evaluation",
        key: "add-evaluation",
        label: "Create Evaluation",
        className:
            "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl",
        icon: CirclePlusIcon,
        type: "button" as const,
        variant: "default" as const,
        permission: "create-evaluation" as const,
    },
    fields: [
        {
            id: "title",
            key: "title",
            name: "title",
            label: "Evaluation Subject (EN):",
            type: "text" as const,
            placeholder: "Enter Evaluation Subject (English)",
            autocomplete: "title",
            tabIndex: 1,
        },
        {
            id: "ar-label",
            key: "ar_label",
            name: "ar_label",
            label: "Evaluation Subject (AR):",
            type: "text" as const,
            placeholder: "ادخل عنوان التقييم (بالعربية)",
            autocomplete: "ar_label",
            tabIndex: 2,
            isArabic: true,
        },
        {
            id: "en-description",
            key: "en_description",
            name: "en_description",
            label: "Evaluation Description (EN):",
            type: "textarea" as const,
            placeholder: "Evaluation Description (English)",
            tabIndex: 3,
        },
        {
            id: "ar-description",
            key: "ar_description",
            name: "ar_description",
            label: "Evaluation Description (AR):",
            type: "textarea" as const,
            placeholder: "وصف التقييم (العربية)",
            tabIndex: 4,
            isArabic: true,
        },
        {
            id: "section",
            key: "section",
            name: "section",
            label: "Sections List:",
            selectLabel: "Sections",
            type: "select-with-search" as const,
            tabIndex: 5,
            optionsKey: "section",
        },
        {
            id: "role",
            key: "role",
            name: "role",
            label: "Roles List:",
            selectLabel: "Roles",
            type: "multi-select" as const,
            tabIndex: 6,
            optionsKey: "role",
        },
        {
            id: "image",
            key: "image",
            name: "image",
            label: "Evaluation Image:",
            type: "file" as const,
            tabIndex: 7,
            accept: "image/*",
            maxSize: 5,
            placeholder: "Choose an image for this evaluation...",
            showPreview: true,
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

            // Prepare form data for submission
            const formData = { ...data };

            if (mode === "edit" && id) {
                response = await api.put(`/api/evaluations/edit/${id}`, formData);
            } else {
                response = await api.post("/api/evaluations/create", formData);
            }

            toast({
                title: "Success",
                description:
                    response.data?.message || "Evaluation saved successfully.",
                backgroundColor: "bg-green-600",
                color: "text-white",
                variant: "default",
            });
        } catch (error: any) {
            const status = error.response?.status;
            const serverMessage = error.response?.data?.message;

            if (status === 422 && setErrors) {
                // Validation error (e.g., missing fields)
                setErrors(error.response.data.errors);
            } else {
                // Show custom error message from server
                toast({
                    title: "Error",
                    description: serverMessage || "An unexpected error occurred.",
                    backgroundColor: "bg-red-600",
                    color: "text-white",
                    variant: "destructive",
                });
            }

            throw error; // Prevent closing modal
        }
    },
};