/* eslint-disable @typescript-eslint/no-explicit-any */
import type { badgeVariants } from "../components/ui/badge";
import type { buttonVariants } from "../components/ui/button";
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import * as ToastPrimitives from "@radix-ui/react-toast";
import type { ToastActionElement, ToastProps } from "../components/ui/toast";
import type { LucideIcon } from "lucide-react";

type Language = "en" | "ar";
type Role = string;
type Permission = string;

export type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  backgroundColor: string;
  color: string;
};

export interface Question {
  id: string;
  type:
    | "text"
    | "email"
    | "select"
    | "radio"
    | "textarea"
    | "rating"
    | "number";
  label: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  conditional?: {
    dependsOn: string;
    value: string;
  };
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface FormData {
  centerId: string;
  [key: string]: unknown;
}

// Interface for Center ID form values
export interface CenterIdFormValues {
  centerId: string;
}

// Interface for form step values (extends FormData for type safety)
export interface StepFormValues extends FormData {
  [key: string]: string | number | boolean | undefined;
}

// Interface for RatingField props
export interface RatingFieldProps {
  name: string;
  label: string;
  value: number;
  onChange: (name: string, value: number) => void;
}

// Interface for QuestionRenderer props
export interface QuestionRendererProps {
  question: Question;
  formik: import("formik").FormikProps<FormData>;
  shouldShow?: boolean;
}

export interface LoginResponse {
  user: UserInfo; // Replace with your actual UserInfo type
  token: string;
}

export interface ErrorResponseData {
  error?: string;
}

export interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export interface HeaderProps {
  title: string;
  children: ReactNode;
}

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ExtendedToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>,
    VariantProps<typeof toastVariants> {
  backgroundColor?: string; // optional Tailwind class like 'bg-green-500'
  color?: string;
}

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  permissions: Permission[];
  roles: Role[];
  center_id: string;
  status: string;
}

export interface AppContextType {
  user: UserInfo | null;
  setUser: (user: UserInfo | null) => void;
  refresh: () => void;
  fetchUser: () => Promise<void>;
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
  loading: boolean;
}

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export interface State {
  toasts: ToasterToast[];
}

export interface AppProviderProps {
  children: ReactNode;
}

export interface LanguageProviderProps {
  children: ReactNode;
}

// Product data for the product survey step
export const products = [
  {
    id: "prod-001",
    name: "Wireless Headphones",
  },
  {
    id: "prod-002",
    name: "Office Chair",
  },
  {
    id: "prod-003",
    name: "Coffee Machine",
  },
  {
    id: "prod-004",
    name: "Laptop Stand",
  },
  {
    id: "prod-005",
    name: "Desk Lamp",
  },
  {
    id: "prod-006",
    name: "Desk Lamp",
  },
  {
    id: "prod-007",
    name: "Desk Lamp",
  },
  {
    id: "prod-008",
    name: "Desk Lamp",
  },
  {
    id: "prod-009",
    name: "Desk Lamp",
  },
  {
    id: "prod-010",
    name: "Desk Lamp",
  },
];

export const availabilityOptions = [
  { value: "available", label: "Available" },
  { value: "partially-available", label: "Partially Available" },
  { value: "not-available", label: "Not Available" },
];

export interface CreateButtonProps {
  onClick?: () => void;
  label?: string;
  icon?: LucideIcon;
  variant?: "create" | "edit" | "delete" | "custom" | "view" | "assign";
  backgroundColor?: string;
  hoverColor?: string;
  className?: string;
  disabled?: boolean;
  tooltip?: string;
}

export interface AddButtonProps {
  id: string;
  key?: string;
  label: string;
  className?: string;
  icon?: any;
  type: "button" | "submit" | "reset" | undefined;
  variant: "default" | "outline" | "ghost" | "link" | "destructive" | undefined;
  permission?: string;
}

export interface FieldsProps {
  value: any;
  id: string;
  key?: string;
  name: string;
  label?: string | ReactNode;
  type:
    | "text"
    | "textarea"
    | "select"
    | "checkbox"
    | "radio"
    | "number"
    | "date"
    | "grouped-checkboxes"
    | "password"
    | "email"
    | "options"
    | "multi-select-team-codes"
    | "section-select"
    | "select-with-search"
    | "multi-select"
    | "file";
  placeholder?: string;
  autocomplete?: string;
  tabIndex?: number;
  autoFocus?: boolean;
  rows?: number;
  options?: { value: string; label: string; key: string }[];
  selectLabel?: string;
  optionsKey?: string;
  conditionalDisplay?: string[];
  isArabic?: boolean;
  accept?: string;
  maxSize?: number;
  showPreview?: boolean;
}

export interface ButtonProps {
  key?: string | number;
  id?: string;
  type?: "button" | "submit" | "reset" | undefined;
  label?: string;
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "link"
    | "destructive"
    | "secondary"
    | undefined;
  className?: string | undefined;
}

export interface Permissions {
  id: number;
  label: string;
  name: string;
  module: string;
  description: string;
}

export interface ExtraDataProps {
  [module: string]: Permissions[];
}

export interface CustomModelFormProps {
  addButton: AddButtonProps;
  title: string;
  description: string;
  fields: FieldsProps[];
  buttons: ButtonProps[];
  onSubmit: (
    data: Record<string, any>,
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string[]>>>
  ) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Record<string, any>;
  readOnly?: boolean;
  mode?: "create" | "edit" | "view" | "assign";
  value?: any;
  extraData?: ExtraDataProps;
}
