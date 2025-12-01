"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { WizardData } from "../model-wizard-dialog"
import { X, Plus, Columns3, Info } from "lucide-react"

interface Step4Props {
  data: WizardData
  onUpdate: (updates: Partial<WizardData>) => void
  onNext: () => void
  onPrevious: () => void
}

export default function Step4FeatureMapping({ data, onUpdate, onNext, onPrevious }: Step4Props) {
  const [availableColumns, setAvailableColumns] = useState<string[]>([])
  const clickTimers = useRef<Map<string, NodeJS.Timeout>>(new Map())

  useEffect(() => {
    const used = [...data.inputColumns, data.outputColumn ? [data.outputColumn] : []].flat()
    setAvailableColumns(data.csvColumns.filter((col) => !used.includes(col)))
  }, [data.csvColumns, data.inputColumns, data.outputColumn])

  const handleAddInput = (column: string) => {
    onUpdate({
      inputColumns: [...data.inputColumns, column],
    })
  }

  const handleRemoveInput = (column: string) => {
    onUpdate({
      inputColumns: data.inputColumns.filter((c) => c !== column),
    })
  }

  const handleSetOutput = (column: string) => {
    // Remove from input if it's already there
    const newInputColumns = data.inputColumns.filter((c) => c !== column)
    onUpdate({
      inputColumns: newInputColumns,
      outputColumn: data.outputColumn === column ? "" : column,
    })
  }

  const handleColumnClick = (column: string) => {
    // Clear any existing timer for this column
    const existingTimer = clickTimers.current.get(column)
    if (existingTimer) {
      clearTimeout(existingTimer)
      clickTimers.current.delete(column)
    }

    // Set a timer to handle single click
    const timer = setTimeout(() => {
      handleAddInput(column)
      clickTimers.current.delete(column)
    }, 300) // 300ms delay to detect double-click

    clickTimers.current.set(column, timer)
  }

  const handleColumnDoubleClick = (column: string) => {
    // Clear the single-click timer
    const timer = clickTimers.current.get(column)
    if (timer) {
      clearTimeout(timer)
      clickTimers.current.delete(column)
    }

    // Handle double-click: set as output
    handleSetOutput(column)
  }

  const isValid = data.inputColumns.length > 0 && data.outputColumn !== ""

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl px-4 py-3">
        <Columns3 className="w-5 h-5 text-primary flex-shrink-0" />
        <p className="text-sm font-semibold text-foreground">Step 4 of 5: Feature Mapping</p>
      </div>

      <div className="space-y-2">
        <p className="text-base text-foreground font-semibold">Assign Your Features</p>
        <p className="text-sm text-muted-foreground">
          Select which columns are input features (predictors) and which is your output target (what you want to
          predict)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Features */}
        <div className="space-y-4">
          <Label className="text-base font-bold text-foreground flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            Input Features{" "}
            {data.inputColumns.length > 0 && <span className="text-primary">({data.inputColumns.length})</span>}
          </Label>
          <div className="bg-gradient-to-br from-muted/50 to-primary/5 border-2 border-primary/20 rounded-2xl p-5 space-y-3 min-h-80">
            {data.inputColumns.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-16 text-center">No features selected yet</p>
            ) : (
              data.inputColumns.map((col) => (
                <div
                  key={col}
                  className="flex items-center justify-between bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30 rounded-lg px-4 py-3 smooth-transition hover:shadow-md hover:border-primary/50"
                >
                  <span className="text-sm font-medium text-foreground">{col}</span>
                  <button
                    onClick={() => handleRemoveInput(col)}
                    className="text-muted-foreground hover:text-destructive smooth-transition"
                    title="Remove feature"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Output Target */}
        <div className="space-y-4">
          <Label className="text-base font-bold text-foreground flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            Output Target {data.outputColumn && <span className="text-accent">(Selected)</span>}
          </Label>
          <div className="bg-gradient-to-br from-muted/50 to-accent/5 border-2 border-accent/20 rounded-2xl p-5 space-y-3 min-h-80">
            {data.outputColumn ? (
              <div className="flex items-center justify-between bg-gradient-to-r from-accent/20 to-accent/5 border border-accent/30 rounded-lg px-4 py-3 smooth-transition hover:shadow-md hover:border-accent/50">
                <span className="text-sm font-medium text-foreground">{data.outputColumn}</span>
                <button
                  onClick={() => handleSetOutput(data.outputColumn)}
                  className="text-muted-foreground hover:text-destructive smooth-transition"
                  title="Remove target"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic py-16 text-center">No target selected yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Available Columns */}
      <div className="space-y-4">
        <Label className="text-base font-bold text-foreground">Available Columns</Label>
        <div className="flex flex-wrap gap-2 bg-muted/30 border-2 border-dashed border-border rounded-2xl p-6">
          {availableColumns.length === 0 ? (
            <p className="text-sm text-muted-foreground italic w-full text-center py-6">
              All columns have been assigned
            </p>
          ) : (
            availableColumns.map((col) => (
              <button
                key={col}
                onClick={() => handleColumnClick(col)}
                onDoubleClick={() => handleColumnDoubleClick(col)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-muted to-muted/50 hover:from-primary/20 hover:to-primary/5 border border-border hover:border-primary/30 rounded-lg text-sm font-medium smooth-transition hover:shadow-md cursor-pointer"
                title="Click to add as input • Double-click to set as output"
              >
                <Plus className="w-4 h-4" />
                {col}
              </button>
            ))
          )}
        </div>
        <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
          <Info className="w-3 h-3" />
          Single-click to add input • Double-click to set output
        </p>
      </div>

      <div className="flex justify-between pt-4 gap-3">
        <Button variant="outline" onClick={onPrevious} className="border-primary/20 bg-transparent px-8">
          Previous
        </Button>
        <Button onClick={onNext} disabled={!isValid} className="bg-gradient-to-r from-primary to-primary/80 px-8">
          Next: Compare Algorithms
        </Button>
      </div>
    </div>
  )
}
