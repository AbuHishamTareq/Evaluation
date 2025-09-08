/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ChangeEvent, type ReactNode } from "react";

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

export interface BaseFieldProps {
    id: string;
    name: string;
    label?: string | ReactNode;
    value: any;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    readOnly: boolean;
    errors: string[];
}

export interface TextFieldProps extends BaseFieldProps {
    type: "text" | "number" | "date" | "password" | "email";
    placeholder?: string;
    autocomplete?: string;
    tabIndex?: number;
    autoFocus?: boolean;
    mode?: "view" | "edit" | "create" | "assign";
    isArabic?: boolean;
}

export interface TextareaFieldProps extends BaseFieldProps {
    rows?: number;
    placeholder?: string;
    autocomplete?: string;
    tabIndex?: number;
    mode?: "view" | "edit" | "create" | "assign";
    isArabic?: boolean;
}

export interface SelectFieldProps extends BaseFieldProps {
    options?: { value: string; label: string; key: string }[];
    selectLabel?: string;
    extraData?: ExtraDataProps;
    onValueChange: (value: string) => void;
    optionsKey?: string;
    mode?: "view" | "edit" | "create" | "assign";
}

export interface RadioGroupFieldProps extends BaseFieldProps {
    options: { value: string; label: string }[];
}

export interface CheckboxFieldProps extends BaseFieldProps {
    checked: boolean;
}

export interface GroupedCheckboxFieldProps extends BaseFieldProps {
    extraData?: ExtraDataProps;
    setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
}