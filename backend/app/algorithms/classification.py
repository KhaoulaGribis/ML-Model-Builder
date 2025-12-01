"""
Classification algorithms implementation
"""
import time
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier
from typing import Dict, Any, Tuple
import pandas as pd


def train_logistic_regression(X_train, y_train, X_test, y_test) -> Dict[str, Any]:
    """Train Logistic Regression classifier"""
    start_time = time.time()
    
    model = LogisticRegression(max_iter=1000, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test) if hasattr(model, 'predict_proba') else None
    
    training_time = time.time() - start_time
    
    return {
        'algorithm': 'Logistic Regression',
        'model': model,
        'y_pred': y_pred,
        'y_pred_proba': y_pred_proba,
        'trainingTime': training_time
    }


def train_random_forest(X_train, y_train, X_test, y_test) -> Dict[str, Any]:
    """Train Random Forest classifier"""
    start_time = time.time()
    
    model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)
    
    training_time = time.time() - start_time
    
    return {
        'algorithm': 'Random Forest',
        'model': model,
        'y_pred': y_pred,
        'y_pred_proba': y_pred_proba,
        'trainingTime': training_time
    }


def train_svm(X_train, y_train, X_test, y_test) -> Dict[str, Any]:
    """Train Support Vector Machine classifier"""
    start_time = time.time()
    
    model = SVC(probability=True, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)
    
    training_time = time.time() - start_time
    
    return {
        'algorithm': 'Support Vector Machine',
        'model': model,
        'y_pred': y_pred,
        'y_pred_proba': y_pred_proba,
        'trainingTime': training_time
    }


def train_knn(X_train, y_train, X_test, y_test) -> Dict[str, Any]:
    """Train K-Nearest Neighbors classifier"""
    start_time = time.time()
    
    # Use sqrt of n_samples as k, but at least 3 and at most 20
    n_neighbors = min(max(int(np.sqrt(len(X_train))), 3), 20)
    model = KNeighborsClassifier(n_neighbors=n_neighbors, n_jobs=-1)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)
    
    training_time = time.time() - start_time
    
    return {
        'algorithm': 'K-Nearest Neighbors',
        'model': model,
        'y_pred': y_pred,
        'y_pred_proba': y_pred_proba,
        'trainingTime': training_time
    }


def train_naive_bayes(X_train, y_train, X_test, y_test) -> Dict[str, Any]:
    """Train Naive Bayes classifier"""
    start_time = time.time()
    
    model = GaussianNB()
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)
    
    training_time = time.time() - start_time
    
    return {
        'algorithm': 'Naive Bayes',
        'model': model,
        'y_pred': y_pred,
        'y_pred_proba': y_pred_proba,
        'trainingTime': training_time
    }


def train_decision_tree(X_train, y_train, X_test, y_test) -> Dict[str, Any]:
    """Train Decision Tree classifier"""
    start_time = time.time()
    
    model = DecisionTreeClassifier(random_state=42, max_depth=10)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)
    
    training_time = time.time() - start_time
    
    return {
        'algorithm': 'Decision Tree',
        'model': model,
        'y_pred': y_pred,
        'y_pred_proba': y_pred_proba,
        'trainingTime': training_time
    }


def train_gradient_boosting(X_train, y_train, X_test, y_test) -> Dict[str, Any]:
    """Train Gradient Boosting classifier"""
    start_time = time.time()
    
    model = GradientBoostingClassifier(n_estimators=100, random_state=42, max_depth=5)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)
    
    training_time = time.time() - start_time
    
    return {
        'algorithm': 'Gradient Boosting',
        'model': model,
        'y_pred': y_pred,
        'y_pred_proba': y_pred_proba,
        'trainingTime': training_time
    }


def train_all_classification_algorithms(X_train, y_train, X_test, y_test) -> list:
    """Train all classification algorithms"""
    algorithms = [
        train_logistic_regression,
        train_random_forest,
        train_svm,
        train_knn,
        train_naive_bayes,
        train_decision_tree,
        train_gradient_boosting,
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

