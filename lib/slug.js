// Fabrique l'adresse d'une page de voyage a partir de son nom:
// "Nador - El Houceima" devient "nador-el-houceima".
export function slugify(value) {
  const slug = (value || "")
    // NFD separe les accents des lettres, la plage ̀-ͯ les supprime.
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "voyage";
}

// Deux voyages peuvent porter le meme nom: on numerote pour que chacun garde
// sa propre adresse.
export function uniqueSlug(value, taken) {
  const base = slugify(value);
  let slug = base;
  let suffix = 2;

  while (taken.has(slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  taken.add(slug);
  return slug;
}
