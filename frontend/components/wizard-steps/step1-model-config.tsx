"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { WizardData } from "../model-wizard-dialog"
import { Sparkles, Info, Zap } from "lucide-react"

interface Step1Props {
  data: WizardData
  onUpdate: (updates: Partial<WizardData>) => void
  onNext: () => void
}

export default function Step1ModelConfig({ data, onUpdate, onNext }: Step1Props) {
  const isValid = data.modelName.trim() !== "" && data.modelDescription.trim() !== ""

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl px-4 py-3">
        <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
        <p className="text-sm font-semibold text-foreground">Step 1 of 5: Model Configuration</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="modelName" className="text-base font-semibold text-foreground flex items-center gap-2">
            Model Name
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="modelName"
            placeholder="e.g., Customer Churn Predictor, Sales Forecast, Fraud Detection"
            value={data.modelName}
            onChange={(e) => onUpdate({ modelName: e.target.value })}
            className="h-12 bg-gradient-to-r from-input via-input to-muted border-primary/20 focus:border-primary smooth-transition text-base"
          />
          <p className="text-xs text-muted-foreground">Give your model a clear and descriptive name</p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="modelDescription" className="text-base font-semibold text-foreground flex items-center gap-2">
            Model Description
            <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="modelDescription"
            placeholder="Describe what this model will do, what problem it solves, and any important context about your dataset..."
            value={data.modelDescription}
            onChange={(e) => onUpdate({ modelDescription: e.target.value })}
            rows={5}
            className="bg-gradient-to-r from-input via-input to-muted border-primary/20 focus:border-primary smooth-transition resize-none text-base"
          />
          <p className="text-xs text-muted-foreground">Provide context about your model's purpose and objectives</p>
        </div>

        <div className="bg-gradient-to-br from-accent/10 to-primary/5 border border-accent/20 rounded-xl p-5 space-y-3">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-semibold text-foreground text-sm">Tips for Success</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Use descriptive names that reflect the model's purpose</li>
                <li>• Include relevant business context in the description</li>
                <li>• Mention any specific metrics you want to optimize</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={onNext}
          disabled={!isValid}
          className="bg-gradient-to-r from-primary to-primary/80 smooth-transition px-8 py-2 text-base"
        >
          <Zap className="w-4 h-4 mr-2" />
          Next: Upload Data
        </Button>
      </div>
    </div>
  )
}
