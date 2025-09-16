interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  return (
    <div className="flex items-center space-x-2">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <div key={stepNumber} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : isCompleted
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {stepNumber}
            </div>
            {index < totalSteps - 1 && (
              <div
                className={`w-8 h-0.5 mx-1 ${
                  isCompleted ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        );
      })}
      <span className="ml-2 text-sm text-muted-foreground">
        {currentStep}/{totalSteps}
      </span>
    </div>
  );
};

export default StepIndicator;