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

### La page « Plus d'infos » d'un voyage

Chaque voyage a sa propre page, ouverte par le bouton **Plus d'infos** sur la carte. Son adresse est construite à partir du nom du voyage : *Nador - El Houceima* devient `/offres/nador-el-houceima`.

Cette page se remplit avec les champs situés sous *Message WhatsApp pré-rempli* :

| Champ | Où ça s'affiche |
|---|---|
| **Présentation du voyage** | Le paragraphe d'introduction, en haut à droite |
| **Programme jour par jour** | La liste numérotée des journées |
| **Ce qui est compris** | La liste à coches vertes |
| **À prévoir** | Ce que la voyageuse doit apporter |
| **Dates de départ proposées** | Le menu déroulant du formulaire de réservation |
| **Villes de départ proposées** | Les suggestions du champ « ville de départ » |
| **Photos de l'édition précédente** | La galerie sous l'affiche, à gauche |

**Chaque champ laissé vide est simplement masqué**, la page reste propre. Deux champs se remplissent tout seuls si tu les laisses vides :

- *Dates de départ proposées* → reprend la date écrite sur la carte ;
- *Villes de départ proposées* → reprend les villes du champ *Départ*, par exemple « Départ Tanger - Tétouan » donne Tanger et Tétouan.

### Ajouter plusieurs photos d'un coup

Dans *Photos de l'édition précédente*, tu n'as plus besoin d'ouvrir une fiche par photo. Sélectionne toutes tes photos dans ton dossier et **fais-les glisser d'un seul geste sur la liste** : elles se téléversent en même temps et s'affichent en grille.

La *Description* de chaque photo reste utile (elle est lue par les personnes malvoyantes et par Google) mais elle n'est plus obligatoire : sans elle, le nom du voyage est utilisé. Tu peux donc tout déposer d'abord, et repasser écrire les descriptions ensuite.

### Annulation et avance, voyage par voyage

Deux champs, juste sous *Message WhatsApp pré-rempli*, règlent les conditions de **ce** voyage :

| Champ | Ce que la cliente lit |
|---|---|
| **Annulation gratuite jusqu'à (en jours)** | « Jusqu'à 7 jours avant le départ, remboursement intégral. » |
| **Avance à verser à la réservation** | « Verse 500 DH d'avance aujourd'hui, le reste avant le départ. » |

Ces phrases s'affichent sous le bouton *Réserver* de la page du voyage **et** dans la fenêtre de réservation, en français, en anglais et en darija — la traduction est déjà écrite, tu n'as que le chiffre à saisir.

> **Attention :** dès que tu remplis **un** de ces deux champs, ce voyage n'affiche plus les garanties générales de *Réglages du site*, seulement ses propres conditions. Remplis donc les deux, ou aucun.
>
> Laisse les deux vides et le voyage reprend les garanties générales, comme avant.

> Le texte des trois voyages actuels est un **brouillon de départ** écrit pour que les pages ne soient pas vides. Relis-le et corrige-le depuis le Studio : programme, ce qui est compris, ce qu'il faut apporter.

### Le formulaire de réservation

Tous les boutons **Réserver** du site ouvrent la même fenêtre rose : ceux des cartes sur la page d'accueil, ceux de la page *Toutes les offres*, et le grand bouton sous l'affiche d'une page voyage. Elle demande le prénom, le nom, la ville de départ, le téléphone et la date de départ souhaitée.

Le champ **Nombre de personnes** commande le reste : dès 2, le formulaire demande le **prénom et le nom** de chaque accompagnante — et rien d'autre. Un seul numéro de téléphone est collecté, celui de la personne qui réserve. Maximum 12 personnes.

Dans la feuille, deux colonnes récapitulent le groupe :

- **Nombre de personnes** : `3`
- **Voyageuses** : `Sara Benali, Imane Alami, Nadia Chaoui`

Au clic sur *Envoyer ma réservation* :

1. la réservation est ajoutée à ta **Google Sheet** (voir la section 3) ;
2. un écran de confirmation s'affiche, avec un bouton **Contactez-nous sur WhatsApp** qui ouvre la conversation avec le message « Bonjour, je vous contacte au sujet de ma réservation pour *nom du voyage* ».

**Si la feuille est injoignable**, l'écran change de ton : il prévient la cliente et le bouton WhatsApp emporte alors *toutes* ses réponses. Une réservation ne peut donc jamais se perdre, même si la Google Sheet tombe en panne.

> Tant que la Google Sheet n'est pas branchée (section 3), c'est ce second cas qui s'applique : les réservations continuent d'arriver sur WhatsApp, comme avant.

### Ajouter des photos

**Galerie souvenirs** → `Add item` → **Photo**. La description est obligatoire : elle est lue par les personnes malvoyantes et par Google.

### Ajouter une vidéo

**Galerie souvenirs** → `Add item` → **Vidéo**. Deux points importants :

- Le fichier doit être en **MP4**. Un iPhone enregistre en `.MOV`, qui ne s'affiche pas sur la plupart des navigateurs. Dans *Réglages → Appareil photo → Formats*, choisis **Le plus compatible**, ou convertis la vidéo avant de l'envoyer.
- Ajoute toujours une **image de couverture**. C'est elle qui s'affiche sur mobile quand le téléphone refuse la lecture automatique — sans elle, la zone reste vide.

Coche **Afficher dans « Vidéos de voyageuses »** pour la faire apparaître dans la bande du haut (3 maximum). Les emplacements non remplis restent vides avec un cadre discret.

### Photos qui viennent d'un iPhone

Les fichiers `.HEIC` ne s'affichent pas sur le web. Même réglage que ci-dessus : *Réglages → Appareil photo → Formats → Le plus compatible*, pour que le téléphone enregistre en JPEG.

### La page « Toutes les offres »

Le bouton **Voir toutes les offres**, sous le carrousel de la page d'accueil, mène à `/offres`. Cette page affiche tous les voyages avec cinq filtres : ville de départ, destination, prix, date de départ et durée.

**Les filtres se construisent tout seuls** à partir des voyages. Un filtre dont aucune offre ne remplit le champ est simplement masqué. Concrètement :

| Filtre | Ce qu'il faut remplir dans le Studio |
|---|---|
| Ville de départ | *Villes de départ proposées*, ou rien (lu depuis le champ *Départ*) |
| Prix | rien, le chiffre est lu dans le champ *Prix* |
| Destination | *Destinations* |
| Date de départ | *Date de début* |
| Durée | *Date de début* et *Date de fin*, ou *Durée en jours* |

> Un filtre n'apparaît que si au moins une offre remplit le champ correspondant. Si le filtre *Durée* disparaît, c'est qu'aucun voyage n'a de dates ni de durée.

Pour un voyage qui revient régulièrement (« chaque dimanche »), laisse *Date de début* vide et remplis seulement *Durée en jours* : il restera proposé quel que soit le mois choisi dans le filtre.

Le titre de cette page et les textes des boutons se modifient dans **Réglages du site → Pages voyage**.

---

## 3. Recevoir les réservations dans une Google Sheet

À faire une seule fois. Le site enverra ensuite chaque réservation dans une ligne du tableau.

### a. Créer la feuille

1. Va sur [sheets.new](https://sheets.new) et nomme la feuille **Réservations EcoTrips**.
2. Sur la **première ligne**, écris ces en-têtes, une par colonne :

   `Date` · `Voyage` · `Prénom` · `Nom` · `Ville de départ` · `Téléphone` · `Date souhaitée` · `Nombre de personnes` · `Voyageuses`

### b. Coller le script

Dans la feuille : menu **Extensions → Apps Script**. Efface ce qui s'y trouve, colle ceci, puis enregistre :

```javascript
function doPost(e) {
  var feuille = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var d = JSON.parse(e.postData.contents);

  feuille.appendRow([
    new Date(),
    d.offer,
    d.firstName,
    d.lastName,
    d.city,
    d.phone,
    d.departureDate,
    d.people,
    d.travellers
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### c. Publier le script

**Déployer → Nouveau déploiement** → en haut à gauche, choisis le type **Application web**, puis :

- *Exécuter en tant que* : **Moi**
- *Qui a accès* : **Tout le monde**

Clique sur **Déployer**, autorise l'accès quand Google le demande (passe par *Paramètres avancés → Accéder au projet* si Google affiche un avertissement, c'est ton propre script), et **copie l'URL de l'application web**. Elle ressemble à :

```
https://script.google.com/macros/s/AKfy...................../exec
```

### d. Donner l'adresse au site

Sur Vercel → ton projet → **Settings** → **Environment Variables**, ajoute :

| Nom | Valeur |
|---|---|
| `GOOGLE_SHEET_WEBHOOK_URL` | l'URL copiée à l'étape c |

Puis **Deployments → Redeploy** pour que la nouvelle variable soit prise en compte.

> Cette adresse permet d'écrire dans ta feuille : ne la publie nulle part. Elle reste côté serveur, le navigateur des visiteuses ne la voit jamais.

Pour tester en local, ajoute la même ligne dans `.env.local`.

**Tant que cette variable n'est pas renseignée, le formulaire fonctionne normalement** et ouvre WhatsApp : seule l'écriture dans la feuille est ignorée.

---

## 4. Ajouter les deux voyages Plongée et Taghazout

Un script prépare ces deux offres avec tout leur détail (programme, ce qui est compris, dates, destinations).

1. Enregistre les deux affiches dans le dossier `public/assets/` sous **exactement** ces noms :
   - `offre-plongee-belyounech.jpg`
   - `offre-taghazout-essaouira.jpg`
2. Dans un terminal, à la racine du site :

```
pnpm run sanity:add-offers
```

Le script refuse de démarrer si une affiche manque, et ignore un voyage déjà présent dans le Studio : le relancer ne crée pas de doublon.

> ✅ Déjà fait : les deux voyages sont dans le Studio.

### Compléter un voyage existant

Si un voyage du Studio n'a ni programme, ni destinations, ni dates, cette commande les remplit à partir des textes préparés dans le code :

```
pnpm run sanity:fill
```

Elle **ne remplace jamais un champ déjà rempli** dans le Studio : elle ne comble que les trous. La relancer est sans danger.

---

## 5. En cas de problème

**Le site n'affiche pas mes modifications.** Attends une minute et rafraîchis. Vérifie surtout que tu as bien cliqué sur `Publish` et non seulement enregistré le brouillon.

**Une section a disparu.** Si un contenu est vidé dans le Studio, le site réaffiche automatiquement le texte d'origine plutôt que de laisser un trou. Remets un texte et republie.

**L'administration ne s'ouvre pas.** Vérifie l'étape 1.d (adresse autorisée dans CORS origins).

**Sanity est en panne.** Le site continue de fonctionner : il bascule sur une copie de secours du contenu enregistrée dans le code.

**Toutes les images sont cassées en local.** Si le terminal affiche `hostname resolved to private IP`, c'est ta connexion internet (IPv6 avec NAT64) et non le site. Le réglage `dangerouslyAllowLocalIP` dans `next.config.mjs` corrige déjà ce cas : ne le retire pas.

**Un nouveau voyage n'a pas de page « Plus d'infos ».** Sa page est créée au premier affichage. Si elle reste introuvable, redéploie le site depuis Vercel.
