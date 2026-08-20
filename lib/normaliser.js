// Le Studio produit parfois une apostrophe typographique la ou le code en a une
// droite. Les deux doivent tomber sur la meme cle, sinon une phrase relue dans
// le Studio ne serait jamais retrouvee.
//
// Ce module minuscule existe pour lui seul: lib/ui.js en a besoin et part dans
// le navigateur avec les composants clients. L'importer depuis
// lib/darija-corrections.js embarquerait toute la table darija dans le paquet
// envoye au visiteur.
export function normaliser(texte) {
  return texte.replace(/[’‘]/g, "'").trim();
}
