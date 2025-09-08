import { Progress } from './ui/progress';

export const ProgressHeader = ({
  currentStep,
  totalSteps,
  completionPercent,
}: {
  currentStep: number;
  totalSteps: number;
  completionPercent: number;
}) => (
  <div className="text-center mb-4">
    <p className="text-blue-700">Please complete all steps to submit your feedback</p>
    <div className="mt-2 flex justify-center items-center space-x-4">
      <div className="text-sm text-blue-700">
        Step {currentStep + 1} of {totalSteps}
      </div>
      <div className="text-sm text-blue-700">{Math.round(completionPercent)}% Complete</div>
    </div>
    <div className="mt-1">
      <Progress value={completionPercent} className="h-3 bg-blue-100" />
    </div>
  </div>
);
