from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import os
import uuid
import joblib
from pathlib import Path

from app.utils import preprocess_data, calculate_metrics_classification, calculate_metrics_regression, select_best_algorithm
from app.algorithms.classification import train_all_classification_algorithms
from app.algorithms.regression import train_all_regression_algorithms

app = FastAPI(title="ML Model Builder API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create necessary directories
BASE_DIR = Path(__file__).parent
UPLOAD_DIR = BASE_DIR / "uploads"
MODELS_DIR = BASE_DIR / "models"
RESULTS_DIR = BASE_DIR / "results"

UPLOAD_DIR.mkdir(exist_ok=True)
MODELS_DIR.mkdir(exist_ok=True)
RESULTS_DIR.mkdir(exist_ok=True)

# In-memory storage for uploads (in production, use a database)
uploads_storage = {}


# Pydantic models
class ModelCreate(BaseModel):
    name: str
    description: str


class AnalyzeRequest(BaseModel):
    uploadId: str
    problemType: str
    inputColumns: List[str]
    outputColumn: str


class PredictionRequest(BaseModel):
    modelId: str
    features: dict


@app.get("/")
async def root():
    return {"message": "ML Model Builder API", "version": "1.0.0"}


@app.post("/api/models")
async def create_model(model: ModelCreate):
    """Create a new model (currently just returns success)"""
    model_id = str(uuid.uuid4())
    return {
        "id": model_id,
        "name": model.name,
        "description": model.description,
        "status": "created"
    }


@app.post("/api/upload")
async def upload_csv(file: UploadFile = File(...)):
    """Upload a CSV file"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV file")
    
    # Generate unique upload ID
    upload_id = str(uuid.uuid4())
    
    # Save file
    file_path = UPLOAD_DIR / f"{upload_id}.csv"
    content = await file.read()
    
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Read and parse CSV
    try:
        # Try to detect separator automatically
        # First, read a small sample to detect separator
        with open(file_path, 'r', encoding='utf-8') as f:
            first_line = f.readline()
            # Detect separator
            if ';' in first_line and first_line.count(';') > first_line.count(','):
                separator = ';'
            elif '\t' in first_line:
                separator = '\t'
            else:
                separator = ','
        
        # Read CSV with detected separator
        df = pd.read_csv(file_path, sep=separator, encoding='utf-8')
        
        # If still only one column, try other encodings and separators
        if len(df.columns) == 1:
            for sep in [';', ',', '\t']:
                try:
                    df = pd.read_csv(file_path, sep=sep, encoding='utf-8')
                    if len(df.columns) > 1:
                        break
                except:
                    continue
        
        # Normalize column names: strip whitespace, quotes, and handle encoding issues
        df.columns = df.columns.str.strip().str.strip('"').str.strip("'")
        columns = df.columns.tolist()
        
        # Store metadata
        uploads_storage[upload_id] = {
            "file_path": str(file_path),
            "columns": columns,
            "rows": len(df),
            "filename": file.filename
        }
        
        return {
            "uploadId": upload_id,
            "filename": file.filename,
            "columns": columns,
            "rows": len(df),
            "message": "File uploaded successfully"
        }
    except Exception as e:
        # Clean up file if error
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=400, detail=f"Error reading CSV: {str(e)}")


@app.post("/api/analyze")
async def analyze_data(request: AnalyzeRequest):
    """Analyze data with ML algorithms"""
    
    # Get upload info
    if request.uploadId not in uploads_storage:
        # Check if file still exists on disk
        file_path = UPLOAD_DIR / f"{request.uploadId}.csv"
        if file_path.exists():
            # Re-read the file and restore in storage
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    first_line = f.readline()
                    if ';' in first_line and first_line.count(';') > first_line.count(','):
                        separator = ';'
                    elif '\t' in first_line:
                        separator = '\t'
                    else:
                        separator = ','
                
                df = pd.read_csv(file_path, sep=separator, encoding='utf-8')
                df.columns = df.columns.str.strip().str.strip('"').str.strip("'")
                columns = df.columns.tolist()
                
                uploads_storage[request.uploadId] = {
                    "file_path": str(file_path),
                    "columns": columns,
                    "rows": len(df),
                    "filename": f"{request.uploadId}.csv"
                }
            except Exception as e:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Upload not found and could not restore from file: {str(e)}"
                )
        else:
            raise HTTPException(
                status_code=404, 
                detail=f"Upload not found. UploadId: {request.uploadId}. Please upload your CSV file again."
            )
    
    upload_info = uploads_storage[request.uploadId]
    file_path = upload_info["file_path"]
    
    # Debug logging
    print(f"Analyzing data for uploadId: {request.uploadId}")
    print(f"Problem type: {request.problemType}")
    print(f"Requested input columns: {request.inputColumns}")
    print(f"Requested output column: {request.outputColumn}")
    print(f"Available columns in CSV: {upload_info['columns']}")
    
    # Validate problem type
    if request.problemType not in ["classification", "regression"]:
        raise HTTPException(status_code=400, detail="problemType must be 'classification' or 'regression'")
    
    # Validate columns - normalize by stripping whitespace
    available_columns = upload_info["columns"]
    normalized_available = {col.strip(): col for col in available_columns}
    
    # Normalize requested columns
    normalized_input_columns = [col.strip() for col in request.inputColumns]
    normalized_output_column = request.outputColumn.strip()
    
    # Check input columns
    missing_inputs = []
    actual_input_columns = []
    for col in normalized_input_columns:
        if col not in normalized_available:
            missing_inputs.append(col)
        else:
            actual_input_columns.append(normalized_available[col])  # Use original column name
    
    if missing_inputs:
        raise HTTPException(
            status_code=400, 
            detail=f"Input columns not found in CSV: {missing_inputs}. Available columns: {available_columns}"
        )
    
    # Check output column
    if normalized_output_column not in normalized_available:
        raise HTTPException(
            status_code=400, 
            detail=f"Output column '{request.outputColumn}' not found in CSV. Available columns: {available_columns}"
        )
    
    actual_output_column = normalized_available[normalized_output_column]  # Use original column name
    
    if request.outputColumn in request.inputColumns:
        raise HTTPException(status_code=400, detail="Output column cannot be in input columns")
    
    try:
        # Load and preprocess data with same separator detection
        with open(file_path, 'r', encoding='utf-8') as f:
            first_line = f.readline()
            if ';' in first_line and first_line.count(';') > first_line.count(','):
                separator = ';'
            elif '\t' in first_line:
                separator = '\t'
            else:
                separator = ','
        
        df = pd.read_csv(file_path, sep=separator, encoding='utf-8')
        # Normalize column names again (in case file was modified)
        df.columns = df.columns.str.strip().str.strip('"').str.strip("'")
        
        # Preprocess using actual column names (with proper whitespace)
        X_train, X_test, y_train, y_test = preprocess_data(
            df,
            actual_input_columns,
            actual_output_column,
            request.problemType
        )
        
        if len(X_train) == 0 or len(X_test) == 0:
            raise HTTPException(
                status_code=400, 
                detail=f"Not enough data after preprocessing. Train: {len(X_train)}, Test: {len(X_test)}. Please check your data quality and column selections."
            )
        
        # Train algorithms
        if request.problemType == "classification":
            algorithm_results = train_all_classification_algorithms(X_train, y_train, X_test, y_test)
        else:
            algorithm_results = train_all_regression_algorithms(X_train, y_train, X_test, y_test)
        
        if not algorithm_results:
            raise HTTPException(status_code=500, detail="No algorithms could be trained")
        
        # Calculate metrics for each algorithm
        results_with_metrics = []
        for result in algorithm_results:
            if request.problemType == "classification":
                metrics = calculate_metrics_classification(
                    y_test,
                    result['y_pred'],
                    result.get('y_pred_proba')
                )
            else:
                metrics = calculate_metrics_regression(y_test, result['y_pred'])
            
            results_with_metrics.append({
                "algorithm": result['algorithm'],
                "metrics": metrics,
                "trainingTime": result['trainingTime'],
                "model": result['model']  # Store model for later use
            })
        
        # Select best algorithm
        best_algorithm = select_best_algorithm(results_with_metrics, request.problemType)
        
        if not best_algorithm:
            raise HTTPException(status_code=500, detail="Could not determine best algorithm")
        
        # Save the best model
        model_id = str(uuid.uuid4())
        model_path = MODELS_DIR / f"{model_id}.joblib"
        
        # Save model and metadata (use actual column names)
        model_data = {
            'model': best_algorithm['model'],
            'algorithm': best_algorithm['algorithm'],
            'problem_type': request.problemType,
            'input_columns': actual_input_columns,
            'output_column': actual_output_column,
            'metrics': best_algorithm['metrics']
        }
        
        joblib.dump(model_data, model_path)
        
        # Prepare response (remove model objects from response)
        response_results = []
        for r in results_with_metrics:
            response_results.append({
                "algorithm": r['algorithm'],
                "metrics": r['metrics'],
                "trainingTime": r['trainingTime']
            })
        
        # Get the best accuracy/performance metric
        best_metric_key = 'accuracy' if request.problemType == 'classification' else 'r2Score'
        best_metric_value = best_algorithm['metrics'].get(best_metric_key, 0)
        
        return {
            "modelId": model_id,
            "recommended": {
                "algorithm": best_algorithm['algorithm'],
                "metrics": best_algorithm['metrics'],
                "trainingTime": best_algorithm['trainingTime'],
                "justification": best_algorithm['justification'],
                "bestMetric": {
                    "name": best_metric_key,
                    "value": best_metric_value
                }
            },
            "results": response_results,
            "apiEndpoint": f"/api/predict",
            "apiUsage": {
                "method": "POST",
                "url": f"/api/predict",
                "body": {
                    "modelId": model_id,
                    "features": {col: "value" for col in actual_input_columns}
                },
                "example": f"POST /api/predict\n{{\n  \"modelId\": \"{model_id}\",\n  \"features\": {{\n    \"{actual_input_columns[0] if actual_input_columns else 'column1'}\": \"value1\",\n    \"{actual_input_columns[1] if len(actual_input_columns) > 1 else 'column2'}\": \"value2\"\n  }}\n}}"
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during analysis: {str(e)}")


@app.post("/api/predict")
async def predict(request: PredictionRequest):
    """Make predictions using a trained model"""
    model_path = MODELS_DIR / f"{request.modelId}.joblib"
    
    if not model_path.exists():
        raise HTTPException(status_code=404, detail="Model not found")
    
    try:
        # Load model
        model_data = joblib.load(model_path)
        model = model_data['model']
        input_columns = model_data['input_columns']
        
        # Validate input features
        for col in input_columns:
            if col not in request.features:
                raise HTTPException(status_code=400, detail=f"Missing feature: {col}")
        
        # Prepare input data
        input_data = pd.DataFrame([request.features])
        input_data = input_data[input_columns]
        
        # Make prediction
        prediction = model.predict(input_data)[0]
        
        # If classification, get probabilities
        prediction_proba = None
        if model_data['problem_type'] == 'classification' and hasattr(model, 'predict_proba'):
            prediction_proba = model.predict_proba(input_data)[0].tolist()
        
        return {
            "prediction": float(prediction) if model_data['problem_type'] == 'regression' else int(prediction),
            "probabilities": prediction_proba,
            "algorithm": model_data['algorithm'],
            "problemType": model_data['problem_type']
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error making prediction: {str(e)}")


@app.get("/api/models/{model_id}")
async def get_model(model_id: str):
    """Get model information"""
    model_path = MODELS_DIR / f"{model_id}.joblib"
    
    if not model_path.exists():
        raise HTTPException(status_code=404, detail="Model not found")
    
    try:
        model_data = joblib.load(model_path)
        
        return {
            "modelId": model_id,
            "algorithm": model_data['algorithm'],
            "problemType": model_data['problem_type'],
            "inputColumns": model_data['input_columns'],
            "outputColumn": model_data['output_column'],
            "metrics": model_data['metrics']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading model: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)

