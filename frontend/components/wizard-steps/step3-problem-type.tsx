"use client"

import { Button } from "@/components/ui/button"
import type { WizardData } from "../model-wizard-dialog"
import { BarChart3, TrendingUp, AlertCircle, Zap } from "lucide-react"

interface Step3Props {
  data: WizardData
  onUpdate: (updates: Partial<WizardData>) => void
  onNext: () => void
  onPrevious: () => void
}

export default function Step3ProblemType({ data, onUpdate, onNext, onPrevious }: Step3Props) {
  const options = [
    {
      id: "classification",
      title: "Classification",
      description: "Predict discrete categories or classes",
      examples: "Examples: Spam detection, Customer churn, Disease diagnosis, Fraud detection",
      icon: BarChart3,
    },
    {
      id: "regression",
      title: "Regression",
      description: "Predict continuous numerical values",
      examples: "Examples: House prices, Temperature, Stock prices, Sales forecasting",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl px-4 py-3">
        <Zap className="w-5 h-5 text-primary flex-shrink-0" />
        <p className="text-sm font-semibold text-foreground">Step 3 of 5: Select Problem Type</p>
      </div>

      <div className="space-y-3">
        <p className="text-base text-foreground font-semibold">What type of prediction do you need?</p>
        <p className="text-sm text-muted-foreground">This determines which algorithms will be trained on your data</p>
      </div>

      <div className="space-y-4">
        {options.map((option) => {
          const Icon = option.icon
          return (
            <label
              key={option.id}
              className={`flex items-start gap-4 p-6 border-2 rounded-2xl cursor-pointer smooth-transition transform hover:scale-[1.02] ${
                data.problemType === option.id
                  ? "border-primary bg-gradient-to-br from-primary/15 via-primary/10 to-transparent shadow-lg"
                  : "border-border hover:border-primary/50 bg-muted/30 hover:bg-muted/50"
              }`}
            >
              <input
                type="radio"
                name="problemType"
                value={option.id}
                checked={data.problemType === option.id}
                onChange={() => onUpdate({ problemType: option.id as "classification" | "regression" })}
                className="w-6 h-6 cursor-pointer mt-1 flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-lg">{option.title}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground ml-13 pt-2 border-t border-border/50 mt-3 pt-3">
                  {option.examples}
                </p>
              </div>
            </label>
          )
        })}
      </div>

      {/* Helpful info section */}
      <div className="bg-gradient-to-br from-accent/10 to-primary/5 border border-accent/20 rounded-xl p-5 space-y-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="font-semibold text-foreground text-sm">How to Choose</p>
            <p className="text-xs text-muted-foreground">
              If your target variable has distinct categories, choose Classification. If it's a number representing a
              range of values, choose Regression.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4 gap-3">
        <Button variant="outline" onClick={onPrevious} className="border-primary/20 bg-transparent px-8">
          Previous
        </Button>
        <Button
          onClick={onNext}
          disabled={!data.problemType}
          className="bg-gradient-to-r from-primary to-primary/80 px-8"
        >
          Next: Map Features
        </Button>
      </div>
    </div>
  )
}
