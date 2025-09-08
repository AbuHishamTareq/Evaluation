/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
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
import { Search } from "lucide-react";
import type { SelectFieldProps } from "./interfaces";

interface FieldOptions {
    key: string;
    label: string;
    value: string;
}

export function SelectWithSearchField({
    id,
    name,
    label,
    value,
    selectLabel,
    extraData,
    onValueChange,
    readOnly = false,
    errors = [],
    mode,
}: SelectFieldProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredOptions, setFilteredOptions] = useState<FieldOptions[]>([]);

    // Fix: Ensure we're getting the correct field data
    // For domain field, we need to look for 'domain' key in extraData
    const fieldKey = name === 'domain' ? 'domain' : name;
    
    // Keep using item.name as value since domain_id references the 'name' column
    const baseOptions: FieldOptions[] = (extraData?.[fieldKey] || []).map((item: any) => ({
        key: item.id,
        value: item.name, // ✅ Correct - domain_id is a string that matches item.name
        label: item.label || item.name,
    })).sort((a, b) => a.label.localeCompare(b.label));

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredOptions(baseOptions);
        } else {
            const lower = searchTerm.toLowerCase();
            setFilteredOptions(
                baseOptions.filter((opt) =>
                    opt.label.toLowerCase().includes(lower) || opt.value.toLowerCase().includes(lower)
                )
            );
        }
    }, [searchTerm, extraData, fieldKey]);

    // Additional check for value consistency
    const selectedOption = baseOptions.find(opt => opt.value === value);
    
    useEffect(() => {
        if (value && !selectedOption && baseOptions.length > 0) {
            console.warn(`No matching option found for value "${value}" in field "${name}". Available values:`, 
                baseOptions.map(opt => opt.value));
        }
    }, [value, selectedOption, baseOptions, name]);

    return (
        <div className="grid gap-2">
            <Label htmlFor={id} className="font-medium">{label}</Label>
            <Select
                name={name}
                value={value || ""} // Ensure empty string instead of undefined
                onValueChange={onValueChange}
                disabled={readOnly}
            >
                <SelectTrigger
                    className={
                        mode === "view"
                            ? "bg-yellow-100/70 border-yellow-300 text-yellow-900"
                            : "bg-white/70 border-cyan-300 text-cyan-900"
                    }
                >
                    <SelectValue placeholder={`Select ${selectLabel}`} />
                </SelectTrigger>
                <SelectContent onPointerDownOutside={(e) => e.preventDefault()}>
                    <div className="relative mb-2 px-2">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-600 h-4 w-4" />
                        <Input
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                e.stopPropagation();
                            }}
                            className="pl-10 bg-white/70 border-cyan-300 text-cyan-900 placeholder:text-cyan-600"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <SelectGroup>
                        <SelectLabel>{selectLabel}</SelectLabel>
                        {filteredOptions.length === 0 ? (
                            <div className="text-cyan-600 text-sm px-2 py-1">
                                No results found.
                            </div>
                        ) : (
                            filteredOptions.map((opt) => (
                                <SelectItem key={opt.key} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))
                        )}
                    </SelectGroup>
                </SelectContent>
            </Select>
            {errors?.[0] && (
                <p className="text-sm text-red-600">{errors[0]}</p>
            )}
        </div>
    );
}