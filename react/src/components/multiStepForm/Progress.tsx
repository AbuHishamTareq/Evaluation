import {
  Check,
  User,
  GraduationCap,
  Briefcase,
  BookOpen,
  Building2,
  Upload,
  Hospital,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { icon: Hospital, label: "Primary Health Care" },
  { icon: User, label: "Personal" },
  { icon: Building2, label: "Current Job" },
  { icon: GraduationCap, label: "Education" },
  { icon: Briefcase, label: "Experience" },
  { icon: BookOpen, label: "Courses" },
  { icon: Upload, label: "Documents" },
];

export const Progress = ({ currentStep, totalSteps }: ProgressProps) => {
  return (
    <div className="w-full mb-8">
      {/* Progress Bar */}
      <div className="relative h-2 bg-muted rounded-full mb-6 overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </div>

      {/* Step Icons */}
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const stepNumber = index + 1;
          const isComplete = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div key={index} className="flex flex-col items-center">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
                  isComplete && "bg-accent text-accent-foreground",
                  isActive &&
                    "bg-primary text-primary-foreground shadow-elevated scale-110",
                  !isComplete && !isActive && "bg-muted text-muted-foreground"
                )}
              >
                {isComplete ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium transition-colors hidden sm:block",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
