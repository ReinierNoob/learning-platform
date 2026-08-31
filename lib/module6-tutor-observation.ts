export type TutorObservationLevel = "strong" | "partial" | "needs_work";

export type TutorObservation = {
  level: TutorObservationLevel;
  canProceed: boolean;
  feedback: string;
  followUp: string | null;
  indicators: string[];
};

function normalize(value: unknown) {
  return typeof value === "string"
    ? value.toLocaleLowerCase("nl-NL").replace(/\s+/g, " ").trim()
    : "";
}

function hasAny(text: string, terms: RegExp[]) {
  return terms.some((term) => term.test(text));
}

function wordCount(text: string) {
  return text.split(/\s+/).filter(Boolean).length;
}

const gainTerms = [
  /winst/, /voordeel/, /verbeter/, /sneller/, /hogere? beschikbaar/, /meer betrouwbaar/,
  /minder (fouten?|complex|afhankelijk|wachttijd|vertraging)/, /betere? (vertrouw|privacy|onderhoud|consistent|veilig)/,
];
const lossTerms = [
  /verlies/, /nadeel/, /kost/, /last/, /risico/, /complexer/, /meer afhankelijk/,
  /lagere? (beschikbaar|performance|wendbaar)/, /trager/, /minder beschikbaar/, /meer fouten?/, /extra (werk|beheer|koppeling|complex)/,
];
const mechanismTerms = [
  /api/, /poll/, /batch/, /bestand/, /dashboard/, /cache/, /queue/, /wachtrij/, /event/,
  /bericht/, /portaal/, /sms/, /push/, /webhook/, /service/, /koppeling/, /integrat/,
];
const qualityTerms = [
  /beschikbaar/, /consistent/, /vertrouw/, /privacy/, /onderhoud/, /wendbaar/, /veilig/,
  /performance/, /snel/, /betrouw/, /complex/, /afhankelijk/,
];

function observeTradeOffRepair(text: string): TutorObservation {
  const hasGain = hasAny(text, gainTerms);
  const hasLoss = hasAny(text, lossTerms);
  const hasQuality = hasAny(text, qualityTerms);
  const indicators = [
    hasGain ? "winst_benoemd" : "winst_ontbreekt",
    hasLoss ? "verlies_benoemd" : "verlies_ontbreekt",
    hasQuality ? "kwaliteitsaspect_benoemd" : "kwaliteitsaspect_niet_explicitiet",
  ];

  if (hasGain && hasLoss) {
    return {
      level: "strong",
      canProceed: true,
      feedback: "Goed: je maakt zowel de winst als de prijs van de keuze zichtbaar. Dat is precies wat een echte trade-off onderscheidt van een optie die simpelweg overal beter is.",
      followUp: hasQuality ? null : "Maak je redenering nog sterker door één kwaliteitsattribuut expliciet te noemen.",
      indicators,
    };
  }
  if (hasGain || hasLoss) {
    return {
      level: "partial",
      canProceed: false,
      feedback: "Je benoemt één kant van de afweging. Een trade-off is pas compleet wanneer je zowel benoemt wat de keuze verbetert als wat je ervoor inlevert.",
      followUp: hasGain ? "Welk nadeel, risico of verlies accepteer je voor deze winst?" : "Welke concrete winst rechtvaardigt dit nadeel of risico?",
      indicators,
    };
  }
  return {
    level: "needs_work",
    canProceed: false,
    feedback: "Ik zie nog geen expliciete afweging tussen winst en verlies. Beschrijf de keuze niet alleen als goed of slecht, maar als een bewuste uitruil.",
    followUp: "Vul deze zin aan: ‘We winnen …, maar accepteren daarvoor …’.",
    indicators,
  };
}

function observeAlternative(text: string, requireTradeOff: boolean): TutorObservation {
  const substantive = wordCount(text) >= 7;
  const hasMechanism = hasAny(text, mechanismTerms);
  const hasTradeOff = hasAny(text, gainTerms) && hasAny(text, lossTerms);
  const hasQuality = hasAny(text, qualityTerms);
  const indicators = [
    substantive ? "substantief" : "te_kort",
    hasMechanism ? "mechanisme_benoemd" : "mechanisme_onduidelijk",
    hasTradeOff ? "tradeoff_benoemd" : "tradeoff_ontbreekt",
    hasQuality ? "kwaliteitsaspect_benoemd" : "kwaliteitsaspect_niet_explicitiet",
  ];

  if (substantive && (hasMechanism || wordCount(text) >= 12) && (!requireTradeOff || hasTradeOff)) {
    return {
      level: "strong",
      canProceed: true,
      feedback: requireTradeOff
        ? "Sterk: je formuleert een serieus alternatief én maakt zichtbaar welke winst en welk verlies het introduceert."
        : "Dit is voldoende uitgewerkt om als vierde kandidaat-alternatief mee te nemen in de afweging.",
      followUp: requireTradeOff || hasQuality ? null : "Noteer bij de volgende afweging welk kwaliteitsattribuut dit alternatief vooral raakt.",
      indicators,
    };
  }

  if (substantive) {
    return {
      level: "partial",
      canProceed: false,
      feedback: requireTradeOff
        ? "Je alternatief is herkenbaar, maar de trade-off is nog niet scherp genoeg. Een bruikbaar alternatief laat ook zien wat je ervoor wint én inlevert."
        : "Je richting is bruikbaar, maar nog te abstract om als serieus alternatief te vergelijken.",
      followUp: requireTradeOff
        ? "Welke concrete winst én welk concreet nadeel introduceert dit alternatief?"
        : "Hoe werkt dit alternatief technisch of organisatorisch anders dan de drie bestaande opties?",
      indicators,
    };
  }

  return {
    level: "needs_work",
    canProceed: false,
    feedback: "Dit antwoord is nog te kort om als onderbouwd alternatief te beoordelen.",
    followUp: requireTradeOff
      ? "Beschrijf eerst het alternatief in één zin en voeg daarna één winst en één nadeel toe."
      : "Beschrijf in één of twee zinnen hoe jouw vierde alternatief de statusterugkoppeling organiseert.",
    indicators,
  };
}

function observeAdrMissingPart(text: string): TutorObservation {
  const correct = hasAny(text, [/consequent/, /gevolg/, /effect/, /nadeel/, /impact/]);
  if (correct) {
    return {
      level: "strong",
      canProceed: true,
      feedback: "Juist. De consequenties ontbreken: zonder die sectie is niet zichtbaar welke gevolgen en lasten bewust zijn geaccepteerd.",
      followUp: null,
      indicators: ["consequenties_herkend"],
    };
  }
  return {
    level: "needs_work",
    canProceed: false,
    feedback: "Kijk nog eens naar wat na een architectuurbeslissing waar wordt. De ADR moet niet alleen de keuze noemen, maar ook zichtbaar maken wat die keuze veroorzaakt.",
    followUp: "Welk ADR-onderdeel beschrijft zowel positieve als negatieve gevolgen van de beslissing?",
    indicators: ["consequenties_niet_herkend"],
  };
}

export function observeModule6Reasoning(interventionId: string, rawAnswer: unknown): TutorObservation | null {
  const answer = normalize(rawAnswer);
  if (!answer) return null;

  if (interventionId === "m6-trade-off-repair-v1") return observeTradeOffRepair(answer);
  if (interventionId === "m6-alternatieven-genereren-v1") return observeAlternative(answer, false);
  if (interventionId === "m6-adr-onderdelen-check-v1") return observeAdrMissingPart(answer);
  if (interventionId === "m6-alternatieven-transfer-v1") return observeAlternative(answer, true);
  return null;
}
