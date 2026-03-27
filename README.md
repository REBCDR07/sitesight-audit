# 🔍 SiteScope – Audit Web Technique & Performance

> **53 % des visiteurs quittent un site si la page met plus de 3 secondes à charger.**  
> Et votre site, il met combien de temps ?

SiteScope est un outil d’audit web tout-en-un qui analyse en profondeur la performance, la santé technique, le SEO, l’accessibilité et l’expérience mobile d’un site.  
Saisissez une URL, obtenez un rapport complet avec scores, priorités d’amélioration et plan d’action.

🌐 **Version live** : [https://sitesight-audit.vercel.app/](https://sitesight-audit.vercel.app/)

---

## ✨ Fonctionnalités

### ⚡ Performance réelle
- TTFB, FCP, LCP, TBT, CLS  
- Temps de chargement total  
- Poids de la page et nombre de requêtes HTTP

### 🔒 Santé technique
- Statut SSL & HTTP  
- Détection CDN  
- Analyse des redirections  
- Compression Gzip/Brotli

### 🏗 Structure & SEO
- Sémantique HTML (balises, headings)  
- Métadonnées (title, meta description, Open Graph)  
- robots.txt et sitemap  
- Accessibilité de base  
- ⚠️ Données structurées *(en cours d’amélioration)*

### 📱 Responsive & Mobile First
- Rendu sur 3 types d’appareils  
- Éléments tactiles (touch targets)  
- Détection des breakpoints et ruptures de layout par viewport

### 📊 Rapport intelligible
- ✅ Ce qui fonctionne bien  
- 🔴 Points bloquants classés par criticité  
- 🛠 Plan d’action avec estimation d’effort  
- 💡 Suggestions d’amélioration avancées *(en cours)*

### 🧮 Score global (0–100)
- Export PDF *(en développement)*

---

## 🚀 Utilisation

1. Rendez-vous sur [https://sitesight-audit.vercel.app/](https://sitesight-audit.vercel.app/)  
2. Saisissez l’URL du site à auditer  
3. Lancez l’analyse  
4. Consultez le rapport détaillé et les recommandations

---

## 🛠 Stack technique

- **Frontend** : ReactJs & TypeScript 
- **Déploiement** : Vercel  
- **API d’audit** : Google API PageSpeed Insight + analyses personnalisées  
- **Styles** : CSS Modules / Tailwind CSS *(selon votre stack réelle)*

---

## 📦 Installation locale

```bash
# Cloner le repository
git clone https://github.com/REBCDR07/sitesight-audit.git
