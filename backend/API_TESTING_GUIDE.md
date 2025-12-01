# Guide de Test de l'API ML Model Builder

Ce guide explique comment tester l'API pour faire des prédictions avec vos modèles entraînés.

## Prérequis

1. Le serveur backend doit être démarré (port 5000 par défaut)
2. Vous devez avoir au moins un modèle entraîné (via l'interface web)

## Endpoints Disponibles

### 1. Lister tous les modèles

**GET** `/api/models`

```bash
curl http://localhost:5000/api/models
```

**Réponse:**
```json
[
  {
    "modelId": "ceec5bea-0b19-4535-a823-daba2c600057",
    "name": "bank model",
    "description": "bank model with a bank dataset",
    "createdAt": "2025-12-01T17:19:44.084655",
    "problemType": "classification",
    "algorithm": "Naive Bayes",
    "metrics": {
      "accuracy": 0.8795580110497238,
      "precision": 0.816431323506113,
      "recall": 0.8795580110497238,
      "f1Score": 0.8341617154069031,
      "rocAuc": 0.6068196004993758
    },
    "inputColumns": ["age", "job", "education", "balance"],
    "outputColumn": "y"
  }
]
```

### 2. Obtenir les détails d'un modèle

**GET** `/api/models/{modelId}`

```bash
curl http://localhost:5000/api/models/ceec5bea-0b19-4535-a823-daba2c600057
```

### 3. Faire une prédiction (TESTER L'API)

**POST** `/api/predict`

#### Exemple avec cURL

```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "modelId": "ceec5bea-0b19-4535-a823-daba2c600057",
    "features": {
      "age": 30,
      "job": "admin",
      "education": "secondary",
      "balance": 1000
    },
    "userId": "user-123"
  }'
```

#### Exemple avec Python

```python
import requests
import json

# URL de l'API
url = "http://localhost:5000/api/predict"

# Données de la requête
data = {
    "modelId": "ceec5bea-0b19-4535-a823-daba2c600057",  # Remplacez par votre modelId
    "features": {
        "age": 30,
        "job": "admin",
        "education": "secondary",
        "balance": 1000
    },
    "userId": "user-123"  # Optionnel
}

# Envoyer la requête
response = requests.post(url, json=data)

# Afficher la réponse
print("Status Code:", response.status_code)
print("Response:", json.dumps(response.json(), indent=2))
```

#### Exemple avec JavaScript/Node.js

```javascript
const fetch = require('node-fetch'); // ou utilisez fetch natif dans le navigateur

const url = 'http://localhost:5000/api/predict';
const data = {
  modelId: 'ceec5bea-0b19-4535-a823-daba2c600057', // Remplacez par votre modelId
  features: {
    age: 30,
    job: 'admin',
    education: 'secondary',
    balance: 1000
  },
  userId: 'user-123' // Optionnel
};

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data)
})
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
```

#### Exemple avec Postman

1. Créez une nouvelle requête POST
2. URL: `http://localhost:5000/api/predict`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "modelId": "ceec5bea-0b19-4535-a823-daba2c600057",
  "features": {
    "age": 30,
    "job": "admin",
    "education": "secondary",
    "balance": 1000
  },
  "userId": "user-123"
}
```

**Réponse réussie:**
```json
{
  "prediction": 0,
  "probabilities": [0.85, 0.15],
  "algorithm": "Naive Bayes",
  "problemType": "classification",
  "latencyMs": 12.5,
  "cpuPercent": 15.2,
  "memoryMB": 245.8
}
```

**Réponse en cas d'erreur:**
```json
{
  "detail": "Missing feature: age"
}
```

### 4. Supprimer un modèle

**DELETE** `/api/models/{modelId}`

```bash
curl -X DELETE http://localhost:5000/api/models/ceec5bea-0b19-4535-a823-daba2c600057
```

## Comment obtenir votre modelId

1. Via l'interface web: Cliquez sur un modèle dans l'historique, puis ouvrez les détails. Le `modelId` est affiché.
2. Via l'API: Appelez `GET /api/models` pour lister tous les modèles et récupérer leurs IDs.

## Structure de la requête de prédiction

### Champs requis

- **modelId** (string): L'identifiant unique du modèle
- **features** (object): Un objet contenant les valeurs des colonnes d'entrée (inputColumns)

### Champs optionnels

- **userId** (string): Identifiant de l'utilisateur pour le suivi des statistiques

### Important: Colonnes d'entrée

Les colonnes d'entrée (`inputColumns`) varient selon le modèle. Pour connaître les colonnes requises:

1. Consultez les détails du modèle via `GET /api/models/{modelId}`
2. Regardez le champ `inputColumns` dans la réponse

Exemple:
```json
{
  "inputColumns": ["age", "job", "education", "balance"],
  "outputColumn": "y"
}
```

Dans ce cas, vous devez fournir exactement ces 4 colonnes dans `features`.

## Types de problèmes

### Classification
- Retourne un entier (classe prédite)
- Inclut `probabilities` (probabilités pour chaque classe)

### Regression
- Retourne un nombre décimal (valeur prédite)
- Pas de `probabilities`

## Suivi des statistiques

Chaque appel à `/api/predict` met automatiquement à jour:
- Le nombre total d'appels (`totalCalls`)
- Les utilisateurs uniques (`uniqueUsers`)
- La dernière utilisation (`lastUsed`)
- Le monitoring des ressources (CPU, RAM, latence)

Ces statistiques sont visibles dans les détails du modèle via l'interface web ou `GET /api/models/{modelId}`.

## Exemples de scripts de test

### Script Python complet

```python
import requests
import json

# Configuration
API_URL = "http://localhost:5000"
MODEL_ID = "ceec5bea-0b19-4535-a823-daba2c600057"  # Remplacez par votre modelId

# 1. Lister tous les modèles
print("=== Liste des modèles ===")
response = requests.get(f"{API_URL}/api/models")
models = response.json()
print(json.dumps(models, indent=2))

# 2. Obtenir les détails d'un modèle
print(f"\n=== Détails du modèle {MODEL_ID} ===")
response = requests.get(f"{API_URL}/api/models/{MODEL_ID}")
model_details = response.json()
print(f"Nom: {model_details['name']}")
print(f"Type: {model_details['problemType']}")
print(f"Algorithm: {model_details['algorithm']}")
print(f"Colonnes d'entrée: {model_details['inputColumns']}")

# 3. Faire une prédiction
print(f"\n=== Prédiction ===")
prediction_data = {
    "modelId": MODEL_ID,
    "features": {
        "age": 30,
        "job": "admin",
        "education": "secondary",
        "balance": 1000
    },
    "userId": "test-user-1"
}

response = requests.post(f"{API_URL}/api/predict", json=prediction_data)
result = response.json()
print(f"Prédiction: {result['prediction']}")
if 'probabilities' in result:
    print(f"Probabilités: {result['probabilities']}")
print(f"Latence: {result['latencyMs']}ms")
print(f"CPU: {result['cpuPercent']}%")
print(f"Mémoire: {result['memoryMB']}MB")
```

### Script Bash (cURL)

```bash
#!/bin/bash

API_URL="http://localhost:5000"
MODEL_ID="ceec5bea-0b19-4535-a823-daba2c600057"  # Remplacez par votre modelId

echo "=== Liste des modèles ==="
curl -s "${API_URL}/api/models" | jq '.'

echo -e "\n=== Détails du modèle ==="
curl -s "${API_URL}/api/models/${MODEL_ID}" | jq '.'

echo -e "\n=== Prédiction ==="
curl -X POST "${API_URL}/api/predict" \
  -H "Content-Type: application/json" \
  -d "{
    \"modelId\": \"${MODEL_ID}\",
    \"features\": {
      \"age\": 30,
      \"job\": \"admin\",
      \"education\": \"secondary\",
      \"balance\": 1000
    },
    \"userId\": \"test-user-1\"
  }" | jq '.'
```

## Dépannage

### Erreur 404: Model not found
- Vérifiez que le `modelId` est correct
- Vérifiez que le modèle existe via `GET /api/models`

### Erreur 400: Missing feature
- Vérifiez que toutes les colonnes d'entrée sont fournies
- Vérifiez les noms des colonnes (respectez la casse et les espaces)

### Erreur 500: Internal server error
- Vérifiez les logs du serveur backend
- Vérifiez que le fichier `.joblib` du modèle existe dans `backend/app/models/`

## Notes

- Les valeurs des features doivent correspondre au type attendu par le modèle
- Pour les modèles de classification, les valeurs catégorielles doivent correspondre exactement aux valeurs vues pendant l'entraînement
- Le `userId` est optionnel mais recommandé pour le suivi des statistiques

