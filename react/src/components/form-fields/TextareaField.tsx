import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import type { TextareaFieldProps } from "./interfaces";

export function TextareaField({
    id,
    name,
    label,
    value,
    onChange,
    rows,
    placeholder,
    autocomplete,
    tabIndex,
    readOnly,
    errors,
    mode,
    isArabic
}: TextareaFieldProps) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id} className="font-medium">
                {label}
            </Label>
            <Textarea
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                rows={rows}
                placeholder={placeholder}
                autoComplete={autocomplete}
                tabIndex={tabIndex}
                disabled={readOnly}
                dir={isArabic ? 'rtl' : 'ltr'}
                className={mode === "view" ? "bg-yellow-100/70 border-yellow-300 text-yellow-900" : "bg-white/70 border-cyan-300 text-cyan-900"}
            />
            {errors?.[0] && (
                <p className="text-sm text-red-600">{errors[0]}</p>
            )}
        </div>
    );
}