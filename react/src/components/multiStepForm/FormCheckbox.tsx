import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormCheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const FormCheckbox = ({
  label,
  name,
  checked,
  onChange,
  className,
}: FormCheckboxProps) => {
  return (
    <div className={cn("flex items-start space-x-3", className)}>
      <Checkbox
        id={name}
        checked={checked}
        onCheckedChange={onChange}
        className="mt-0.5 size-5 rounded-full border-2 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
      />
      <div className="space-y-1">
        <Label
          htmlFor={name}
          className="text-sm font-medium text-foreground cursor-pointer"
        >
          {label}
        </Label>
      </div>
    </div>
  );
};
