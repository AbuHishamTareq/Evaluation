import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

interface FormInputProps {
  label: string;
  name: string;
  value: string;
  onChange?: (value: string) => void;
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
  disabled,
}: FormInputProps) => {
  const isDateType = type === "date";

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
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "min-h-[100px] resize-none bg-background border-input focus:ring-2 focus:ring-primary/20 transition-all",
            error && "border-destructive focus:ring-destructive/20"
          )}
          disabled={disabled}
        />
      ) : isDateType ? (
        <div className="relative">
          <Input
            id={name}
            name={name}
            type="date"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "bg-background border-input focus:ring-2 focus:ring-primary/20 transition-all pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer",
              error && "border-destructive focus:ring-destructive/20"
            )}
          />
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
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
