# 🤖 Abdy AI — Assistant Personnel

Assistant IA personnel de **Abdy Mohameden**, construit avec React.js + Tailwind CSS + API Anthropic Claude.

## 🚀 Installation sur Ubuntu

```bash
# 1. Déplace le dossier dans ton home
mv abdy-ai ~/
cd ~/abdy-ai

# 2. Installe les dépendances
npm install

# 3. Lance l'application
npm start
```

L'app s'ouvre automatiquement sur http://localhost:3000

## 🔑 Clé API Anthropic (GRATUIT)

1. Va sur https://console.anthropic.com
2. Crée un compte gratuit
3. Dans l'app → clique ⚙️ → colle ta clé API
4. Elle est sauvegardée localement dans ton navigateur

## 📁 Structure
```
abdy-ai/
├── public/index.html
├── src/
│   ├── App.js          ← Composant principal
│   ├── index.js
│   └── index.css       ← Tailwind + styles
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## ✨ Fonctionnalités
- 💬 Chat en temps réel avec Claude AI
- 🧠 Personnalisé pour Abdy Mohameden
- 🌍 Répond en français, arabe ou anglais
- 📝 Rendu Markdown (code, listes, etc.)
- ⏱️ Horodatage des messages
- 💾 Clé API sauvegardée localement
- 🚀 Suggestions de questions rapides
