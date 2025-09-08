import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { TextFieldProps } from "./interfaces";

export function TextField({
    id,
    name,
    label,
    type,
    value,
    onChange,
    placeholder,
    autocomplete,
    tabIndex,
    autoFocus,
    readOnly,
    errors,
    mode,
    isArabic = false,
}: TextFieldProps) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id} className="font-medium">
                {label}
            </Label>
            <Input
                id={id}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autocomplete}
                tabIndex={tabIndex}
                autoFocus={autoFocus}
                disabled={readOnly}
                dir={isArabic ? "rtl" : "ltr"}
                className={mode === "view" ? "bg-yellow-100/70 border-yellow-300 text-yellow-900" : "bg-white/70 border-cyan-300 text-cyan-900"}
            />
            {errors?.[0] && (
                <p className="text-sm text-red-600">{errors[0]}</p>
            )}
        </div>
    );
}