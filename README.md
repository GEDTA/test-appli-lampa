# React Template v19 + TypeScript + Vite + Shadcn/ui

Template React moderne avec Tailwind CSS, Shadcn/ui, TanStack Query v5, React Router v7, et connexion au backend .NET.

## 🚀 Stack Technique

- **React 19** - Bibliothèque UI avec les dernières fonctionnalités
- **TypeScript** - Typage statique pour un code plus sûr
- **Vite 7** - Build tool ultra-rapide
- **Tailwind CSS 3** - Framework CSS utility-first
- **Shadcn/ui** - Composants UI modernes basés sur Radix UI
- **TanStack Query v5** - Gestion de l'état serveur (React Query)
- **React Router v7** - Routing côté client
- **Axios** - Client HTTP pour les appels API
- **Recharts** - Bibliothèque de graphiques React
- **Lucide React** - Icônes modernes

## 📁 Structure du Projet

```
src/
├── api/                    # Configuration API et services
│   ├── axios.client.ts     # Client Axios configuré
│   └── todo.api.ts         # Services API Todo
├── components/             # Composants réutilisables
│   ├── ui/                 # Composants Shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   └── badge.tsx
│   ├── AppLayout.tsx       # Layout principal avec navigation
│   ├── StatsCard.tsx       # Carte de statistiques
│   ├── TodoCard.tsx        # Carte d'affichage Todo
│   └── TodoDialog.tsx      # Dialog de création Todo
├── hooks/                  # Hooks personnalisés
│   └── useTodos.ts         # Hooks TanStack Query pour Todos
├── lib/                    # Utilitaires
│   └── utils.ts            # Fonctions utilitaires (cn, etc.)
├── pages/                  # Pages de l'application
│   ├── Dashboard.tsx       # Page dashboard avec stats et graphiques
│   └── TodoList.tsx        # Page liste des todos avec filtres
├── types/                  # Types TypeScript
│   └── todo.types.ts       # Types et interfaces Todo
├── App.tsx                 # Composant racine
├── main.tsx                # Point d'entrée
└── index.css               # Styles globaux et variables CSS Tailwind
```

## 🛠️ Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Build pour la production
npm run build

# Preview du build de production
npm run preview
```

## 🌐 Configuration API

Le frontend se connecte au backend .NET sur `http://localhost:5136/api`.

Pour modifier l'URL de l'API, créez un fichier `.env` :

```env
VITE_API_URL=http://localhost:5136/api
```

## ✨ Fonctionnalités

### Dashboard
- **Cartes statistiques** : Total, Terminées, En cours, Taux de complétion
- **Graphique en camembert** : Répartition par priorité
- **Graphique en barres** : Statut des tâches (En cours/Terminées)
- **Design responsive** avec animations de hover

### Gestion des Tâches
- **Liste avec filtres** : Toutes / En cours / Terminées
- **Création** : Dialog avec formulaire complet
- **Modification** : Édition inline des tâches
- **Suppression** : Avec confirmation
- **Toggle completion** : Cocher/décocher directement
- **Priorités** : Basse (vert), Moyenne (jaune), Haute (rouge)
- **États visuels** : Badges de priorité et de statut

## 🎨 Système de Design

### Shadcn/ui
Les composants sont basés sur **Radix UI** pour l'accessibilité et **Tailwind CSS** pour le styling. Tous les composants sont personnalisables et réutilisables.

### Thème
Le thème utilise des variables CSS pour une personnalisation facile :

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  --destructive: 0 84.2% 60.2%;
  --muted: 210 40% 96.1%;
  /* ... */
}
```

### Couleurs
- **Primary** : Bleu (#3b82f6) - Actions principales
- **Success** : Vert (#10b981) - Tâches terminées, priorité basse
- **Warning** : Orange (#f59e0b) - Tâches en cours, priorité moyenne
- **Destructive** : Rouge (#ef4444) - Suppressions, priorité haute
- **Violet** : (#8b5cf6) - Taux de complétion

## 🔧 Utilitaires

### Hook useTodos
Hooks TanStack Query pré-configurés :
- `useTodos()` - Liste complète
- `useTodo(id)` - Un todo par ID
- `useCompletedTodos()` - Todos terminés
- `usePendingTodos()` - Todos en attente
- `useCreateTodo()` - Création
- `useUpdateTodo()` - Mise à jour
- `useDeleteTodo()` - Suppression
- `useToggleTodo()` - Toggle completion

### Fonction cn()
Utilitaire pour fusionner des classes Tailwind :
```typescript
import { cn } from '@/lib/utils';

<div className={cn('base-class', condition && 'conditional-class')} />
```

## 📦 Scripts Disponibles

- `npm run dev` - Serveur de développement avec HMR
- `npm run build` - Build optimisé pour production
- `npm run preview` - Preview du build de production
- `npm run lint` - Lint du code avec ESLint

## 🔄 Migration depuis MUI

Ce template a été migré de Material-UI vers Shadcn/ui pour :
- ✅ **Meilleure compatibilité LLM** : API plus simple et prédictible
- ✅ **Bundle size réduit** : Seulement ce dont vous avez besoin
- ✅ **Personnalisation complète** : Contrôle total sur les styles
- ✅ **Performance** : Tailwind CSS JIT ultra-rapide
- ✅ **Maintenance** : Moins de dépendances externes

## 🚀 Prochaines Étapes

1. **Backend** : S'assurer que le backend .NET tourne sur `http://localhost:5136`
2. **Tests** : Ajouter des tests unitaires avec Vitest
3. **Authentification** : Implémenter JWT auth si nécessaire
4. **Formulaires** : Intégrer React Hook Form pour validation avancée
5. **Notifications** : Ajouter Sonner pour les toasts

## 📝 Remarques

- **Node.js** : Version 20.19+ ou 22.12+ recommandée (warnings avec v20.14.0)
- **TypeScript** : Mode strict activé avec `verbatimModuleSyntax`
- **Hot Reload** : Activé par défaut en développement
- **Path Alias** : `@/` pointe vers `./src/`

## 📄 Licence

MIT
