import { Label } from "../ui/label";
import type { RadioGroupFieldProps } from "./interfaces";

export function RadioGroupField({
    id,
    name,
    label,
    value,
    options,
    onChange,
    readOnly,
    errors,
}: RadioGroupFieldProps) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id} className="font-medium">
                {label}
            </Label>
            <div className="flex gap-4">
                {options?.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2">
                        <input
                            type="radio"
                            name={name}
                            value={opt.value}
                            checked={value === opt.value}
                            onChange={onChange}
                            disabled={readOnly}
                        />
                        {opt.label}
                    </label>
                ))}
            </div>
            {errors?.[0] && (
                <p className="text-sm text-red-600">{errors[0]}</p>
            )}
        </div>
    );
}