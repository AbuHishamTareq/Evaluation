/* eslint-disable @typescript-eslint/no-explicit-any */
import { CirclePlusIcon } from "lucide-react";
import api from "../../axios";
import { toast } from "../../hooks/use-toast";

export const DepartmentsModelFormConfig = {
  moduleTitle: "Manage Department",
  title: "Create Department",
  description: "Fill in details below to create a new department",

  addButton: {
    id: "add-department",
    key: "add-department",
    label: "Create new department",
    className:
      "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl",
    icon: CirclePlusIcon,
    type: "button" as const,
    variant: "default" as const,
    permission: "create-department" as const,
  },
  fields: [
    {
      id: "en_department",
      key: "en_department",
      name: "en_department",
      label: "Department Name (EN):",
      type: "text" as const,
      placeholder: "Enter Department in English",
      tabIndex: 1,
    },
    {
      id: "ar_department",
      key: "ar_department",
      name: "ar_department",
      label: "Department Name (AR):",
      type: "text" as const,
      placeholder: "ادخل اسم القسم بالعربية",
      tabIndex: 2,
      isArabic: true,
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
        response = await api.put(`/api/departments/edit/${id}`, data);
      } else {
        response = await api.post("/api/departments/create", data);
      }

      toast({
        title: "Success",
        description: response.data?.message || "Department saved successfully.",
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
            error.response?.data?.message || "An unexpected error occurred.",
          backgroundColor: "bg-red-600",
          color: "text-white",
          variant: "destructive",
        });
      }
      throw error; // prevents modal from closing
    }
  },
};
