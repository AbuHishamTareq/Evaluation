import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FormInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  className?: string;
  error?: string;
  disabled?: boolean;
}

export const FormInput = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  multiline = false,
  className,
  error,
  disabled = false,
}: FormInputProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {multiline ? (
        <Textarea
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "min-h-[100px] resize-none bg-background border-input focus:ring-2 focus:ring-primary/20 transition-all",
            error && "border-destructive focus:ring-destructive/20"
          )}
        />
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "bg-background border-input focus:ring-2 focus:ring-primary/20 transition-all",
            error && "border-destructive focus:ring-destructive/20"
          )}
        />
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};
