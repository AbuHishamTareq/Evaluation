/* eslint-disable @typescript-eslint/no-explicit-any */
import { CirclePlusIcon } from "lucide-react";
import api from "../../axios";
import { toast } from "../../hooks/use-toast";

export const PermissionModelFormConfig = {
  moduleTitle: "Manage Permissions",
  title: "Create Permissions",
  description: "Fill in details below to create a new permission",

  addButton: {
    id: "add-permission",
    key: "add-permission",
    label: "Create Permission",
    className:
      "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl",
    icon: CirclePlusIcon,
    type: "button" as const,
    variant: "default" as const,
    permission: "create-permission",
  },

  fields: [
    {
      id: "module",
      key: "module",
      name: "module",
      label: "Module Name",
      selectLabel: "Module",
      type: "select" as const,
      tabIndex: 1,
      autoFocus: true,
      options: [
        { label: "Users", value: "users", key: "users" },
        { label: "Surveys", value: "surveys", key: "surveys" },
        { label: "Centers", value: "centers", key: "centers" },
        { label: "Questions", value: "questions", key: "questions" },
        { label: "Domains", value: "domains", key: "domains" },
        { label: "Roles", value: "roles", key: "roles" },
        { label: "Tbcs", value: "tbcs", key: "tbcs" },
        { label: "Permissions", value: "permissions", key: "permissions" },
        { label: "Elts", value: "elts", key: "elts" },
        { label: "Zones", value: "zones", key: "zones" },
        { label: "Sections", value: "sections", key: "sections" },
        { label: "Medications", value: "medications", key: "medications" },
        { label: "Headers", value: "headers", key: "headers" },
        { label: "Feilds", value: "feilds", key: "feilds" },
        {
          label: "Nationalities",
          value: "nationalities",
          key: "nationalities",
        },
        { label: "Healthcare Sectors", value: "sectors", key: "sectors" },
        {
          label: "Healthcare Specialties",
          value: "specialties",
          key: "specialties",
        },
        { label: "Healthcare Ranks", value: "ranks", key: "ranks" },
        {
          label: "Saudi Health Council Category",
          value: "categories",
          key: "categories",
        },
        { label: "Employee", value: "employee", key: "employee" },
        { label: "Departments", value: "departments", key: "departments" },
        { label: "Clinics", value: "clinics", key: "clinics" },
      ],
    },
    {
      id: "permission-label",
      key: "label",
      name: "label",
      label: "Permission (ex. Create User)",
      type: "text" as const,
      placeholder: "Enter Permission",
      autocomplete: "label",
      tabIndex: 2,
    },
    {
      id: "permission-description",
      key: "description",
      name: "description",
      label: "Description",
      type: "textarea" as const,
      placeholder: "Enter Permission Description",
      autocomplete: "description",
      tabIndex: 3,
      rows: 2,
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
        response = await api.put(`/api/permissions/edit/${id}`, data);
      } else {
        response = await api.post("/api/permissions/create", data);
      }

      toast({
        title: "Success",
        description: response.data?.message || "Permission saved successfully.",
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
