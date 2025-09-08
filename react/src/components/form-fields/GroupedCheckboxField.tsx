import { Label } from "../ui/label";
import type { GroupedCheckboxFieldProps, Permissions } from "./interfaces";

export function GroupedCheckboxField({
    id,
    name,
    label,
    value,
    extraData,
    setFormData,
    setErrors,
    readOnly,
    errors,
}: GroupedCheckboxFieldProps) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id} className="font-medium">
                {label}
            </Label>
            <div className="space-y-2">
                {/* Global Select All */}
                <div className="mb-3">
                    <Label className="flex items-center gap-2 font-medium text-sm">
                        <input
                            type="checkbox"
                            checked={
                                Object.values(extraData || {})
                                    .flat()
                                    .every((perm: Permissions) => value?.includes(perm.name))
                            }
                            onChange={(e) => {
                                const allPerms = Object.values(extraData || {})
                                    .flat()
                                    .map((p: Permissions) => p.name);
                                setFormData((prev) => ({
                                    ...prev,
                                    [name]: e.target.checked ? allPerms : [],
                                }));
                                setErrors((prev) => ({ ...prev, [name]: [] }));
                            }}
                            disabled={readOnly}
                        />
                        Select All Permissions
                    </Label>
                </div>

                {/* Per-Group Permissions */}
                {extraData &&
                    Object.entries(extraData)
                        .sort(([a], [b]) => a.localeCompare(b)) // Sort module names
                        .map(([module, permissions]: [string, Permissions[]]) => {
                            const allChecked = permissions.every((p) =>
                                value?.includes(p.name)
                            );

                            return (
                                <div key={module} className="mb-4 border-b pb-5">
                                    <div className="flex items-center justify-between">
                                        <h4 className="capitalize text-sm font-bold text-gray-700">
                                            {module}:
                                        </h4>
                                        <Label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={allChecked}
                                                onChange={(e) => {
                                                    const groupPerms = permissions.map((p) => p.name);
                                                    setFormData((prev) => {
                                                        const current = new Set(prev[name] || []);
                                                        if (e.target.checked) {
                                                            groupPerms.forEach((p) => current.add(p));
                                                        } else {
                                                            groupPerms.forEach((p) => current.delete(p));
                                                        }
                                                        return { ...prev, [name]: Array.from(current) };
                                                    });
                                                    setErrors((prev) => ({ ...prev, [name]: [] }));
                                                }}
                                                disabled={readOnly}
                                            />
                                            Select All
                                        </Label>
                                    </div>

                                    <div className="ms-4 mt-2 grid grid-cols-3 gap-2">
                                        {permissions
                                            .slice()
                                            .sort((a, b) => (a.label || a.name).localeCompare(b.label || b.name))
                                            .map((permission) => (
                                                <Label
                                                    key={permission.id}
                                                    className="flex items-center gap-2 text-sm"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        name={name}
                                                        value={permission.name}
                                                        checked={value?.includes(permission.name)}
                                                        onChange={(e) => {
                                                            const { checked, value: permValue } = e.target;
                                                            setFormData((prev) => {
                                                                const currentValues = new Set(prev[name] || []);
                                                                if (checked) {
                                                                    currentValues.add(permValue);
                                                                } else {
                                                                    currentValues.delete(permValue);
                                                                }
                                                                return {
                                                                    ...prev,
                                                                    [name]: Array.from(currentValues),
                                                                };
                                                            });
                                                            setErrors((prev) => ({
                                                                ...prev,
                                                                [name]: [],
                                                            }));
                                                        }}
                                                        disabled={readOnly}
                                                    />
                                                    <span>{permission.label}</span>
                                                </Label>
                                            ))}
                                    </div>
                                </div>
                            );
                        })}
            </div>
            {errors?.[0] && (
                <p className="text-sm text-red-600 mt-2">{errors[0]}</p>
            )}
        </div>
    );
}