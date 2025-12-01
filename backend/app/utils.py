import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from typing import Dict, List, Tuple, Any
import time


def preprocess_data(
    df: pd.DataFrame,
    input_columns: List[str],
    output_column: str,
    problem_type: str
) -> Tuple[pd.DataFrame, pd.Series, pd.DataFrame, pd.Series, Dict[str, Any], Any]:
    """
    Preprocess the data for machine learning.
    Returns X_train, X_test, y_train, y_test
    """
    # Create a copy to avoid modifying original
    data = df.copy()
    
    # Remove rows with missing values in target column
    data = data.dropna(subset=[output_column])
    
    # Separate features and target
    X = data[input_columns].copy()
    y = data[output_column].copy()
    
    # Initial check
    if len(X) == 0 or len(y) == 0:
        raise ValueError("Input or output column is empty. Please check your column selections.")
    
    # Handle missing values in features
    for col in X.columns:
        if X[col].dtype in ['int64', 'float64']:
            X[col] = X[col].fillna(X[col].median())
        else:
            X[col] = X[col].fillna(X[col].mode()[0] if not X[col].mode().empty else 'Unknown')
    
    # Encode categorical features
    label_encoders = {}
    for col in X.columns:
        if X[col].dtype == 'object':
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))
            label_encoders[col] = le
    
    # Encode target for classification
    if problem_type == 'classification':
        le_target = LabelEncoder()
        y_encoded = le_target.fit_transform(y.astype(str))
        # Keep as Series with original index
        y = pd.Series(y_encoded, index=y.index, name=y.name)
    else:
        # For regression, convert to numeric
        # First, try to convert - if it's already numeric, this will work
        # If it's string with numbers, this will convert them
        y_numeric = pd.to_numeric(y, errors='coerce')
        
        # Check how many valid values we have
        valid_count = y_numeric.notna().sum()
        total_count = len(y_numeric)
        
        if valid_count == 0:
            # Try to see if we can extract numbers from strings
            if y.dtype == 'object':
                # Try to extract numeric values from strings
                y_extracted = y.astype(str).str.extract(r'([-+]?\d*\.?\d+)', expand=False)
                y_numeric = pd.to_numeric(y_extracted, errors='coerce')
                valid_count = y_numeric.notna().sum()
            
            if valid_count == 0:
                raise ValueError(
                    f"All values in the output column '{output_column}' are invalid for regression. "
                    f"Found {total_count} values, but none could be converted to numeric. "
                    f"Please ensure your output column contains numeric values for regression."
                )
        
        # Drop NaN values and align X
        valid_mask = y_numeric.notna()
        y = y_numeric[valid_mask]
        X = X.loc[valid_mask]
        
        # Log for debugging
        print(f"Regression preprocessing: {valid_count}/{total_count} valid values in output column")
    
    # Check if we have data after filtering
    if len(X) == 0 or len(y) == 0:
        raise ValueError("No valid data remaining after preprocessing. Please check your input and output columns.")
    
    # Remove rows with all NaN in X after conversion (if any remain)
    if len(X) > 0:
        X_valid_mask = X.notna().all(axis=1)
        if X_valid_mask.sum() == 0:
            raise ValueError("All rows have missing values in input columns after preprocessing.")
        X = X[X_valid_mask]
        # Ensure y is a Series and align with X index
        if isinstance(y, pd.Series):
            y = y.loc[X.index]
        else:
            y = pd.Series(y, index=X.index)
    
    # Final check before scaling
    if len(X) == 0 or len(y) == 0:
        raise ValueError("No valid data remaining after preprocessing. Please check your data quality.")
    
    # Ensure X and y have the same length
    if len(X) != len(y):
        # Align them
        common_index = X.index.intersection(y.index)
        if len(common_index) == 0:
            raise ValueError("No matching indices between input and output data after preprocessing.")
        X = X.loc[common_index]
        y = y.loc[common_index]
    
    # Scale features
    if len(X) == 0:
        raise ValueError("No data available for scaling. Please check your input columns.")
    
    scaler = StandardScaler()
    X_scaled = pd.DataFrame(
        scaler.fit_transform(X),
        columns=X.columns,
        index=X.index
    )
    
    # Ensure y is a Series before split and aligned with X_scaled
    if not isinstance(y, pd.Series):
        y = pd.Series(y, index=X_scaled.index)
    elif not y.index.equals(X_scaled.index):
        y = y.loc[X_scaled.index]
    
    # Final validation before split
    if len(X_scaled) < 2:
        raise ValueError(f"Not enough data for train/test split. Need at least 2 samples, got {len(X_scaled)}.")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y if problem_type == 'classification' else None
    )
    
    # Final check after split
    if len(X_train) == 0 or len(X_test) == 0:
        raise ValueError(f"Train/test split resulted in empty sets. Train: {len(X_train)}, Test: {len(X_test)}")
    
    # Ensure outputs are DataFrames/Series (train_test_split may return numpy arrays)
    if not isinstance(X_train, pd.DataFrame):
        X_train = pd.DataFrame(X_train, columns=X_scaled.columns)
    if not isinstance(X_test, pd.DataFrame):
        X_test = pd.DataFrame(X_test, columns=X_scaled.columns)
    if not isinstance(y_train, pd.Series):
        y_train = pd.Series(y_train)
    if not isinstance(y_test, pd.Series):
        y_test = pd.Series(y_test)
    
    return X_train, X_test, y_train, y_test, label_encoders, scaler


def calculate_metrics_classification(y_true, y_pred, y_pred_proba=None) -> Dict[str, float]:
    """Calculate classification metrics"""
    from sklearn.metrics import (
        accuracy_score, precision_score, recall_score, f1_score,
        roc_auc_score, confusion_matrix
    )
    
    metrics = {
        'accuracy': float(accuracy_score(y_true, y_pred)),
        'precision': float(precision_score(y_true, y_pred, average='weighted', zero_division=0)),
        'recall': float(recall_score(y_true, y_pred, average='weighted', zero_division=0)),
        'f1Score': float(f1_score(y_true, y_pred, average='weighted', zero_division=0)),
    }
    
    # Try to calculate ROC AUC if probabilities are available and binary/multiclass
    try:
        if y_pred_proba is not None and len(np.unique(y_true)) <= 2:
            metrics['rocAuc'] = float(roc_auc_score(y_true, y_pred_proba[:, 1] if y_pred_proba.shape[1] > 1 else y_pred_proba))
        elif y_pred_proba is not None:
            metrics['rocAuc'] = float(roc_auc_score(y_true, y_pred_proba, multi_class='ovr', average='weighted'))
    except:
        metrics['rocAuc'] = 0.0
    
    return metrics


def calculate_metrics_regression(y_true, y_pred) -> Dict[str, float]:
    """Calculate regression metrics"""
    from sklearn.metrics import (
        mean_squared_error, mean_absolute_error, r2_score,
        mean_squared_log_error
    )
    
    # Ensure no negative values for MSLE
    y_true_positive = np.maximum(y_true, 0)
    y_pred_positive = np.maximum(y_pred, 0)
    
    metrics = {
        'r2Score': float(r2_score(y_true, y_pred)),
        'meanSquaredError': float(mean_squared_error(y_true, y_pred)),
        'meanAbsoluteError': float(mean_absolute_error(y_true, y_pred)),
        'rootMeanSquaredError': float(np.sqrt(mean_squared_error(y_true, y_pred))),
    }
    
    # Try MSLE if all values are positive
    try:
        if np.all(y_true_positive >= 0) and np.all(y_pred_positive >= 0):
            metrics['meanSquaredLogError'] = float(mean_squared_log_error(y_true_positive, y_pred_positive))
    except:
        pass
    
    return metrics


def select_best_algorithm(results: List[Dict[str, Any]], problem_type: str) -> Dict[str, Any]:
    """
    Select the best algorithm based on metrics and provide justification.
    """
    if not results:
        return None
    
    best_result = None
    best_score = float('-inf')
    justification = ""
    
    if problem_type == 'classification':
        # For classification, prioritize accuracy, then F1 score
        for result in results:
            metrics = result.get('metrics', {})
            # Weighted score: 50% accuracy + 30% F1 + 20% precision
            score = (
                metrics.get('accuracy', 0) * 0.5 +
                metrics.get('f1Score', 0) * 0.3 +
                metrics.get('precision', 0) * 0.2
            )
            
            if score > best_score:
                best_score = score
                best_result = result
        
        if best_result:
            metrics = best_result.get('metrics', {})
            justification = (
                f"This algorithm achieved the best overall performance with an accuracy of "
                f"{metrics.get('accuracy', 0):.2%}, F1 score of {metrics.get('f1Score', 0):.2%}, "
                f"and precision of {metrics.get('precision', 0):.2%}. "
                f"It demonstrates strong predictive capability with balanced performance across all key metrics."
            )
    
    else:  # regression
        # For regression, prioritize R2 score, then RMSE
        for result in results:
            metrics = result.get('metrics', {})
            # Weighted score: 60% R2 + 40% (1 - normalized RMSE)
            r2 = metrics.get('r2Score', 0)
            rmse = metrics.get('rootMeanSquaredError', 0)
            
            # Normalize RMSE (assuming max RMSE is 2x the mean of all RMSEs)
            all_rmses = [r.get('metrics', {}).get('rootMeanSquaredError', 0) for r in results]
            max_rmse = max(all_rmses) if all_rmses else 1
            normalized_rmse = min(rmse / max_rmse if max_rmse > 0 else 1, 1)
            
            score = r2 * 0.6 + (1 - normalized_rmse) * 0.4
            
            if score > best_score:
                best_score = score
                best_result = result
        
        if best_result:
            metrics = best_result.get('metrics', {})
            justification = (
                f"This algorithm achieved the best overall performance with an R² score of "
                f"{metrics.get('r2Score', 0):.4f}, RMSE of {metrics.get('rootMeanSquaredError', 0):.4f}, "
                f"and MAE of {metrics.get('meanAbsoluteError', 0):.4f}. "
                f"It provides the most accurate predictions with the lowest error rates."
            )
    
    return {
        'algorithm': best_result.get('algorithm', ''),
        'metrics': best_result.get('metrics', {}),
        'trainingTime': best_result.get('trainingTime', 0),
        'justification': justification,
        'model': best_result.get('model')  # Store the trained model
    }

