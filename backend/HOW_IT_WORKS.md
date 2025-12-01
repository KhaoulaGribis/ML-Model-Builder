# Comment le système fonctionne

## ✅ Oui, le système fait automatiquement tout ce qui est demandé !

### 1. 📊 Analyse automatique des données

Quand vous arrivez à l'étape 5 (Results), le système :

1. **Upload le CSV** vers le backend (si pas déjà fait)
2. **Charge et parse le CSV** avec pandas
3. **Préprocesse automatiquement les données** :
   - Gère les valeurs manquantes
   - Encode les variables catégorielles
   - Normalise les features numériques
   - Divise en train/test (80/20)

### 2. 🤖 Entraîne plusieurs algorithmes

Le système entraîne **automatiquement TOUS** les algorithmes disponibles :

#### Pour Classification (7 algorithmes) :
- Logistic Regression
- Random Forest
- Support Vector Machine (SVM)
- K-Nearest Neighbors (KNN)
- Naive Bayes
- Decision Tree
- Gradient Boosting

#### Pour Regression (8 algorithmes) :
- Linear Regression
- Ridge Regression
- Lasso Regression
- Random Forest
- Support Vector Machine (SVR)
- K-Nearest Neighbors
- Decision Tree
- Gradient Boosting

**Chaque algorithme est entraîné sur les mêmes données** pour une comparaison équitable.

### 3. 🏆 Sélectionne le meilleur modèle

Après l'entraînement, le système :

1. **Calcule les métriques** pour chaque algorithme :
   - **Classification** : Accuracy, Precision, Recall, F1-Score, ROC-AUC
   - **Regression** : R² Score, RMSE, MAE, MSE

2. **Compare tous les résultats** et sélectionne le meilleur :
   - **Classification** : Score combiné basé sur Accuracy (50%), F1 (30%), Precision (20%)
   - **Regression** : Score combiné basé sur R² (60%) et RMSE normalisé (40%)

3. **Génère une justification** expliquant pourquoi cet algorithme a été choisi

### 4. 🔌 Génère une API pour utiliser le modèle

Le modèle sélectionné est **automatiquement sauvegardé** et une API est disponible :

#### Endpoint de prédiction :
```
POST /api/predict
Body: {
  "modelId": "uuid-du-modele",
  "features": {
    "colonne1": valeur1,
    "colonne2": valeur2,
    ...
  }
}
```

#### Exemple d'utilisation :

```python
import requests

response = requests.post("http://localhost:5000/api/predict", json={
    "modelId": "votre-model-id",
    "features": {
        "age": 30,
        "salary": 50000,
        "job": "engineer"
    }
})

prediction = response.json()
print(f"Prédiction: {prediction['prediction']}")
print(f"Algorithme utilisé: {prediction['algorithm']}")
```

#### Obtenir les infos du modèle :
```
GET /api/models/{model_id}
```

## 📁 Où sont stockés les modèles ?

- **Modèles sauvegardés** : `backend/app/models/*.joblib`
- **Fichiers CSV** : `backend/app/uploads/*.csv`
- **Résultats** : `backend/app/results/`

## 🔍 Flux complet

```
1. Upload CSV → Backend sauvegarde le fichier
2. Sélection colonnes → Frontend envoie input/output columns
3. Analyse → Backend:
   a. Charge le CSV
   b. Préprocesse les données
   c. Entraîne TOUS les algorithmes
   d. Calcule les métriques
   e. Sélectionne le meilleur
   f. Sauvegarde le modèle
   g. Retourne les résultats
4. Affichage → Frontend montre tous les résultats + le meilleur
5. API disponible → Le modèle peut être utilisé via /api/predict
```

## ⚠️ Résolution du problème des colonnes

Le problème "column 'job' not found" était dû à des espaces dans les noms de colonnes. 

**Correction appliquée** :
- Les colonnes sont maintenant normalisées (espaces supprimés)
- Meilleure gestion des erreurs avec liste des colonnes disponibles
- Validation améliorée avec messages d'erreur plus clairs

## 🎯 Résumé

**OUI**, le système fait tout automatiquement :
- ✅ Analyse les données
- ✅ Entraîne plusieurs algorithmes
- ✅ Sélectionne le meilleur
- ✅ Génère une API pour utiliser le modèle

Vous n'avez qu'à :
1. Uploader votre CSV
2. Choisir Classification ou Regression
3. Sélectionner les colonnes
4. Attendre les résultats !

