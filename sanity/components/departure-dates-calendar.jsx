import { Box, Button, Card, Flex, Grid, Stack, Text } from "@sanity/ui";
import { useMemo, useState } from "react";
import { set, unset } from "sanity";

// Meme calendrier que sur le site, mais pour le Studio: on clique sur les jours
// pour ouvrir ou fermer un depart. Remplace la liste de champs date, ou il
// fallait ajouter une ligne puis ouvrir un selecteur pour chaque date.
const JOURS = ["L", "M", "M", "J", "V", "S", "D"];
const MOIS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

function iso(annee, mois, jour) {
  return `${annee}-${String(mois).padStart(2, "0")}-${String(jour).padStart(2, "0")}`;
}

// Tout en UTC: une date saisie ici est un jour, pas un instant.
function grille(annee, mois) {
  const premier = new Date(Date.UTC(annee, mois - 1, 1));
  const nbJours = new Date(Date.UTC(annee, mois, 0)).getUTCDate();
  const decalage = (premier.getUTCDay() + 6) % 7;

  const cases = Array.from({ length: decalage }, () => null);
  for (let jour = 1; jour <= nbJours; jour += 1) cases.push(jour);
  return cases;
}

export default function DepartureDatesCalendar(props) {
  const { value = [], onChange, readOnly } = props;

  const aujourdhui = new Date();
  const [annee, setAnnee] = useState(() => {
    const premiere = [...value].sort()[0];
    return premiere ? Number(premiere.slice(0, 4)) : aujourdhui.getUTCFullYear();
  });
  const [mois, setMois] = useState(() => {
    const premiere = [...value].sort()[0];
    return premiere ? Number(premiere.slice(5, 7)) : aujourdhui.getUTCMonth() + 1;
  });

  const choisies = useMemo(() => new Set(value), [value]);

  function basculer(jour) {
    if (readOnly) return;

    const date = iso(annee, mois, jour);
    const suivant = choisies.has(date)
      ? value.filter((v) => v !== date)
      : [...value, date].sort();

    onChange(suivant.length ? set(suivant) : unset());
  }

  function deplacer(pas) {
    const total = (annee * 12 + (mois - 1)) + pas;
    setAnnee(Math.floor(total / 12));
    setMois((total % 12) + 1);
  }

  return (
    <Stack space={3}>
      <Card padding={3} radius={2} border>
        <Flex align="center" justify="space-between" marginBottom={3}>
          <Button mode="ghost" text="‹" onClick={() => deplacer(-1)} disabled={readOnly} />
          <Text weight="bold" size={2}>
            {MOIS[mois - 1]} {annee}
          </Text>
          <Button mode="ghost" text="›" onClick={() => deplacer(1)} disabled={readOnly} />
        </Flex>

        <Grid columns={7} gap={1} marginBottom={2}>
          {JOURS.map((jour, i) => (
            <Text key={`${jour}-${i}`} align="center" size={0} weight="bold" muted>
              {jour}
            </Text>
          ))}
        </Grid>

        <Grid columns={7} gap={1}>
          {grille(annee, mois).map((jour, i) => {
            if (!jour) return <Box key={`vide-${i}`} />;

            const active = choisies.has(iso(annee, mois, jour));
            return (
              <Button
                key={jour}
                mode={active ? "default" : "bleak"}
                tone={active ? "positive" : "default"}
                text={active ? "✓" : String(jour)}
                onClick={() => basculer(jour)}
                disabled={readOnly}
                style={{ textAlign: "center" }}
              />
            );
          })}
        </Grid>
      </Card>

      <Text size={1} muted>
        {value.length === 0
          ? "Aucune date choisie : le site proposera la date écrite plus haut."
          : `${value.length} date${value.length > 1 ? "s" : ""} de départ : ` +
            [...value]
              .sort()
              .map((d) => `${Number(d.slice(8))} ${MOIS[Number(d.slice(5, 7)) - 1]}`)
              .join(", ")}
      </Text>
    </Stack>
  );
}
