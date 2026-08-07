# Modifier le site EcoTrips Women

Tout le contenu du site se modifie depuis une page d'administration, sans toucher au code.

---

## 1. Mise en route (une seule fois)

### a. Créer le projet Sanity

1. Va sur [sanity.io](https://www.sanity.io) et crée un compte gratuit.
2. Crée un nouveau projet, nomme-le **EcoTrips Women**.
3. Choisis le jeu de données **production**.
4. Note l'**identifiant du projet** (Project ID), une suite de 8 caractères.

### b. Renseigner l'identifiant

À la racine du site, crée un fichier nommé `.env.local` contenant :

```
NEXT_PUBLIC_SANITY_PROJECT_ID=ton-identifiant
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=ton-jeton
```

Le jeton se crée sur [sanity.io/manage](https://sanity.io/manage) → ton projet → **API** → **Tokens** → **Add API token**, avec la permission **Editor**. Il ne sert qu'à l'import de départ.

> Ce fichier ne doit jamais être publié : il contient un mot de passe. Il est déjà exclu de git.

### c. Importer le contenu actuel

Dans un terminal, à la racine du site :

```
pnpm run sanity:import
```

Le script envoie dans Sanity les textes, les 3 offres, les 6 avis, les 20 photos et les 2 vidéos déjà en ligne. À lancer **une seule fois** : le relancer écraserait les modifications faites depuis l'administration.

### d. Autoriser l'adresse du site

Sur [sanity.io/manage](https://sanity.io/manage) → **API** → **CORS origins**, ajoute l'adresse du site (par exemple `https://ecotripswomen.com`) avec l'option *Allow credentials*. Sans ça, l'administration ne s'ouvrira pas depuis le site en ligne.

---

## 2. Utilisation au quotidien

L'administration s'ouvre à l'adresse du site suivie de `/studio` :

```
https://ton-site.com/studio
```

Connecte-toi avec le compte Sanity. Le menu de gauche contient quatre fiches :

| Fiche | Ce qu'elle contient |
|---|---|
| ⚙️ **Réglages du site** | Logo, téléphone, Instagram, grande image d'accueil, arguments, étapes, chiffres, titres de toutes les sections, pied de page |
| 🧳 **Voyages à venir** | Les cartes d'offres : affiche, nom, dates, prix, étiquette |
| ⭐ **Avis des voyageuses** | Les avis Google affichés dans le carrousel |
| 🖼️ **Galerie souvenirs** | Toutes les photos et vidéos, et le choix des vidéos mises en avant |

**Après chaque modification, clique sur `Publish` en bas à droite.** Le site se met à jour tout seul en moins d'une minute.

### Réorganiser

Dans les listes (offres, avis, galerie), attrape un élément par sa poignée à gauche et fais-le glisser. L'ordre à l'écran est l'ordre du site.

### Ajouter une offre

**Voyages à venir** → `Add item` → remplis les champs → `Publish`.
Le bouton *Réserver* ouvre WhatsApp avec le message pré-rempli. Si tu laisses ce champ vide, un message est généré automatiquement.

### Ajouter des photos

**Galerie souvenirs** → `Add item` → **Photo**. La description est obligatoire : elle est lue par les personnes malvoyantes et par Google.

### Ajouter une vidéo

**Galerie souvenirs** → `Add item` → **Vidéo**. Deux points importants :

- Le fichier doit être en **MP4**. Un iPhone enregistre en `.MOV`, qui ne s'affiche pas sur la plupart des navigateurs. Dans *Réglages → Appareil photo → Formats*, choisis **Le plus compatible**, ou convertis la vidéo avant de l'envoyer.
- Ajoute toujours une **image de couverture**. C'est elle qui s'affiche sur mobile quand le téléphone refuse la lecture automatique — sans elle, la zone reste vide.

Coche **Afficher dans « Vidéos de voyageuses »** pour la faire apparaître dans la bande du haut (3 maximum). Les emplacements non remplis restent vides avec un cadre discret.

### Photos qui viennent d'un iPhone

Les fichiers `.HEIC` ne s'affichent pas sur le web. Même réglage que ci-dessus : *Réglages → Appareil photo → Formats → Le plus compatible*, pour que le téléphone enregistre en JPEG.

---

## 3. En cas de problème

**Le site n'affiche pas mes modifications.** Attends une minute et rafraîchis. Vérifie surtout que tu as bien cliqué sur `Publish` et non seulement enregistré le brouillon.

**Une section a disparu.** Si un contenu est vidé dans le Studio, le site réaffiche automatiquement le texte d'origine plutôt que de laisser un trou. Remets un texte et republie.

**L'administration ne s'ouvre pas.** Vérifie l'étape 1.d (adresse autorisée dans CORS origins).

**Sanity est en panne.** Le site continue de fonctionner : il bascule sur une copie de secours du contenu enregistrée dans le code.
