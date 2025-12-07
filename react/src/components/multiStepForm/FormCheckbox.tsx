import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormCheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  description?: string;
}

export const FormCheckbox = ({
  label,
  name,
  checked,
  onChange,
  className,
  description,
}: FormCheckboxProps) => {
  return (
    <div className={cn("flex items-start space-x-3", className)}>
      <Checkbox
        id={name}
        checked={checked}
        onCheckedChange={onChange}
        className="mt-0.5"
      />
      <div className="space-y-1">
        <Label
          htmlFor={name}
          className="text-sm font-medium text-foreground cursor-pointer"
        >
          {label}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
};
