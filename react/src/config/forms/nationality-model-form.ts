/* eslint-disable @typescript-eslint/no-explicit-any */
import { CirclePlusIcon } from "lucide-react";
import api from "../../axios";
import { toast } from "../../hooks/use-toast";

export const NationalitiesModelFormConfig = {
  moduleTitle: "Manage Nationalities",
  title: "Create Nationalities",
  description: "Fill in details below to create a new Nationality",

  addButton: {
    id: "add-nationality",
    key: "add-nationality",
    label: "Add new Nationality",
    className:
      "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl",
    icon: CirclePlusIcon,
    type: "button" as const,
    variant: "default" as const,
    permission: "create-nationality" as const,
  },
  fields: [
    {
      id: "iso_code_3",
      key: "iso_code_3",
      name: "iso_code_3",
      label: "ISO Code (3):",
      type: "text" as const,
      placeholder: "Enter ISO Code with (3) Characters",
      tabIndex: 1,
    },
    {
      id: "en_nationality",
      key: "en_nationality",
      name: "en_nationality",
      label: "Nationality (EN):",
      type: "text" as const,
      placeholder: "Enter Nationality in English",
      tabIndex: 2,
    },
    {
      id: "ar_nationality",
      key: "ar_nationality",
      name: "ar_nationality",
      label: "Nationality (AR):",
      type: "text" as const,
      placeholder: "ادخل الجنسية بالعربية",
      tabIndex: 3,
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
        response = await api.put(`/api/nationalities/edit/${id}`, data);
      } else {
        response = await api.post("/api/nationalities/create", data);
      }

      toast({
        title: "Success",
        description:
          response.data?.message || "Nationality saved successfully.",
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
