/* eslint-disable @typescript-eslint/no-explicit-any */
import { CirclePlusIcon } from "lucide-react";
import api from "../../axios";
import { toast } from "../../hooks/use-toast";

export const QuestionsModelFormConfig = {
    moduleTitle: "Manage Questions",
    title: "Create Question",
    description: "Fill in details below to create a new question",

    addButton: {
        id: "add-question",
        key: "add-question",
        label: "Create Question",
        className:
            "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl",
        icon: CirclePlusIcon,
        type: "button" as const,
        variant: "default" as const,
        permission: "create-question" as const,
    },
    fields: [
        {
            id: "label",
            key: "label",
            name: "label",
            label: "Question (EN):",
            type: "text" as const,
            placeholder: "Enter question (English)",
            autocomplete: "label",
            tabIndex: 1,
        },
        {
            id: "en-extra-label",
            key: "en_extra_label",
            name: "en_extra_label",
            label: (
                <>
                    Additional Text For The Question (EN){" "}
                    <span className="text-purple-600 font-semibold">(Optional)</span>:
                </>
            ),
            type: "text" as const,
            placeholder: "Enter the additional text (English)",
            autocomplete: "en_extra_label",
            tabIndex: 2,
        },
        {
            id: "ar-label",
            key: "ar_label",
            name: "ar_label",
            label: "Question (AR):",
            type: "text" as const,
            placeholder: "ادخل نص السؤال (بالعربية)",
            autocomplete: "ar_label",
            tabIndex: 3,
            isArabic: true,
        },
        {
            id: "ar-extra-label",
            key: "ar_extra_label",
            name: "ar_extra_label",
            label: (
                <>
                    Additional Text For The Question (AR){" "}
                    <span className="text-purple-600 font-semibold">(Optional)</span>:
                </>
            ),
            type: "text" as const,
            placeholder: "فضلاً، أدخِل النص الإضافي للسؤال (بالعربية)",
            autocomplete: "ar_extra_label",
            tabIndex: 4,
            isArabic: true,
        },
        {
            id: "domain",
            key: "domain",
            name: "domain",
            label: "Domains List:",
            selectLabel: "Domains",
            type: "select-with-search" as const,
            tabIndex: 3,
            optionsKey: "domain",
        },
        {
            id: "type",
            key: "type",
            name: "type",
            label: "Question Type:",
            selectLabel: "Question Type",
            type: "select" as const,
            tabIndex: 5,
            options: [
                { label: "Text", value: "text", key: "text" },
                { label: "Number", value: "number", key: "number" },
                { label: "Select", value: "select", key: "select" },
                { label: "Rating", value: "rating", key: "rating" },
                { label: "Textarea", value: "textarea", key: "textarea" },
                { label: "Radio", value: "radio", key: "radio" },
                { label: "Checkbox", value: "checkbox", key: "checkbox" },
            ],
        },
        {
            id: "options",
            key: "options",
            name: "options",
            label: "Options:",
            type: "options" as const,
            tabIndex: 6,
            conditionalDisplay: ["select", "radio", "checkbox", "rating"],
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
                response = await api.put(`/api/questions/edit/${id}`, data);
            } else {
                response = await api.post("/api/questions/create", data);
            }

            toast({
                title: "Success",
                description:
                    response.data?.message || "Question saved successfully.",
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
