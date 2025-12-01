"use client"

import type React from "react"
import { useState } from "react"
import { Upload, CheckCircle2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { WizardData } from "../model-wizard-dialog"
import Papa from "papaparse"
import { apiClient } from "@/lib/api"

interface Step2Props {
  data: WizardData
  onUpdate: (updates: Partial<WizardData>) => void
  onNext: () => void
  onPrevious: () => void
}

export default function Step2FileUpload({ data, onUpdate, onNext, onPrevious }: Step2Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      alert("Please upload a CSV file")
      return
    }

    // Parse locally first for preview
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: "", // Auto-detect delimiter
      complete: async (results) => {
        // Normalize column names: strip whitespace and quotes (same as backend)
        const rawColumns =
          results.data.length > 0 ? Object.keys(results.data[0] as Record<string, any>).filter((col) => col !== "") : []
        const columns = rawColumns.map(col => col.trim().replace(/^["']|["']$/g, '')).filter(col => col !== "")

        // Upload to backend
        setIsUploading(true)
        try {
          const uploadData = await apiClient.uploadCSV(file)
          console.log("File uploaded successfully, uploadId:", uploadData.uploadId)

        onUpdate({
          csvFile: file,
          csvData: results.data.filter((row) => Object.values(row as any).some((val) => val !== "")),
          csvColumns: columns,
            uploadId: uploadData.uploadId,
        })
        } catch (error) {
          console.error("Error uploading file:", error)
          alert("Error uploading file to server: " + (error instanceof Error ? error.message : "Unknown error"))
        } finally {
          setIsUploading(false)
        }
      },
      error: (error) => {
        alert("Error parsing CSV: " + error.message)
      },
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl px-4 py-3">
        <Upload className="w-5 h-5 text-primary flex-shrink-0" />
        <p className="text-sm font-semibold text-foreground">Step 2 of 5: Upload CSV File</p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer smooth-transition ${
          isDragging
            ? "border-primary bg-gradient-to-br from-primary/20 via-transparent to-accent/10 shadow-lg"
            : "border-primary/30 hover:border-primary/60 bg-muted/30"
        }`}
      >
        <input
          type="file"
          accept=".csv"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileUpload(file)
          }}
          className="hidden"
          id="csvUpload"
        />
        <label htmlFor="csvUpload" className="cursor-pointer space-y-4 block">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="font-bold text-foreground text-lg">Drag and drop your CSV file</p>
            <p className="text-sm text-muted-foreground">or click to browse from your computer</p>
          </div>
          <p className="text-xs text-muted-foreground">Supported format: CSV files only</p>
        </label>
      </div>

      {data.csvFile && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-accent/10 to-primary/5 border border-accent/20 rounded-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {data.csvFile.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">File successfully uploaded</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-accent/20">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rows</p>
                <p className="text-2xl font-bold text-foreground">{data.csvData.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Columns</p>
                <p className="text-2xl font-bold text-foreground">{data.csvColumns.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">File Size</p>
                <p className="text-2xl font-bold text-foreground">{(data.csvFile.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          </div>

          {/* Data Preview Table */}
          {data.csvData.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Data Preview</h3>
              <div className="overflow-x-auto rounded-xl bg-gradient-to-br from-muted/50 to-primary/5 border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
                    <tr>
                      {data.csvColumns.slice(0, 10).map((col) => (
                        <th key={col} className="text-left py-4 px-4 text-sm font-semibold text-foreground whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                      {data.csvColumns.length > 10 && (
                        <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
                          +{data.csvColumns.length - 10} more
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {data.csvData.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-primary/5 smooth-transition">
                        {data.csvColumns.slice(0, 10).map((col) => (
                          <td key={`${idx}-${col}`} className="py-3 px-4 text-sm text-muted-foreground font-medium">
                            {String((row as Record<string, any>)[col] || "").slice(0, 30)}
                          </td>
                        ))}
                        {data.csvColumns.length > 10 && <td className="py-3 px-4 text-sm text-muted-foreground">...</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground">Showing first 5 rows of {data.csvData.length} total rows</p>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between pt-4 gap-3">
        <Button variant="outline" onClick={onPrevious} className="border-primary/20 bg-transparent px-8">
          Previous
        </Button>
        <Button onClick={onNext} disabled={!data.csvFile || !data.uploadId || isUploading} className="bg-gradient-to-r from-primary to-primary/80 px-8">
          {isUploading ? "Uploading..." : "Next: Select Problem Type"}
        </Button>
      </div>
    </div>
  )
}
