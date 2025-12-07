/* eslint-disable @typescript-eslint/no-explicit-any */
import { CirclePlusIcon } from "lucide-react";
import api from "../../axios";
import { toast } from "../../hooks/use-toast";

export const RanksModelFormConfig = {
  moduleTitle: "Manage Healthcare Ranks",
  title: "Create Healthcare Rank",
  description: "Fill in details below to create a new rank",

  addButton: {
    id: "add-rank",
    key: "add-rank",
    label: "Add New Healthcare Rank",
    className:
      "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl",
    icon: CirclePlusIcon,
    type: "button" as const,
    variant: "default" as const,
    permission: "create-rank" as const,
  },
  fields: [
    {
      id: "en_rank",
      key: "en_rank",
      name: "en_rank",
      label: "Healthcare Rank (EN):",
      type: "text" as const,
      placeholder: "Enter Healthcare Rank in English",
      tabIndex: 3,
    },
    {
      id: "ar_rank",
      key: "ar_rank",
      name: "ar_rank",
      label: "Healthcare Rank (AR):",
      type: "text" as const,
      placeholder: "ادخل الرتبة الصحية باللغة العربية",
      tabIndex: 4,
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

      console.log("Submitting data:", data);

      if (mode === "edit" && id) {
        response = await api.put(`/api/ranks/edit/${id}`, data);
      } else {
        response = await api.post("/api/ranks/create", data);
      }

      toast({
        title: "Success",
        description: response.data?.message || "Rank saved successfully.",
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
