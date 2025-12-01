# ML Model Builder - Backend API

Backend FastAPI pour l'application ML Model Builder.

## 🎯 Idée Générale du Projet

**ML Model Builder** est une application web complète qui permet de créer, entraîner et comparer des modèles de machine learning de manière intuitive et automatisée.

### Concept Principal

L'application vise à **démocratiser l'accès au machine learning** en offrant une interface simple et guidée pour :
- **Créer des modèles ML sans code** : Les utilisateurs n'ont pas besoin de connaître Python ou les bibliothèques ML
- **Comparer automatiquement plusieurs algorithmes** : Le système teste automatiquement 7-8 algorithmes différents
- **Sélectionner le meilleur modèle** : Un algorithme de sélection automatique choisit le meilleur modèle basé sur les métriques de performance
- **Générer une API prête à l'emploi** : Le modèle sélectionné est automatiquement sauvegardé et une API REST est générée pour l'utiliser

### Fonctionnalités Clés

1. **Interface Wizard Guidée** : Un processus en 5 étapes pour créer un modèle
   - Configuration du modèle (nom, description)
   - Upload de données CSV
   - Sélection du type de problème (Classification/Regression)
   - Mapping des colonnes (inputs/outputs)
   - Comparaison et résultats des algorithmes

2. **Preprocessing Automatique** :
   - Détection automatique du séparateur CSV (virgule, point-virgule, tabulation)
   - Gestion des valeurs manquantes
   - Encodage des variables catégorielles
   - Normalisation des features numériques
   - Division train/test automatique

3. **Entraînement Multi-Algorithmes** :
   - **Classification** : 7 algorithmes (Logistic Regression, Random Forest, SVM, KNN, Naive Bayes, Decision Tree, Gradient Boosting)
   - **Regression** : 8 algorithmes (Linear, Ridge, Lasso, Random Forest, SVR, KNN, Decision Tree, Gradient Boosting)

4. **Sélection Intelligente** :
   - Calcul automatique de toutes les métriques de performance
   - Comparaison objective de tous les algorithmes
   - Sélection du meilleur avec justification détaillée

5. **API Générée Automatiquement** :
   - Sauvegarde du modèle entraîné
   - Endpoint REST pour faire des prédictions
   - Documentation de l'API incluse

### Architecture

- **Frontend** : Next.js avec React, TypeScript, Tailwind CSS
- **Backend** : FastAPI (Python) avec scikit-learn
- **Stockage** : Fichiers locaux (CSV, modèles .joblib)

### Public Cible

- **Data Scientists** : Pour prototyper rapidement et comparer des algorithmes
- **Développeurs** : Pour intégrer du ML dans leurs applications sans expertise ML
- **Étudiants** : Pour apprendre le machine learning de manière pratique
- **Entreprises** : Pour créer des modèles ML sans équipe dédiée

## Installation

1. Créer un environnement virtuel (déjà fait si vous voyez le dossier `venv/`)
2. Activer l'environnement virtuel:
   ```bash
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. Installer les dépendances:
   ```bash
   pip install -r requirements.txt
   ```

## Démarrage

Lancer le serveur FastAPI:

```bash
python -m uvicorn app.main:app --reload --port 5000
```

Ou directement:

```bash
python app/main.py
```

Le serveur sera accessible sur `http://localhost:5000`

## Endpoints API

### 1. Créer un modèle
```
POST /api/models
Body: { "name": "string", "description": "string" }
```

### 2. Uploader un fichier CSV
```
POST /api/upload
Body: FormData avec fichier CSV
Response: { "uploadId": "uuid", "columns": [...], "rows": number }
```

### 3. Analyser les données
```
POST /api/analyze
Body: {
  "uploadId": "string",
  "problemType": "classification" | "regression",
  "inputColumns": ["col1", "col2", ...],
  "outputColumn": "target_col"
}
Response: {
  "modelId": "uuid",
  "recommended": { algorithm, metrics, justification },
  "results": [ { algorithm, metrics, trainingTime }, ... ]
}
```

### 4. Faire une prédiction
```
POST /api/predict
Body: {
  "modelId": "string",
  "features": { "col1": value1, "col2": value2, ... }
}
```

### 5. Obtenir les informations d'un modèle
```
GET /api/models/{model_id}
```

## Algorithmes implémentés

### Classification
- Logistic Regression
- Random Forest
- Support Vector Machine (SVM)
- K-Nearest Neighbors (KNN)
- Naive Bayes
- Decision Tree
- Gradient Boosting

### Regression
- Linear Regression
- Ridge Regression
- Lasso Regression
- Random Forest
- Support Vector Machine (SVR)
- K-Nearest Neighbors
- Decision Tree
- Gradient Boosting

## Structure des dossiers

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Application FastAPI principale
│   ├── utils.py             # Fonctions utilitaires (preprocessing, métriques)
│   ├── algorithms/
│   │   ├── __init__.py
│   │   ├── classification.py  # Algorithmes de classification
│   │   └── regression.py      # Algorithmes de régression
│   ├── uploads/             # Fichiers CSV uploadés
│   ├── models/              # Modèles ML sauvegardés (.joblib)
│   └── results/             # Résultats d'analyse
├── requirements.txt
└── README.md
```

## Notes

- Les fichiers CSV sont stockés dans `app/uploads/`
- Les modèles entraînés sont sauvegardés dans `app/models/` au format `.joblib`
- Le système sélectionne automatiquement le meilleur algorithme basé sur les métriques de performance
- Une justification est fournie pour expliquer pourquoi un algorithme a été choisi

