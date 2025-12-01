"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { WizardData } from "../model-wizard-dialog"
import { CheckCircle2, Zap, Trophy, Sparkles, BarChart3, Clock, Code, Copy } from "lucide-react"
import { apiClient } from "@/lib/api"

interface Step5Props {
  data: WizardData
  onUpdate: (updates: Partial<WizardData>) => void
  onPrevious: () => void
  onClose: () => void
}

export default function Step5AlgorithmResults({ data, onUpdate, onPrevious, onClose }: Step5Props) {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const runAnalysis = async () => {
      if (!data.uploadId || !data.problemType || !data.inputColumns.length || !data.outputColumn) {
        setError("Missing required data. Please go back and complete previous steps.")
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        console.log("Starting analysis...", {
          uploadId: data.uploadId,
          problemType: data.problemType,
          inputColumns: data.inputColumns,
          outputColumn: data.outputColumn,
          modelName: data.modelName,
          modelDescription: data.modelDescription,
        })

        const analysisData = await apiClient.analyzeData(
          data.uploadId,
          data.problemType as string,
          data.inputColumns,
          data.outputColumn,
          data.modelName,
          data.modelDescription,
        )
        console.log("Analysis complete:", analysisData)
        setResults(analysisData)
        onUpdate({ algorithmResults: analysisData })
      } catch (err) {
        console.error("Error during analysis:", err)
        const errorMessage = err instanceof Error ? err.message : "An error occurred during analysis"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    runAnalysis()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.uploadId, data.problemType, data.inputColumns, data.outputColumn])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-transparent border-t-primary border-r-accent rounded-full animate-spin" />
          <div
            className="absolute inset-3 border-4 border-transparent border-b-primary/50 rounded-full animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "2s" }}
          />
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-foreground">Training Models...</p>
          <p className="text-muted-foreground">Analyzing your data and training algorithms</p>
          <p className="text-xs text-muted-foreground">This may take a moment</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-destructive/15 border-2 border-destructive/30 rounded-2xl p-6 space-y-2">
          <p className="text-sm font-bold text-destructive">Error Occurred</p>
          <p className="text-sm text-destructive/80">{error}</p>
        </div>
        <div className="flex justify-between pt-4 gap-3">
          <Button variant="outline" onClick={onPrevious} className="border-primary/20 bg-transparent px-8">
            Previous
          </Button>
        </div>
      </div>
    )
  }

  if (!results) {
    return null
  }

  const recommended = results.recommended
  const allResults = results.results

  const formatMetricName = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl px-4 py-3">
        <BarChart3 className="w-5 h-5 text-primary flex-shrink-0" />
        <p className="text-sm font-semibold text-foreground">Step 5 of 5: Algorithm Comparison Results</p>
      </div>

      {/* Recommended Algorithm Card */}
      <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 border-2 border-primary rounded-3xl p-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-lg">
            <Trophy className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="space-y-3 flex-1">
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest">Recommended Algorithm</p>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mt-1">
                {recommended.algorithm}
              </h3>
              {recommended.bestMetric && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm font-semibold text-muted-foreground">
                    Best {recommended.bestMetric.name === 'accuracy' ? 'Accuracy' : 'R² Score'}:
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {recommended.bestMetric.name === 'accuracy' 
                      ? `${(recommended.bestMetric.value * 100).toFixed(2)}%`
                      : recommended.bestMetric.value.toFixed(4)}
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mt-3">{recommended.justification}</p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-6 border-t border-primary/30">
          {Object.entries(recommended.metrics).map(([key, value]) => (
            <div key={key} className="space-y-2 bg-white/5 rounded-lg p-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{formatMetricName(key)}</p>
              <p className="text-2xl font-bold text-foreground">
                {typeof value === "number" ? value.toFixed(4) : value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-primary/20 rounded-lg px-4 py-3 w-fit">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">
            Training Time: {recommended.trainingTime.toFixed(2)}s
          </span>
        </div>

        {/* API Information */}
        {results.apiUsage && (
          <div className="mt-6 pt-6 border-t border-primary/30">
            <div className="flex items-center gap-2 mb-4">
              <Code className="w-5 h-5 text-primary" />
              <h4 className="text-lg font-bold text-foreground">API Endpoint</h4>
            </div>
            <div className="bg-background/50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Model ID</p>
                <code className="text-sm text-foreground font-mono bg-muted px-2 py-1 rounded">
                  {results.modelId}
                </code>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Endpoint</p>
                <code className="text-sm text-foreground font-mono bg-muted px-2 py-1 rounded">
                  POST {results.apiEndpoint}
                </code>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Example Request</p>
                <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto text-foreground">
                  {results.apiUsage.example}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Algorithm Comparison Section */}
      <div className="space-y-5">
        <h4 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          Complete Algorithm Comparison
        </h4>
        <p className="text-sm text-muted-foreground">All trained algorithms and their performance metrics</p>

        <div className="space-y-4">
          {allResults.map((result: any, idx: number) => (
            <Card
              key={idx}
              className={`p-6 smooth-transition border-2 overflow-hidden ${
                result.algorithm === recommended.algorithm
                  ? "border-primary bg-gradient-to-br from-primary/10 to-transparent shadow-xl"
                  : "border-border bg-muted/30 hover:border-primary/40 hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-bold text-lg text-foreground">{result.algorithm}</p>
                    {result.algorithm === recommended.algorithm && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-full">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-primary uppercase tracking-wide">Recommended</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg whitespace-nowrap">
                  <Zap className="w-4 h-4 text-primary" />
                  {result.trainingTime.toFixed(2)}s
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Object.entries(result.metrics).map(([key, value]) => (
                  <div key={key} className="bg-background/50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {formatMetricName(key)}
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      {typeof value === "number" ? value.toFixed(4) : value}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-6 gap-3 border-t border-border pt-8">
        <Button variant="outline" onClick={onPrevious} className="border-primary/20 bg-transparent px-8">
          Previous
        </Button>
        <Button
          onClick={onClose}
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-8 text-base font-semibold"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Complete & Deploy
        </Button>
      </div>
    </div>
  )
}
