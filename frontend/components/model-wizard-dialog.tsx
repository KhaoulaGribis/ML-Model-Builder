"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { X } from "lucide-react"
import Step1ModelConfig from "./wizard-steps/step1-model-config"
import Step2FileUpload from "./wizard-steps/step2-file-upload"
import Step3ProblemType from "./wizard-steps/step3-problem-type"
import Step4FeatureMapping from "./wizard-steps/step4-feature-mapping"
import Step5AlgorithmResults from "./wizard-steps/step5-algorithm-results"
import WizardProgress from "./wizard-progress"

export interface WizardData {
  modelName: string
  modelDescription: string
  csvFile: File | null
  csvData: any[]
  csvColumns: string[]
  uploadId: string | null
  problemType: "classification" | "regression" | null
  inputColumns: string[]
  outputColumn: string
  algorithmResults: any | null
}

interface ModelWizardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ModelWizardDialog({ open, onOpenChange }: ModelWizardDialogProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<WizardData>({
    modelName: "",
    modelDescription: "",
    csvFile: null,
    csvData: [],
    csvColumns: [],
    uploadId: null,
    problemType: null,
    inputColumns: [],
    outputColumn: "",
    algorithmResults: null,
  })

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleClose = () => {
    setCurrentStep(1)
    setData({
      modelName: "",
      modelDescription: "",
      csvFile: null,
      csvData: [],
      csvColumns: [],
      uploadId: null,
      problemType: null,
      inputColumns: [],
      outputColumn: "",
      algorithmResults: null,
    })
    onOpenChange(false)
  }

  const updateData = (updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1ModelConfig data={data} onUpdate={updateData} onNext={handleNext} />
      case 2:
        return <Step2FileUpload data={data} onUpdate={updateData} onNext={handleNext} onPrevious={handlePrevious} />
      case 3:
        return <Step3ProblemType data={data} onUpdate={updateData} onNext={handleNext} onPrevious={handlePrevious} />
      case 4:
        return <Step4FeatureMapping data={data} onUpdate={updateData} onNext={handleNext} onPrevious={handlePrevious} />
      case 5:
        return (
          <Step5AlgorithmResults data={data} onUpdate={updateData} onPrevious={handlePrevious} onClose={handleClose} />
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-7xl lg:max-w-[90vw] max-h-[95vh] overflow-y-auto border-primary/20 shadow-2xl rounded-2xl p-0">
        <div className="sticky top-0 bg-background/95 backdrop-blur border-b border-primary/10 z-50">
          <div className="flex items-center justify-between p-6">
            <div className="space-y-1 flex-1">
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Create ML Model
              </DialogTitle>
              <DialogDescription className="text-base">
                Follow the steps to create, train, and compare your machine learning models
              </DialogDescription>
            </div>
            <button onClick={handleClose} className="text-muted-foreground hover:text-foreground smooth-transition">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="px-6 pb-4">
            <WizardProgress currentStep={currentStep} totalSteps={5} />
          </div>
        </div>

        <div className="p-6 md:p-8 lg:p-10 space-y-6">{renderStep()}</div>
      </DialogContent>
    </Dialog>
  )
}
