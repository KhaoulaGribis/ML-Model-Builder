"""
Regression algorithms implementation
"""
import time
import numpy as np
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.svm import SVR
from sklearn.neighbors import KNeighborsRegressor
from sklearn.tree import DecisionTreeRegressor
from typing import Dict, Any
import pandas as pd


def train_linear_regression(X_train, y_train, X_test, y_test) -> Dict[str, Any]:
    """Train Linear Regression"""
    start_time = time.time()
    
    model = LinearRegression(n_jobs=-1)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    
    training_time = time.time() - start_time
    
    return {
        'algorithm': 'Linear Regression',
        'model': model,
        'y_pred': y_pred,
        'trainingTime': training_time
    }


def train_ridge_regression(X_train, y_train, X_test, y_test) -> Dict[str, Any]:
    """Train Ridge Regression"""
    start_time = time.time()
    
    model = Ridge(alpha=1.0, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    
    training_time = time.time() - start_time
    
    return {
        'algorithm': 'Ridge Regression',
        'model': model,
        'y_pred': y_pred,
        'trainingTime': training_time
    }


def train_lasso_regression(X_train, y_train, X_test, y_test) -> Dict[str, Any]:
    """Train Lasso Regression"""
    start_time = time.time()
    
    model = Lasso(alpha=1.0, random_state=42, max_iter=1000)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    
    training_time = time.time() - start_time
    
    return {
        'algorithm': 'Lasso Regression',
        'model': model,
        'y_pred': y_pred,
        'trainingTime': training_time
    }


def train_random_forest_regressor(X_train, y_train, X_test, y_test) -> Dict[str, Any]:
    """Train Random Forest Regressor"""
    start_time = time.time()
    
    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    
    training_time = time.time() - start_time
    
    return {
        'algorithm': 'Random Forest',
        'model': model,
        'y_pred': y_pred,
        'trainingTime': training_time
    }


def train_svr(X_train, y_train, X_test, y_test) -> Dict[str, Any]:
    """Train Support Vector Regressor"""
    start_time = time.time()
    
    model = SVR(kernel='rbf')
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    
    training_time = time.time() - start_time
    
    return {
        'algorithm': 'Support Vector Machine',
        'model': model,
        'y_pred': y_pred,
        'trainingTime': training_time
    }


def train_knn_regressor(X_train, y_train, X_test, y_test) -> Dict[str, Any]:
    """Train K-Nearest Neighbors Regressor"""
    start_time = time.time()
    
    n_neighbors = min(max(int(np.sqrt(len(X_train))), 3), 20)
    model = KNeighborsRegressor(n_neighbors=n_neighbors, n_jobs=-1)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    
    training_time = time.time() - start_time
    
    return {
        'algorithm': 'K-Nearest Neighbors',
        'model': model,
        'y_pred': y_pred,
        'trainingTime': training_time
    }


def train_decision_tree_regressor(X_train, y_train, X_test, y_test) -> Dict[str, Any]:
    """Train Decision Tree Regressor"""
    start_time = time.time()
    
    model = DecisionTreeRegressor(random_state=42, max_depth=10)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    
    training_time = time.time() - start_time
    
    return {
        'algorithm': 'Decision Tree',
        'model': model,
        'y_pred': y_pred,
        'trainingTime': training_time
    }


def train_gradient_boosting_regressor(X_train, y_train, X_test, y_test) -> Dict[str, Any]:
    """Train Gradient Boosting Regressor"""
    start_time = time.time()
    
    model = GradientBoostingRegressor(n_estimators=100, random_state=42, max_depth=5)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    
    training_time = time.time() - start_time
    
    return {
        'algorithm': 'Gradient Boosting',
        'model': model,
        'y_pred': y_pred,
        'trainingTime': training_time
    }


def train_all_regression_algorithms(X_train, y_train, X_test, y_test) -> list:
    """Train all regression algorithms"""
    algorithms = [
        train_linear_regression,
        train_ridge_regression,
        train_lasso_regression,
        train_random_forest_regressor,
        train_svr,
        train_knn_regressor,
        train_decision_tree_regressor,
        train_gradient_boosting_regressor,
    ]
    
    results = []
    for algo_func in algorithms:
        try:
            result = algo_func(X_train, y_train, X_test, y_test)
            results.append(result)
        except Exception as e:
            print(f"Error training {algo_func.__name__}: {str(e)}")
            continue
    
    return results

