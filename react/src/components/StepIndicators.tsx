import { Check } from 'lucide-react';
import type { FormStep } from '../hooks/useSurvey';

export const StepIndicators = ({ surveySteps, currentStep }: { surveySteps: FormStep[]; currentStep: number }) => (
  <div className="flex justify-center mb-6">
    <div className="flex space-x-4">
      {surveySteps.map((_, index) => (
        <div
          key={index}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
            index < currentStep
              ? 'bg-green-500 text-white'
              : index === currentStep
              ? 'bg-blue-600 text-white ring-4 ring-blue-200'
              : 'bg-blue-200 text-blue-700'
          }`}
        >
          {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
        </div>
      ))}
    </div>
  </div>
);
