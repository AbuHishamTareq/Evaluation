/* eslint-disable @typescript-eslint/no-explicit-any */
import { CirclePlusIcon } from "lucide-react";
import api from "../../axios";
import { toast } from "../../hooks/use-toast";

export const CategoriesModelFormConfig = {
  moduleTitle: "Manage Saudi Health Council Categories",
  title: "Create Saudi Healrth Council Category",
  description:
    "Fill in details below to create a new Saudi Health Council Category",

  addButton: {
    id: "add-category",
    key: "add-category",
    label: "Add New Saudi Health Council Category",
    className:
      "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl",
    icon: CirclePlusIcon,
    type: "button" as const,
    variant: "default" as const,
    permission: "create-category" as const,
  },
  fields: [
    {
      id: "sector",
      key: "sector",
      name: "sector",
      label: "Healthcare Field List:",
      selectLabel: "Healthcare Field",
      type: "select" as const,
      tabIndex: 1,
      options: [],
    },
    {
      id: "specialty",
      key: "specialty",
      name: "specialty",
      label: "Healthcare Specialty List:",
      selectLabel: "Healthcare Specialty",
      type: "select" as const,
      tabIndex: 2,
      options: [],
    },
    {
      id: "rank",
      key: "rank",
      name: "rank",
      label: "Healthcare Rank List:",
      selectLabel: "Healthcare Rank",
      type: "select" as const,
      tabIndex: 3,
      options: [],
    },
    {
      id: "category",
      key: "category",
      name: "category",
      label: "Saudi Health Council Category:",
      type: "text" as const,
      placeholder: "Enetr Saudi Health Council Category",
      tabIndex: 4,
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
        response = await api.put(`/api/categories/edit/${id}`, data);
      } else {
        response = await api.post("/api/categories/create", data);
      }

      toast({
        title: "Success",
        description: response.data?.message || "Category saved successfully.",
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
