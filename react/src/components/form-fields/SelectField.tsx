/* eslint-disable @typescript-eslint/no-explicit-any */
import { Label } from "../ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import type { SelectFieldProps } from "./interfaces";

interface FieldOptions {
    key: string;
    label: string;
    value: string;
}

export function SelectField({
    id,
    name,
    label,
    value,
    options,
    selectLabel,
    extraData,
    onValueChange,
    readOnly,
    errors,
    mode,
}: SelectFieldProps) {
    const fieldKey = name; // Using name as the key for extraData lookup

    const selectOptions = options?.length
        ? [...options].sort((a, b) => a.label.localeCompare(b.label))
        : (extraData?.[fieldKey] || [])
            .map((item: any) => ({
                key: item.id,
                value: item.name,
                label: item.label || item.en_label || item.name,
            }))
            .sort((a: FieldOptions, b: FieldOptions) => a.label.localeCompare(b.label));
    return (
        <div className="grid gap-2">
            <Label htmlFor={id} className="font-medium">
                {label}
            </Label>
            <Select
                name={name}
                value={value}
                onValueChange={onValueChange}
                disabled={readOnly}
            >
                <SelectTrigger className={mode === "view" ? "bg-yellow-100/70 border-yellow-300 text-yellow-900" : "bg-white/70 border-cyan-300 text-cyan-900"}>
                    <SelectValue placeholder={`Select ${selectLabel}`} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>{selectLabel}</SelectLabel>
                        {selectOptions.map((opt: FieldOptions) => (
                            <SelectItem key={opt.key} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            {errors?.[0] && (
                <p className="text-sm text-red-600">{errors[0]}</p>
            )}
        </div>
    );
}