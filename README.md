# ML Model Builder 🚀

Une application web complète pour créer, entraîner et comparer des modèles de machine learning de manière intuitive et automatisée.

## 🎯 Idée Générale du Projet

**ML Model Builder** est une plateforme qui démocratise l'accès au machine learning en offrant une interface simple et guidée pour créer des modèles ML sans écrire de code.

### Concept Principal

L'application permet de :
- ✅ **Créer des modèles ML sans code** : Interface intuitive en 5 étapes
- ✅ **Comparer automatiquement plusieurs algorithmes** : 7-8 algorithmes testés automatiquement
- ✅ **Sélectionner le meilleur modèle** : Algorithme intelligent de sélection basé sur les métriques
- ✅ **Générer une API prête à l'emploi** : Le modèle est sauvegardé et une API REST est créée automatiquement

### Fonctionnalités Principales

#### 1. Interface Wizard Guidée
Un processus en 5 étapes pour créer un modèle :
1. **Configuration** : Nom et description du modèle
2. **Upload** : Import de données CSV (détection automatique du séparateur)
3. **Type de Problème** : Choix entre Classification ou Regression
4. **Mapping** : Sélection des colonnes d'entrée et de sortie
5. **Résultats** : Comparaison de tous les algorithmes et recommandation

#### 2. Preprocessing Automatique
- Détection automatique du séparateur CSV (`,`, `;`, `\t`)
- Gestion des valeurs manquantes
- Encodage des variables catégorielles
- Normalisation des features numériques
- Division train/test (80/20)

#### 3. Entraînement Multi-Algorithmes

**Classification** (7 algorithmes) :
- Logistic Regression
- Random Forest
- Support Vector Machine (SVM)
- K-Nearest Neighbors (KNN)
- Naive Bayes
- Decision Tree
- Gradient Boosting

**Regression** (8 algorithmes) :
- Linear Regression
- Ridge Regression
- Lasso Regression
- Random Forest
- Support Vector Machine (SVR)
- K-Nearest Neighbors
- Decision Tree
- Gradient Boosting

#### 4. Sélection Intelligente
- Calcul automatique des métriques (Accuracy, Precision, Recall, F1, ROC-AUC pour classification / R², RMSE, MAE pour regression)
- Comparaison objective de tous les algorithmes
- Sélection du meilleur avec justification détaillée

#### 5. API Générée Automatiquement
- Sauvegarde du modèle entraîné (format .joblib)
- Endpoint REST pour faire des prédictions
- Documentation de l'API incluse dans l'interface
- Encodage automatique des variables catégorielles lors des prédictions

#### 6. Gestion et Monitoring des Modèles
- **Historique complet** : Sidebar affichant tous les modèles créés
- **Visualisation détaillée** : Modal avec toutes les statistiques et graphiques
- **Monitoring en temps réel** : CPU, RAM, latence pour chaque prédiction
- **Statistiques d'utilisation** : Nombre d'appels API, utilisateurs uniques, dernière utilisation
- **Graphiques de performance** : Évolution des métriques et ressources dans le temps
- **Suppression de modèles** : Gestion complète avec confirmation

## 🏗️ Architecture

```
ml-model-builder/
├── backend/          # API FastAPI (Python)
│   ├── app/
│   │   ├── main.py              # Application principale
│   │   ├── utils.py             # Preprocessing et métriques
│   │   ├── algorithms/          # Algorithmes ML
│   │   │   ├── classification.py
│   │   │   └── regression.py
│   │   ├── uploads/             # Fichiers CSV
│   │   └── models/              # Modèles sauvegardés
│   └── requirements.txt
│
└── frontend/         # Interface Next.js (React/TypeScript)
    ├── app/
    ├── components/
    │   ├── ml-model-builder.tsx
    │   ├── model-wizard-dialog.tsx
    │   └── wizard-steps/        # Étapes du wizard
    └── lib/
        └── api.ts               # Client API
```

## 🚀 Démarrage Rapide

### Prérequis
- Python 3.8+
- Node.js 18+
- npm ou pnpm

### Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd ml-model-builder
```

2. **Backend**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# ou
source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 5000
```

3. **Frontend**
```bash
cd frontend
npm install  # ou pnpm install
npm run dev  # ou pnpm dev
```

4. **Accéder à l'application**
- Frontend : http://localhost:3000
- Backend API : http://localhost:5000

## 📖 Documentation

- [Guide de Configuration](SETUP.md) - Instructions détaillées de configuration
- [Backend README](backend/README.md) - Documentation de l'API backend
- [Comment ça fonctionne](backend/HOW_IT_WORKS.md) - Explication détaillée du système
- [Guide de Test de l'API](backend/API_TESTING_GUIDE.md) - Guide complet pour tester l'API avec exemples

## 🎯 Cas d'Usage

### Pour les Data Scientists
- Prototyper rapidement des modèles ML
- Comparer facilement plusieurs algorithmes
- Obtenir des métriques détaillées pour chaque algorithme

### Pour les Développeurs
- Intégrer du ML dans des applications sans expertise ML
- Obtenir une API REST prête à l'emploi
- Tester rapidement des idées de modèles

### Pour les Étudiants
- Apprendre le machine learning de manière pratique
- Comprendre les différences entre algorithmes
- Voir l'impact du preprocessing sur les performances

### Pour les Entreprises
- Créer des modèles ML sans équipe dédiée
- Prototyper rapidement des solutions ML
- Démocratiser l'accès au ML dans l'organisation

## 🔧 Technologies Utilisées

### Backend
- **FastAPI** : Framework web moderne et rapide
- **scikit-learn** : Bibliothèque ML complète
- **pandas** : Manipulation de données
- **numpy** : Calculs numériques
- **joblib** : Sauvegarde des modèles

### Frontend
- **Next.js** : Framework React avec SSR
- **TypeScript** : Typage statique
- **Tailwind CSS** : Styling utilitaire
- **Radix UI** : Composants UI accessibles
- **PapaParse** : Parsing CSV côté client

## 📝 Notes

- Les fichiers CSV sont stockés dans `backend/app/uploads/`
- Les modèles entraînés sont sauvegardés dans `backend/app/models/`
- Le registre des modèles est stocké dans `backend/app/model_registry.json`
- Le système sélectionne automatiquement le meilleur algorithme
- Une justification est fournie pour expliquer le choix de l'algorithme
- **Important** : Les modèles créés avant la mise à jour de l'encodage doivent être recréés pour supporter les variables catégorielles dans les prédictions

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

Ce projet est sous licence MIT.

