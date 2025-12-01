const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export const apiClient = {
  async createModel(name: string, description: string) {
    const response = await fetch(`${API_URL}/api/models`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    })
    if (!response.ok) throw new Error("Failed to create model")
    return response.json()
  },

  async uploadCSV(file: File) {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      body: formData,
    })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to upload CSV: ${errorText}`)
    }
    return response.json()
  },

  async analyzeData(
    uploadId: string,
    problemType: string,
    inputColumns: string[],
    outputColumn: string,
    modelName?: string,
    modelDescription?: string,
  ) {
    const response = await fetch(`${API_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uploadId,
        problemType,
        inputColumns,
        outputColumn,
        modelName,
        modelDescription,
      }),
    })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to analyze data: ${errorText}`)
    }
    return response.json()
  },

  async getModels() {
    const response = await fetch(`${API_URL}/api/models`)
    if (!response.ok) throw new Error("Failed to fetch models")
    return response.json()
  },

  async deleteModel(modelId: string) {
    const response = await fetch(`${API_URL}/api/models/${modelId}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to delete model")
    return response.json()
  },

  async getModelDetails(modelId: string) {
    const response = await fetch(`${API_URL}/api/models/${modelId}`)
    if (!response.ok) throw new Error("Failed to fetch model details")
    return response.json()
  },
}
