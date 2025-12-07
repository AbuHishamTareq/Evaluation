/* eslint-disable @typescript-eslint/no-explicit-any */
import { CirclePlusIcon } from "lucide-react";

export const EmployeesModelFormConfig = {
  moduleTitle: "Manage Employees",
  title: "Create Employees",
  description: "Fill in details below to create a new Employee",

  addButton: {
    id: "add-employee",
    key: "add-employee",
    label: "Add new Employee",
    className:
      "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl",
    icon: CirclePlusIcon,
    type: "button" as const,
    variant: "default" as const,
    permission: "create-employee" as const,
  },
};
