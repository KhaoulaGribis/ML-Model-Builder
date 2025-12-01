interface WizardProgressProps {
  currentStep: number
  totalSteps: number
}

const stepTitles = ["Model Config", "Upload CSV", "Problem Type", "Feature Mapping", "Results"]

export default function WizardProgress({ currentStep, totalSteps }: WizardProgressProps) {
  return (
    <div className="space-y-6">
      <div className="w-full bg-gradient-to-r from-muted to-muted rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      <div className="flex justify-between items-center gap-1">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-2 flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold smooth-transition ${
                index + 1 <= currentStep
                  ? "bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg"
                  : index + 1 === currentStep + 1
                    ? "bg-muted text-muted-foreground border-2 border-primary/30"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {index + 1}
            </div>
            <span className="text-xs font-medium text-muted-foreground text-center">{stepTitles[index]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
