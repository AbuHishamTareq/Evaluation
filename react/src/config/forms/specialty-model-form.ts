/* eslint-disable @typescript-eslint/no-explicit-any */
import { CirclePlusIcon } from "lucide-react";
import api from "../../axios";
import { toast } from "../../hooks/use-toast";

export const SpecialtiesModelFormConfig = {
  moduleTitle: "Manage Healthcare Specialties",
  title: "Add New Healthcare Specialty",
  description: "Fill in details below to create a new healthcare specialty",

  addButton: {
    id: "add-specialty",
    key: "add-specialty",
    label: "Add New Healthcare Specialty",
    className:
      "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl",
    icon: CirclePlusIcon,
    type: "button" as const,
    variant: "default" as const,
    permission: "create-specialty" as const,
  },
  fields: [
    {
      id: "en_specialty",
      key: "en_specialty",
      name: "en_specialty",
      label: "Healthcare Specialty (EN):",
      type: "text" as const,
      placeholder: "Enter Healthcare Specialty in English",
      tabIndex: 1,
      autoFocus: true,
    },
    {
      id: "ar_specialty",
      key: "ar_specialty", // 👈 update key
      name: "ar_specialty", // 👈 update name
      label: "Healthcare Specialty (AR):",
      type: "text" as const,
      placeholder: "ادخل التخصص الصحي بالعربية",
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
        response = await api.put(`/api/specialties/edit/${id}`, data);
      } else {
        response = await api.post("/api/specialties/create", data);
      }

      toast({
        title: "Success",
        description: response.data?.message || "Specialty saved successfully.",
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
