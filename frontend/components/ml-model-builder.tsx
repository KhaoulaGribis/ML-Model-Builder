"use client"

import { useEffect, useState } from "react"
import { Plus, Zap, BarChart3, TrendingUp, Settings, History, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ModelWizardDialog from "./model-wizard-dialog"
import { apiClient } from "@/lib/api"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"

type ModelSummary = {
  modelId: string
  name: string
  description: string
  createdAt: string
  problemType: string
  algorithm: string
  metrics: Record<string, number>
  usage?: {
    totalCalls: number
    uniqueUsers: string[]
    lastUsed: string | null
  }
  summary?: {
    totalCalls: number
    uniqueUsersCount: number
    lastUsed: string | null
    avgCpuPercent: number
    maxMemoryMB: number
  }
}

type ModelDetails = ModelSummary & {
  inputColumns?: string[]
  outputColumn?: string
  resourceMonitoring?: {
    timestamp: string
    cpuPercent: number
    memoryMB: number
    latencyMs: number
  }[]
  performanceHistory?: {
    timestamp: string
    metrics: Record<string, number>
  }[]
}

export default function MLModelBuilder() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [models, setModels] = useState<ModelSummary[]>([])
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)
  const [selectedModelDetails, setSelectedModelDetails] = useState<ModelDetails | null>(null)
  const [loadingModels, setLoadingModels] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [deletingModelId, setDeletingModelId] = useState<string | null>(null)

  // Load models history from backend
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoadingModels(true)
        const data = await apiClient.getModels()
        setModels(data)
        if (data.length > 0 && !selectedModelId) {
          setSelectedModelId(data[0].modelId)
        }
      } catch (error) {
        console.error("Failed to load models history", error)
      } finally {
        setLoadingModels(false)
      }
    }
    fetchModels()
  }, [selectedModelId])

  const handleDeleteModel = async (modelId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this model? This action cannot be undone.")
    if (!confirmDelete) return

    try {
      setDeletingModelId(modelId)
      await apiClient.deleteModel(modelId)

      setModels((prev) => prev.filter((m) => m.modelId !== modelId))

      // If the deleted model was selected, clear or select another one
      setSelectedModelId((current) => {
        if (current === modelId) {
          const remaining = models.filter((m) => m.modelId !== modelId)
          return remaining.length > 0 ? remaining[0].modelId : null
        }
        return current
      })
      setSelectedModelDetails((current) => (current?.modelId === modelId ? null : current))
    } catch (error) {
      console.error("Failed to delete model", error)
      alert("Failed to delete model. Please try again.")
    } finally {
      setDeletingModelId(null)
    }
  }

  // Load details when a model is selected
  useEffect(() => {
    const fetchDetails = async () => {
      if (!selectedModelId) {
        setSelectedModelDetails(null)
        return
      }
      try {
        setLoadingDetails(true)
        const details = await apiClient.getModelDetails(selectedModelId)
        setSelectedModelDetails(details)
      } catch (error) {
        console.error("Failed to load model details", error)
      } finally {
        setLoadingDetails(false)
      }
    }
    fetchDetails()
  }, [selectedModelId])

  const stats = [
    { label: "Total Models", value: models.length, icon: BarChart3 },
    {
      label: "Avg Accuracy",
      value:
        models.length > 0
          ? `${(
              (models.reduce((sum, m) => sum + (m.metrics?.accuracy ?? 0), 0) / models.length || 0) * 100
            ).toFixed(1)}%`
          : "–",
      icon: TrendingUp,
    },
    {
      label: "Total API Calls",
      value: models.reduce((sum, m) => sum + (m.summary?.totalCalls ?? m.usage?.totalCalls ?? 0), 0),
      icon: Zap,
    },
    {
      label: "Active Users",
      value: models.reduce((sum, m) => sum + (m.summary?.uniqueUsersCount ?? (m.usage?.uniqueUsers?.length ?? 0)), 0),
      icon: Settings,
    },
  ]

  const selectedModel = selectedModelDetails || (models.length > 0 && selectedModelId
      ? (models.find((m) => m.modelId === selectedModelId) as ModelSummary)
      : models[0])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-6">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full flex gap-4 md:gap-6">
        {/* Sidebar - Model History */}
        <aside className="hidden md:flex flex-col w-72 bg-gradient-to-b from-card/95 to-background/80 border border-primary/10 rounded-2xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <History className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Model History</p>
                <p className="text-xs text-muted-foreground">{models.length} models</p>
              </div>
            </div>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-full border-primary/20"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
            {loadingModels && <p className="text-xs text-muted-foreground">Loading models...</p>}
            {models.map((model) => {
              const isActive = model.modelId === selectedModelId
              return (
                <div
                  key={model.modelId}
                  className={`w-full rounded-xl border px-3 py-3 text-sm smooth-transition hover:shadow-sm ${
                    isActive
                      ? "bg-gradient-to-r from-primary/15 to-accent/10 border-primary/50"
                      : "bg-card/80 border-border hover:border-primary/30"
                  }`}
                >
                  <button
                    onClick={() => setSelectedModelId(model.modelId)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-semibold text-foreground line-clamp-2">{model.name}</p>
                      <span className="text-xs font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5">
                        {model.problemType}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Best:{" "}
                        {typeof model.metrics?.accuracy === "number"
                          ? `${(model.metrics.accuracy * 100).toFixed(2)}%`
                          : "N/A"}
                      </span>
                      <span>
                        {model.summary?.lastUsed
                          ? new Date(model.summary.lastUsed).toLocaleString()
                          : new Date(model.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                  <div className="mt-2 flex items-center justify-end gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-primary"
                      title="View details"
                      onClick={async () => {
                        setSelectedModelId(model.modelId)
                        setIsDetailsDialogOpen(true)
                        // Load details if not already loaded
                        if (!selectedModelDetails || selectedModelDetails.modelId !== model.modelId) {
                          try {
                            setLoadingDetails(true)
                            const details = await apiClient.getModelDetails(model.modelId)
                            setSelectedModelDetails(details)
                          } catch (error) {
                            console.error("Failed to load model details", error)
                          } finally {
                            setLoadingDetails(false)
                          }
                        }
                      }}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      title="Delete model"
                      onClick={() => handleDeleteModel(model.modelId)}
                      disabled={deletingModelId === model.modelId}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )
            })}

            {models.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">
                No models yet. Click &quot;+&quot; to create your first model.
              </p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-border/60">
            <p className="text-xs text-muted-foreground">
              Select a model on the left to quickly review its best performance and details.
            </p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          {/* Header Section */}
          <div className="mb-8 md:mb-12 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                ML Model Builder
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Create, train, and compare machine learning models with advanced algorithms. Deploy your best-performing
              models with confidence.
            </p>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
            {stats.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div
                  key={idx}
                  className="group bg-gradient-to-br from-card to-muted/30 border border-primary/10 rounded-2xl p-6 hover:border-primary/30 smooth-transition hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 smooth-transition">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Create Model Section */}
          <div className="mb-10 md:mb-12">
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-2 border-primary/20 rounded-3xl p-8 md:p-12 text-center space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Create a New Model</h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Start building your machine learning model by uploading your dataset and configuring the parameters.
                </p>
              </div>
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="relative group"
                  aria-label="Create a new model"
                  title="Create a new model"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-xl opacity-50 group-hover:opacity-100 smooth-transition" />
                  <div className="relative w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary to-primary/80 hover:from-accent hover:to-accent/80 rounded-full flex items-center justify-center shadow-2xl hover:shadow-primary/40 smooth-transition transform group-hover:scale-110 cursor-pointer">
                    <Plus className="w-10 h-10 md:w-12 md:h-12 text-primary-foreground" strokeWidth={1.5} />
                  </div>
                </button>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Click the button to start creating</p>
            </div>
          </div>

          {/* Selected Model Detailed Overview */}
          {selectedModel && (
            <div className="mb-10 space-y-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <History className="w-4 h-4 text-primary" />
                  Model Details
                </h2>
                <span className="text-xs text-muted-foreground">
                  {"createdAt" in selectedModel && selectedModel.createdAt
                    ? new Date(selectedModel.createdAt).toLocaleString()
                    : ""}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-primary/10 rounded-2xl p-4 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Model Name</p>
                  <p className="text-sm font-semibold text-foreground">{selectedModel.name}</p>
                  {"description" in selectedModel && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {(selectedModel as any).description}
                    </p>
                  )}
                </div>
                <div className="bg-card border border-primary/10 rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Type & Algorithm</p>
                  <p className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-medium text-primary w-fit">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {("problemType" in selectedModel && (selectedModel as any).problemType) || "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Algorithm: {("algorithm" in selectedModel && (selectedModel as any).algorithm) || "N/A"}
                  </p>
                </div>
                <div className="bg-card border border-primary/10 rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Usage</p>
                  <p className="text-sm text-foreground">
                    Calls:{" "}
                    <span className="font-semibold">
                      {selectedModel.summary?.totalCalls ?? selectedModel.usage?.totalCalls ?? 0}
                    </span>
                  </p>
                  <p className="text-sm text-foreground">
                    Unique Users:{" "}
                    <span className="font-semibold">
                      {selectedModel.summary?.uniqueUsersCount ??
                        (selectedModel.usage?.uniqueUsers?.length ?? 0)}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last used:{" "}
                    {selectedModel.summary?.lastUsed
                      ? new Date(selectedModel.summary.lastUsed).toLocaleString()
                      : "Never"}
                  </p>
                </div>
              </div>

              {/* Metrics, performance and resource charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-card border border-primary/10 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Model Metrics</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedModel.metrics &&
                      Object.entries(selectedModel.metrics).map(([key, value]) => (
                        <div key={key} className="bg-background/60 rounded-xl p-3">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                            {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            {typeof value === "number" ? value.toFixed(4) : String(value)}
                          </p>
                        </div>
                      ))}
                  </div>

                  {"performanceHistory" in selectedModel &&
                    Array.isArray((selectedModel as any).performanceHistory) &&
                    (selectedModel as any).performanceHistory.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                          Performance Over Time (Primary Metric)
                        </p>
                        <div className="h-40">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={(selectedModel as any).performanceHistory.map((p: any, idx: number) => ({
                                index: idx + 1,
                                timestamp: p.timestamp,
                                value:
                                  typeof p.metrics?.accuracy === "number"
                                    ? p.metrics.accuracy * 100
                                    : typeof p.metrics?.r2Score === "number"
                                      ? p.metrics.r2Score
                                      : 0,
                              }))}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#1f2933" />
                              <XAxis dataKey="index" tickLine={false} tickMargin={8} />
                              <YAxis tickLine={false} tickMargin={8} />
                              <Tooltip
                                contentStyle={{ fontSize: "0.75rem" }}
                                formatter={(value: any) => (typeof value === "number" ? value.toFixed(3) : value)}
                              />
                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#2563eb"
                                strokeWidth={2}
                                dot={{ r: 2 }}
                                activeDot={{ r: 4 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                </div>

                <div className="bg-card border border-primary/10 rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Resource Monitoring</p>
                  <div className="space-y-1">
                    <p className="text-sm text-foreground">
                      Avg CPU:{" "}
                      <span className="font-semibold">
                        {selectedModel.summary?.avgCpuPercent
                          ? `${selectedModel.summary.avgCpuPercent.toFixed(1)}%`
                          : "N/A"}
                      </span>
                    </p>
                    <p className="text-sm text-foreground">
                      Max RAM:{" "}
                      <span className="font-semibold">
                        {selectedModel.summary?.maxMemoryMB
                          ? `${selectedModel.summary.maxMemoryMB.toFixed(1)} MB`
                          : "N/A"}
                      </span>
                    </p>
                  </div>

                  {"resourceMonitoring" in selectedModel &&
                    Array.isArray((selectedModel as any).resourceMonitoring) &&
                    (selectedModel as any).resourceMonitoring.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase">
                          CPU & RAM Over Time
                        </p>
                        <div className="h-32">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={(selectedModel as any).resourceMonitoring.map((r: any, idx: number) => ({
                                index: idx + 1,
                                cpu: r.cpuPercent,
                                memory: r.memoryMB,
                              }))}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#1f2933" />
                              <XAxis dataKey="index" tickLine={false} tickMargin={8} />
                              <YAxis tickLine={false} tickMargin={8} />
                              <Tooltip
                                contentStyle={{ fontSize: "0.7rem" }}
                                formatter={(value: any, name: any) =>
                                  typeof value === "number"
                                    ? name === "cpu"
                                      ? `${value.toFixed(1)} %`
                                      : `${value.toFixed(1)} MB`
                                    : value
                                }
                              />
                              <Line
                                type="monotone"
                                dataKey="cpu"
                                stroke="#22c55e"
                                strokeWidth={2}
                                dot={false}
                                name="cpu"
                              />
                              <Line
                                type="monotone"
                                dataKey="memory"
                                stroke="#f97316"
                                strokeWidth={2}
                                dot={false}
                                name="memory"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* Features Section */}
          <div className="mt-10 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Multiple Algorithms",
                description: "Automatically test classification and regression algorithms",
                icon: BarChart3,
              },
              {
                title: "Performance Metrics",
                description: "Compare detailed metrics for each trained model",
                icon: TrendingUp,
              },
              {
                title: "Smart Recommendations",
                description: "Get AI-powered suggestions for your best model",
                icon: Zap,
              },
            ].map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-card to-muted/20 border border-primary/10 rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg smooth-transition"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </main>
      </div>

      <ModelWizardDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />

      {/* Model Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedModelDetails?.name || "Model Details"}
            </DialogTitle>
            <DialogDescription>
              {selectedModelDetails?.description || "Complete details and statistics for this model"}
            </DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading model details...</p>
            </div>
          ) : selectedModelDetails ? (
            <div className="space-y-6 mt-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-primary/10 rounded-xl p-4 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Model Name</p>
                  <p className="text-base font-semibold text-foreground">{selectedModelDetails.name}</p>
                  {selectedModelDetails.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{selectedModelDetails.description}</p>
                  )}
                </div>
                <div className="bg-card border border-primary/10 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Type & Algorithm</p>
                  <p className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-medium text-primary w-fit">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {selectedModelDetails.problemType}
                  </p>
                  <p className="text-xs text-muted-foreground">Algorithm: {selectedModelDetails.algorithm}</p>
                </div>
                <div className="bg-card border border-primary/10 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Created At</p>
                  <p className="text-sm text-foreground">
                    {new Date(selectedModelDetails.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="bg-card border border-primary/10 rounded-xl p-4">
                <p className="text-sm font-semibold text-foreground mb-4">Usage Statistics</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-background/60 rounded-lg p-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Total API Calls</p>
                    <p className="text-2xl font-bold text-foreground">
                      {selectedModelDetails.summary?.totalCalls ?? selectedModelDetails.usage?.totalCalls ?? 0}
                    </p>
                  </div>
                  <div className="bg-background/60 rounded-lg p-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Unique Users</p>
                    <p className="text-2xl font-bold text-foreground">
                      {selectedModelDetails.summary?.uniqueUsersCount ??
                        (selectedModelDetails.usage?.uniqueUsers?.length ?? 0)}
                    </p>
                  </div>
                  <div className="bg-background/60 rounded-lg p-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Last Used</p>
                    <p className="text-sm font-semibold text-foreground">
                      {selectedModelDetails.summary?.lastUsed
                        ? new Date(selectedModelDetails.summary.lastUsed).toLocaleString()
                        : "Never"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Model Metrics */}
              <div className="bg-card border border-primary/10 rounded-xl p-4">
                <p className="text-sm font-semibold text-foreground mb-4">Model Metrics</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {selectedModelDetails.metrics &&
                    Object.entries(selectedModelDetails.metrics).map(([key, value]) => (
                      <div key={key} className="bg-background/60 rounded-lg p-3">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                          {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                        </p>
                        <p className="text-lg font-bold text-foreground">
                          {typeof value === "number" ? value.toFixed(4) : String(value)}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Performance History Chart */}
              {selectedModelDetails.performanceHistory &&
                Array.isArray(selectedModelDetails.performanceHistory) &&
                selectedModelDetails.performanceHistory.length > 0 && (
                  <div className="bg-card border border-primary/10 rounded-xl p-4">
                    <p className="text-sm font-semibold text-foreground mb-4">
                      Performance Over Time
                    </p>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={selectedModelDetails.performanceHistory.map((p, idx) => ({
                            index: idx + 1,
                            timestamp: p.timestamp,
                            value:
                              typeof p.metrics?.accuracy === "number"
                                ? p.metrics.accuracy * 100
                                : typeof p.metrics?.r2Score === "number"
                                  ? p.metrics.r2Score
                                  : 0,
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f2933" />
                          <XAxis dataKey="index" tickLine={false} tickMargin={8} />
                          <YAxis tickLine={false} tickMargin={8} />
                          <Tooltip
                            contentStyle={{ fontSize: "0.75rem" }}
                            formatter={(value: any) => (typeof value === "number" ? value.toFixed(3) : value)}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#2563eb"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

              {/* Resource Monitoring */}
              <div className="bg-card border border-primary/10 rounded-xl p-4">
                <p className="text-sm font-semibold text-foreground mb-4">Resource Monitoring</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-background/60 rounded-lg p-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Average CPU Usage</p>
                    <p className="text-xl font-bold text-foreground">
                      {selectedModelDetails.summary?.avgCpuPercent
                        ? `${selectedModelDetails.summary.avgCpuPercent.toFixed(1)}%`
                        : "N/A"}
                    </p>
                  </div>
                  <div className="bg-background/60 rounded-lg p-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Max Memory Usage</p>
                    <p className="text-xl font-bold text-foreground">
                      {selectedModelDetails.summary?.maxMemoryMB
                        ? `${selectedModelDetails.summary.maxMemoryMB.toFixed(1)} MB`
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {selectedModelDetails.resourceMonitoring &&
                  Array.isArray(selectedModelDetails.resourceMonitoring) &&
                  selectedModelDetails.resourceMonitoring.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                        CPU & RAM Over Time
                      </p>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={selectedModelDetails.resourceMonitoring.map((r, idx) => ({
                              index: idx + 1,
                              cpu: r.cpuPercent,
                              memory: r.memoryMB,
                            }))}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2933" />
                            <XAxis dataKey="index" tickLine={false} tickMargin={8} />
                            <YAxis yAxisId="left" tickLine={false} tickMargin={8} />
                            <YAxis yAxisId="right" orientation="right" tickLine={false} tickMargin={8} />
                            <Tooltip
                              contentStyle={{ fontSize: "0.7rem" }}
                              formatter={(value: any, name: any) =>
                                typeof value === "number"
                                  ? name === "cpu"
                                    ? `${value.toFixed(1)}%`
                                    : `${value.toFixed(1)} MB`
                                  : value
                              }
                            />
                            <Legend />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="cpu"
                              stroke="#22c55e"
                              strokeWidth={2}
                              dot={false}
                              name="CPU %"
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="memory"
                              stroke="#f97316"
                              strokeWidth={2}
                              dot={false}
                              name="Memory (MB)"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
              </div>

              {/* API Endpoint Info */}
              <div className="bg-card border border-primary/10 rounded-xl p-4">
                <p className="text-sm font-semibold text-foreground mb-2">API Endpoint</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Use this endpoint to make predictions with this model:
                </p>
                <div className="bg-background/60 rounded-lg p-3 font-mono text-xs">
                  <p className="text-foreground mb-1">
                    <span className="text-primary">POST</span> {process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}
                    /api/predict
                  </p>
                  <p className="text-muted-foreground mt-2">Request Body:</p>
                  <pre className="mt-1 text-xs overflow-x-auto">
                    {JSON.stringify(
                      {
                        modelId: selectedModelDetails.modelId,
                        features: selectedModelDetails.inputColumns?.reduce(
                          (acc, col) => ({ ...acc, [col]: "value" }),
                          {}
                        ) || {},
                        userId: "optional-user-id",
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">No model details available</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
