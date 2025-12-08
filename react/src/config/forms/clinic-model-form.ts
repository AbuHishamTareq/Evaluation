/* eslint-disable @typescript-eslint/no-explicit-any */
import { CirclePlusIcon } from "lucide-react";
import api from "../../axios";
import { toast } from "../../hooks/use-toast";

export const ClinicsModelFormConfig = {
  moduleTitle: "Manage Clinic",
  title: "Create Clinic",
  description: "Fill in details below to create a new clinic",

  addButton: {
    id: "add-clinic",
    key: "add-clinic",
    label: "Create new clinic",
    className:
      "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl",
    icon: CirclePlusIcon,
    type: "button" as const,
    variant: "default" as const,
    permission: "create-clinic" as const,
  },
  fields: [
    {
      id: "en_clinic",
      key: "en_clinic",
      name: "en_clinic",
      label: "Clinic Name (EN):",
      type: "text" as const,
      placeholder: "Enter Clinic in English",
      tabIndex: 1,
    },
    {
      id: "ar_clinic",
      key: "ar_clinic",
      name: "ar_clinic",
      label: "Clinic Name (AR):",
      type: "text" as const,
      placeholder: "ادخل اسم العيادة بالعربية",
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
        response = await api.put(`/api/clinics/edit/${id}`, data);
      } else {
        response = await api.post("/api/clinics/create", data);
      }

      toast({
        title: "Success",
        description: response.data?.message || "Clinic saved successfully.",
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
