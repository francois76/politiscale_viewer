# Visualiseur PolitiScales 3D

Une application web interactive pour visualiser les résultats du test politique PolitiScales en 3D.

## 🚀 Fonctionnalités

- **Visualisation 3D interactive** : Navigation fluide avec Three.js
- **Saisie complète des données** : Interface pour tous les 8 axes de PolitiScales
- **Analyse automatique** : Détection de clusters et projection ACP
- **Import/Export CSV** : Sauvegarde et partage des données
- **Interface moderne** : Design responsive avec Tailwind CSS
- **Stockage local** : Persistance automatique des données

## 🛠️ Technologies

- **Framework** : React 19 + TypeScript
- **Build** : Vite
- **3D** : Three.js
- **Styling** : Tailwind CSS
- **Icons** : Lucide React

## 📋 Pré-requis

- Node.js 18+
- Bun

## 🏁 Installation

1. **Cloner le projet**

```bash
git clone <url-du-repo>
cd politiscale_viewer
```

2. **Installer les dépendances**

```bash
bun install
```

3. **Lancer en développement**

```bash
bun dev
```

4. **Ouvrir dans le navigateur**

```
http://localhost:5173
```

## 📦 Scripts disponibles

```bash
# Développement avec hot reload
bun dev

# Build pour production
bun build

# Preview du build
bun preview

# Lint du code
bun lint
```

## 📁 Structure du projet

```
├── src/
│   ├── components/         # Composants React
│   ├── App.tsx            # Composant principal
│   └── main.tsx           # Point d'entrée React
├── public/                # Assets statiques
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 🎮 Utilisation

### Ajouter des données

1. Cliquer sur "Ajouter une entrée"
2. Remplir le pseudo et choisir une couleur
3. Saisir les valeurs pour chaque axe (0-100%)
4. Valider pour ajouter au graphique

### Navigation 3D

- **Rotation** : Clic + glisser
- **Zoom** : Molette de la souris
- **Survol** : Affiche les détails du point

### Gestion des données

- **Export CSV** : Sauvegarde toutes les entrées
- **Import CSV** : Charge des données externes
- **Reset** : Supprime toutes les données

## 📊 Axes PolitiScales

L'application supporte les 8 axes du test PolitiScales :

1. **Constructivisme** ↔ **Essentialisme**
2. **Justice Réhabilitative** ↔ **Justice Punitive**
3. **Progressisme** ↔ **Conservatisme**
4. **Internationalisme** ↔ **Nationalisme**
5. **Communisme** ↔ **Capitalisme**
6. **Régulation** ↔ **Laissez-faire**
7. **Écologie** ↔ **Productivisme**
8. **Révolution** ↔ **Réformisme**

## 🔧 Configuration

### TypeScript

Configuration dans `tsconfig.json` avec support des imports absolus.

### Serveur de développement

Le serveur Bun personnalisé dans `src/server.ts` gère :

- Hot reload automatique
- Serveur de fichiers statiques
- Routing SPA

## 🚀 Déploiement

### Build de production

```bash
bun build
```

### Preview local

```bash
bun preview
```

### Déploiement cloud

Déployé sur vercel

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 🐛 Bugs connus
