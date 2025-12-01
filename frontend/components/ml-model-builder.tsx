"use client"

import { useState } from "react"
import { Plus, Zap, BarChart3, TrendingUp, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import ModelWizardDialog from "./model-wizard-dialog"

export default function MLModelBuilder() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [models, setModels] = useState([
    { id: 1, name: "Customer Churn Predictor", type: "Classification", accuracy: 94.2, date: "2 days ago" },
    { id: 2, name: "Sales Forecast", type: "Regression", accuracy: 87.5, date: "1 week ago" },
    { id: 3, name: "Fraud Detection", type: "Classification", accuracy: 96.8, date: "3 weeks ago" },
  ])

  const stats = [
    { label: "Total Models", value: models.length, icon: BarChart3 },
    { label: "Avg Accuracy", value: "92.8%", icon: TrendingUp },
    { label: "Algorithms Tested", value: "150+", icon: Zap },
    { label: "Data Rows Analyzed", value: "2.5M", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6 md:p-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              ML Model Builder
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Create, train, and compare machine learning models with advanced algorithms. Deploy your best-performing
            models with confidence.
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
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
        <div className="mb-12">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-2 border-primary/20 rounded-3xl p-12 text-center space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Create a New Model</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Start building your machine learning model by uploading your dataset and configuring the parameters.
              </p>
            </div>
            <div className="flex justify-center pt-4">
              <button onClick={() => setIsDialogOpen(true)} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-xl opacity-50 group-hover:opacity-100 smooth-transition" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-primary to-primary/80 hover:from-accent hover:to-accent/80 rounded-full flex items-center justify-center shadow-2xl hover:shadow-primary/40 smooth-transition transform group-hover:scale-110 cursor-pointer">
                  <Plus className="w-12 h-12 text-primary-foreground" strokeWidth={1.5} />
                </div>
              </button>
            </div>
            <p className="text-sm text-muted-foreground font-medium">Click the button to start creating</p>
          </div>
        </div>

        {/* Recent Models Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Recent Models</h2>
            <p className="text-muted-foreground">View and manage your previously created machine learning models</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {models.map((model) => (
              <div
                key={model.id}
                className="group bg-gradient-to-br from-card to-muted/20 border border-primary/10 rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg smooth-transition cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-2xl -z-10 group-hover:from-primary/20 group-hover:to-accent/20 smooth-transition" />

                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary smooth-transition">
                      {model.name}
                    </h3>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-xs font-medium text-primary">{model.type}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 smooth-transition">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Best Accuracy</span>
                    <span className="text-sm font-bold text-primary">{model.accuracy}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{model.date}</p>
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-4 border-primary/20 hover:border-primary/50 bg-transparent smooth-transition"
                >
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>

      <ModelWizardDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  )
}
