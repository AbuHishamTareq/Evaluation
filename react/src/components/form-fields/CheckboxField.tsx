import { Label } from "../ui/label";
import type { CheckboxFieldProps } from "./interfaces";

export function CheckboxField({
    id,
    name,
    label,
    checked,
    onChange,
    readOnly,
    errors,
}: CheckboxFieldProps) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id} className="font-medium">
                {label}
            </Label>
            <input
                type="checkbox"
                id={id}
                name={name}
                checked={checked}
                onChange={onChange}
                disabled={readOnly}
            />
            {errors?.[0] && (
                <p className="text-sm text-red-600">{errors[0]}</p>
            )}
        </div>
    );
}