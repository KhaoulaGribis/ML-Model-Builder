# Guide de Configuration - ML Model Builder

## 🚀 Démarrage Rapide

### 1. Backend (FastAPI)

```bash
cd backend

# Activer l'environnement virtuel
venv\Scripts\activate  # Windows
# ou
source venv/bin/activate  # Linux/Mac

# Installer les dépendances
pip install -r requirements.txt

# Démarrer le serveur
python -m uvicorn app.main:app --reload --port 5000
```

Ou utilisez le script:
- Windows: `start.bat`
- Linux/Mac: `chmod +x start.sh && ./start.sh`

Le backend sera accessible sur: **http://localhost:5000**

### 2. Frontend (Next.js)

```bash
cd frontend

# Installer les dépendances (si pas déjà fait)
npm install
# ou
pnpm install

# Démarrer le serveur de développement
npm run dev
# ou
pnpm dev
```

Le frontend sera accessible sur: **http://localhost:3000**

## ✅ Vérification de la Connexion

1. **Vérifiez que le backend est démarré:**
   - Ouvrez http://localhost:5000 dans votre navigateur
   - Vous devriez voir: `{"message":"ML Model Builder API","version":"1.0.0"}`

2. **Vérifiez que le frontend peut communiquer:**
   - Ouvrez la console du navigateur (F12)
   - Les erreurs de connexion apparaîtront si le backend n'est pas accessible

## 🔧 Problèmes Courants

### Le frontend ne peut pas se connecter au backend

1. **Vérifiez que le backend est démarré** sur le port 5000
2. **Vérifiez l'URL de l'API** dans `frontend/lib/api.ts` (par défaut: `http://localhost:5000`)
3. **Vérifiez les CORS** - Le backend autorise `localhost:3000` par défaut

### Erreur lors de l'upload du CSV

- Vérifiez que le fichier est bien un CSV
- Vérifiez que le backend a les permissions d'écriture dans `backend/app/uploads/`

### Erreur lors de l'analyse

- Vérifiez que vous avez sélectionné:
  - ✅ Un type de problème (Classification ou Regression)
  - ✅ Au moins une colonne d'entrée (Input Features)
  - ✅ Une colonne de sortie (Output Target)
- Vérifiez la console du navigateur pour les détails de l'erreur

## 📝 Notes Importantes

- **Les algorithmes sont automatiquement testés** - Vous n'avez pas besoin de choisir un algorithme spécifique
- **Le meilleur algorithme est sélectionné automatiquement** basé sur les métriques de performance
- **Les modèles sont sauvegardés** dans `backend/app/models/` après l'analyse
- **Les fichiers CSV sont stockés** dans `backend/app/uploads/`

## 🎯 Flux de l'Application

1. **Step 1:** Entrer le nom et la description du modèle
2. **Step 2:** Uploader un fichier CSV
3. **Step 3:** Choisir Classification ou Regression
4. **Step 4:** Sélectionner les colonnes d'entrée et de sortie
5. **Step 5:** Voir les résultats de tous les algorithmes et le meilleur recommandé

## 🔍 Debug

Pour voir les logs du backend, regardez la console où vous avez lancé `uvicorn`.

Pour voir les logs du frontend, ouvrez la console du navigateur (F12) et allez dans l'onglet "Console".

