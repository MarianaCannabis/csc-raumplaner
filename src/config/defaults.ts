// Zentrale Default-Konstanten für Kosten- und Energieberechnungen.
//
// Jede Konstante trägt ein `lastVerified`-Feld. Wenn dieses älter als ~6
// Monate ist, sollen die Werte gegen aktuelle Marktpreise, UBA-Zahlen bzw.
// Tarifverträge geprüft und aktualisiert werden. Die UI zeigt den ältesten
// lastVerified-Wert als "Default-Werte zuletzt geprüft: YYYY-MM-DD" an.
//
// Legacy-Code im `index.html` liest über `window.cscDefaults.<NAME>.value`
// mit derselben Zahl als Inline-Fallback, so dass Boot-Sequenz (Vite-
// Modul lädt deferred) nicht bricht.

export interface VerifiedValue<T> {
  value: T;
  unit: string;
  /** ISO-Datum YYYY-MM-DD der letzten manuellen Verifikation. */
  lastVerified: string;
  source: string;
  note?: string;
}

// Strommix-Emissionsfaktor Deutschland.
// UBA publiziert den Jahreswert mit ca. 18 Monaten Verzögerung; der 2024er
// Wert ist Stand 2026-04 der neueste verfügbare.
export const CO2_FACTOR_DE: VerifiedValue<number> = {
  value: 363,
  unit: 'g CO₂/kWh',
  lastVerified: '2026-04-19',
  source: 'Umweltbundesamt — Entwicklung der spezifischen Treibhausgas-Emissionen des deutschen Strommix, Jahr 2024',
  note: 'Jahreswert 2024 — letzter verfügbarer UBA-Wert. 2025er-Wert erwartet Mitte 2026.',
};

// Haushalts-/Gewerbestrompreis (Brutto, inkl. Steuern/Abgaben). Dient als
// Default im Energie-Panel; User kann per UI überschreiben.
export const ELECTRICITY_PRICE: VerifiedValue<number> = {
  value: 0.32,
  unit: '€/kWh',
  lastVerified: '2026-04-19',
  source: 'heuristisch, Orientierung an BNetzA-Strompreisübersicht Q1 2026',
  note: 'Gewerbe-Kleinverbraucher variieren 0,28–0,40 — 0,32 ist Median der aktuellen Tarife.',
};

// Mitgliedsbeitrag CSC in Deutschland (typischer Monatsbeitrag).
export const MEMBER_FEE: VerifiedValue<number> = {
  value: 35,
  unit: '€/Monat',
  lastVerified: '2026-04-19',
  source: 'heuristisch, Branchen-Durchschnitt CSC DE 2025/2026',
  note: 'Marktübliche Spanne 25–60 €. 35 als moderater Default.',
};

// Miete für CSC-Räume (typisches Gewerbeobjekt mittlere Lage).
export const RENT: VerifiedValue<number> = {
  value: 1200,
  unit: '€/Monat',
  lastVerified: '2026-04-19',
  source: 'heuristisch, Gewerbemiete 80–120 m² Mittelgroßstadt DE 2026',
  note: 'Reale Spanne regional 800 (Ost-DE Rand) bis 3500 (München/HH Zentrum).',
};

// Personal-Kostenansatz für den ROI-Rechner (Bruttogehalt + AG-Anteile
// Sozialabgaben, auf Monatsbasis, für 1–2 Teilzeit-Stellen).
export const ROI_STAFF: VerifiedValue<number> = {
  value: 2000,
  unit: '€/Monat',
  lastVerified: '2026-04-19',
  source: 'heuristisch, 1–2 Teilzeit-Stellen Mindestlohn-nah DE 2026',
  note: 'Realistisch eher 2400–3200 für echte Teilzeit-Aufsicht. Niedrig angesetzt als konservativer Break-Even-Start.',
};

// Baukosten pro m² für Turnkey-Umbau einer CSC-Ausgabestelle.
export const CONSTRUCTION_PRICE: VerifiedValue<number> = {
  value: 800,
  unit: '€/m²',
  lastVerified: '2026-04-19',
  source: 'heuristisch, Baupreisindex StBA 2024 fortgeschrieben',
  note: 'Spanne Renovation 200–500, Turnkey 600–1100, Premium 1500+. 800 als Neubau-Turnkey-Median.',
};

// Vollzeit-Äquivalent-Kosten/Monat für die Schichtplan-Auswertung
// (Bruttogehalt + Arbeitgeber-Anteile Sozialabgaben).
export const FTE_COST: VerifiedValue<number> = {
  value: 2800,
  unit: '€/Monat (FTE)',
  lastVerified: '2026-04-19',
  source: 'heuristisch, Branchen-Mittel Einzelhandel/Gastronomie DE 2026',
  note: 'TVöD E5 Stufe 2 liegt bei ~3200, Mindestlohn-FTE bei ~2500. 2800 als Mittelwert für einfaches Aufsichtspersonal.',
};

/** Helper: ältester `lastVerified`-Wert über alle Defaults. */
export function oldestLastVerified(): string {
  const values: VerifiedValue<unknown>[] = [
    CO2_FACTOR_DE,
    ELECTRICITY_PRICE,
    MEMBER_FEE,
    RENT,
    ROI_STAFF,
    CONSTRUCTION_PRICE,
    FTE_COST,
  ];
  return values
    .map((v) => v.lastVerified)
    .sort()[0] ?? '';
}

/** Helper: jüngster `lastVerified`-Wert — hilft der UI zu sagen wann die
 *  Defaults zuletzt überhaupt angefasst wurden. */
export function latestLastVerified(): string {
  const values: VerifiedValue<unknown>[] = [
    CO2_FACTOR_DE,
    ELECTRICITY_PRICE,
    MEMBER_FEE,
    RENT,
    ROI_STAFF,
    CONSTRUCTION_PRICE,
    FTE_COST,
  ];
  return values
    .map((v) => v.lastVerified)
    .sort()
    .slice(-1)[0] ?? '';
}
