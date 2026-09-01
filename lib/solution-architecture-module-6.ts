export type RouteId = "A" | "B" | "C";
export type Speaker = "interviewer" | "alexander";

export type VisualState = {
  visibleAlternatives: number;
  visibleAttributes: number;
  showTradeoffs: boolean;
  adrSectionsVisible: string[];
  highlightWeakLink?: string | null;
};

export type Intervention = {
  id: string;
  objectiveId: string;
  speaker: Speaker;
  title: string;
  kind: "explanation" | "repair" | "check" | "practice" | "assessment";
  body: string;
  prompt?: string;
  visual: VisualState;
};

export const diagnosticQuestions = [
  {
    id: "m6-diag-01",
    objectiveId: "sa.m06.dominante-attributen",
    question: "Je moet kiezen hoe Middelveen de keuringsgegevens uitwisselt. Wat bepaalt volgens jou welke ontwerpen hier überhaupt toelaatbaar zijn?",
  },
  {
    id: "m6-diag-02",
    objectiveId: "sa.m06.alternatieven-vergelijken",
    question: "Stel dat een optie op elk punt beter uitpakt dan de alternatieven. Wat zegt dat over de beslissing?",
  },
  {
    id: "m6-diag-03",
    objectiveId: "sa.m06.adr-beoordelen",
    question: "Een ADR eindigt met: ‘Consequenties: betere aansluiting op de keten, hogere wendbaarheid.’ Wat valt je op?",
  },
  {
    id: "m6-diag-04",
    objectiveId: "sa.m06.waarom-alternatieven",
    question: "Wanneer schrijf je een ADR: voordat de bouw begint, of erna? Waarom?",
  },
] as const;

export const routeMetadata: Record<RouteId, { name: string; description: string }> = {
  A: {
    name: "Volledige basisroute",
    description: "Weinig of conflicterend bewijs. De kern wordt volledig opgebouwd en misconcepties worden expliciet gerepareerd.",
  },
  B: {
    name: "Verkorte route met verificatie",
    description: "De basis is aantoonbaar aanwezig. Bekende onderdelen worden kort geverifieerd en de nadruk verschuift naar transfer en beoordeling.",
  },
  C: {
    name: "Gerichte herstelroute",
    description: "Er is relevante ervaring, maar ook een actieve misconceptie. De route concentreert zich op die zwakke plekken.",
  },
};

export const alternatives = [
  "Portaal bevraagt het zaaksysteem op leesmoment",
  "Zaaksysteem publiceert een gebeurtenis bij elke statuswijziging",
  "Bericht per e-mail of Berichtenbox, zonder online status",
];

// These are scenario-specific decision criteria. ISO/IEC 25010:2023 can be
// used as a reference model when selecting quality characteristics, but this
// exercise does not present these four labels as the full ISO model.
export const attributes = ["Beschikbaarheid", "Consistentie", "Vertrouwelijkheid", "Onderhoudbaarheid"];

// The learning card extends the classical Nygard core with explicit alternatives
// because comparing viable options is a central learning objective in Module 6.
export const adrSections = ["titel", "status", "context", "beslissing", "alternatieven", "consequenties"];

const baseVisual: VisualState = {
  visibleAlternatives: 0,
  visibleAttributes: 0,
  showTradeoffs: false,
  adrSectionsVisible: [],
  highlightWeakLink: null,
};

export const interventions: Record<string, Intervention> = {
  "m6-attributen-standard-v1": {
    id: "m6-attributen-standard-v1",
    objectiveId: "sa.m06.dominante-attributen",
    speaker: "alexander",
    title: "Elke keuze kost iets",
    kind: "explanation",
    body: "Een trade-off is niet een fout in het ontwerp, maar juist wat een echte ontwerpkeuze kenmerkt. In deze casus gebruiken we beschikbaarheid, consistentie, vertrouwelijkheid en onderhoudbaarheid als besliscriteria. Zo kan het beperken van gevoelige keuringsgegevens buiten de keuringsinstantie de vertrouwelijkheid verbeteren, terwijl beschikbaarheid of gebruiksgemak onder druk kan komen te staan. De vaardigheid is niet om alleen de winst te benoemen, maar ook het verlies expliciet te maken.",
    visual: { ...baseVisual, visibleAlternatives: 2, visibleAttributes: 2, showTradeoffs: true },
  },
  "m6-trade-off-repair-v1": {
    id: "m6-trade-off-repair-v1",
    objectiveId: "sa.m06.alternatieven-vergelijken",
    speaker: "interviewer",
    title: "Is overal beter nog een trade-off?",
    kind: "repair",
    body: "Als één optie aantoonbaar op ieder relevant punt beter is, heb je geen spanningsvolle ontwerpkeuze meer. Dan heb je eerder een gegeven vastgesteld. Eva gebruikt dit contrast om de gedachte ‘een trade-off betekent dat het ontwerp fout is’ te onderzoeken.",
    prompt: "Welke winst én welk verlies zou je bij een echte keuze verwachten?",
    visual: { ...baseVisual, visibleAlternatives: 2, visibleAttributes: 2, showTradeoffs: true },
  },
  "m6-alternatieven-standard-v1": {
    id: "m6-alternatieven-standard-v1",
    objectiveId: "sa.m06.waarom-alternatieven",
    speaker: "alexander",
    title: "Een beslissing heeft serieuze alternatieven nodig",
    kind: "explanation",
    body: "Een beslissing wordt beter navolgbaar wanneer je laat zien welke reële opties zijn overwogen. Voor deze oefening werken we bewust met de voorkeursoptie en minstens twee serieuze alternatieven, zodat je expliciet leert vergelijken. In de praktijk hangt het aantal reële alternatieven af van de context; een stroman-alternatief telt nooit als echte afweging.",
    visual: { ...baseVisual, visibleAlternatives: 3, visibleAttributes: 2, showTradeoffs: true },
  },
  "m6-alternatieven-genereren-v1": {
    id: "m6-alternatieven-genereren-v1",
    objectiveId: "sa.m06.alternatieven-vergelijken",
    speaker: "alexander",
    title: "Drie reële oplossingen naast elkaar",
    kind: "explanation",
    body: "Voor statusterugkoppeling zijn drie verschillende richtingen reëel: rechtstreeks bevragen, gebeurtenissen publiceren, of status via een bestaand berichtenkanaal teruggeven. De derde optie is minder technisch, maar juist daarom nuttig: architectuuralternatieven hoeven niet allemaal hetzelfde technische patroon te gebruiken zolang ze hetzelfde probleem geloofwaardig oplossen.",
    prompt: "Kun je een vierde alternatief bedenken dat een vakgenoot serieus zou kunnen kiezen?",
    visual: { ...baseVisual, visibleAlternatives: 3, visibleAttributes: 4, showTradeoffs: true },
  },
  "m6-adr-anatomie-standard-v1": {
    id: "m6-adr-anatomie-standard-v1",
    objectiveId: "sa.m06.adr-onderdelen",
    speaker: "alexander",
    title: "De anatomie van een ADR",
    kind: "explanation",
    body: "Een ADR legt één architectuurbeslissing compact vast. In de klassieke Nygard-variant bestaat de kern uit titel, status, context, beslissing en consequenties. Er bestaan ook andere ADR-templates. In deze oefening voegen we overwogen alternatieven expliciet toe, omdat juist het vergelijken van opties centraal staat. Een ADR is bewust kort en is geen volledig ontwerpdocument.",
    visual: { ...baseVisual, visibleAlternatives: 3, visibleAttributes: 4, showTradeoffs: true, adrSectionsVisible: ["titel", "status", "context", "beslissing"] },
  },
  "m6-adr-onderdelen-check-v1": {
    id: "m6-adr-onderdelen-check-v1",
    objectiveId: "sa.m06.adr-onderdelen",
    speaker: "interviewer",
    title: "Korte verificatie: wat ontbreekt?",
    kind: "check",
    body: "ADR-07 bevat Titel, Status, Context, Beslissing en de overwogen Alternatieven. Eén kernonderdeel dat de gevolgen van de keuze zichtbaar maakt ontbreekt nog.",
    prompt: "Welk kernonderdeel mis je?",
    visual: { ...baseVisual, visibleAlternatives: 3, visibleAttributes: 2, showTradeoffs: true, adrSectionsVisible: ["titel", "status", "context", "beslissing", "alternatieven"] },
  },
  "m6-attributen-recap-v1": {
    id: "m6-attributen-recap-v1",
    objectiveId: "sa.m06.dominante-attributen",
    speaker: "alexander",
    title: "Korte recap: winst en verlies",
    kind: "explanation",
    body: "Je kent de kern al: kwaliteitsattributen en andere relevante besliscriteria geven taal aan de winst en het verlies van een keuze. Een echte trade-off maakt zichtbaar welk criterium je versterkt en welk criterium je daarvoor belast.",
    visual: { ...baseVisual, visibleAlternatives: 2, visibleAttributes: 4, showTradeoffs: true },
  },
  "m6-consequenties-standard-v1": {
    id: "m6-consequenties-standard-v1",
    objectiveId: "sa.m06.adr-beoordelen",
    speaker: "alexander",
    title: "Consequenties zijn ook lasten",
    kind: "explanation",
    body: "Het onderdeel Consequenties beschrijft wat na de beslissing waar is, inclusief wat de keuze kost. Bij gebeurtenisgedreven statusterugkoppeling neemt de directe afhankelijkheid van het zaaksysteem af, maar ontstaan foutafhandeling, een tweede statusrepresentatie en extra diagnosevragen bij storingen. Alleen voordelen opschrijven betekent dat de ADR nog niet af is.",
    visual: { ...baseVisual, visibleAlternatives: 3, visibleAttributes: 4, showTradeoffs: true, adrSectionsVisible: adrSections },
  },
  "m6-consequenties-repair-v1": {
    id: "m6-consequenties-repair-v1",
    objectiveId: "sa.m06.adr-beoordelen",
    speaker: "alexander",
    title: "Herstel: een ADR verkoopt de keuze niet",
    kind: "repair",
    body: "Een ADR is geen verkooptekst voor de gekozen oplossing. Als Consequenties alleen positieve formuleringen bevat, ontbreekt het bewijs dat nadelen bewust zijn gezien en geaccepteerd. Maak daarom ook lasten, nieuwe afhankelijkheden en operationele gevolgen expliciet.",
    visual: { ...baseVisual, visibleAlternatives: 3, visibleAttributes: 4, showTradeoffs: true, adrSectionsVisible: adrSections, highlightWeakLink: "consequenties" },
  },
  "m6-adr-achteraf-repair-v1": {
    id: "m6-adr-achteraf-repair-v1",
    objectiveId: "sa.m06.waarom-alternatieven",
    speaker: "interviewer",
    title: "Herstel: de achteraf-ADR",
    kind: "repair",
    body: "Een ADR kan achteraf nog nuttig zijn om een historische keuze te reconstrueren, maar hij legt dan niet meer de oorspronkelijke afweging vast op het moment dat de beslissing werd genomen. Voor nieuwe architectuurbeslissingen wil je context, alternatieven en consequenties daarom vastleggen vóór of tijdens het beslismoment, niet pas nadat de oplossing al is gebouwd.",
    visual: { ...baseVisual, visibleAlternatives: 2, visibleAttributes: 4, showTradeoffs: true, adrSectionsVisible: ["titel", "status", "context", "beslissing"] },
  },
  "m6-veelgemaakte-fouten-deep-v1": {
    id: "m6-veelgemaakte-fouten-deep-v1",
    objectiveId: "sa.m06.adr-beoordelen",
    speaker: "alexander",
    title: "De zwakste schakel herkennen",
    kind: "explanation",
    body: "Veel voorkomende zwaktes zijn: gewoonte als enige argument, een ADR die de oorspronkelijke afweging pas achteraf reconstrueert, meerdere beslissingen in één record, een vage beslissing en consequenties zonder lasten. Een nieuwe beslissing overschrijft bovendien niet stilletjes de oude ADR; de oude kan de status krijgen dat hij is vervangen, met een verwijzing naar de nieuwe beslissing, zodat de redeneergeschiedenis leesbaar blijft.",
    visual: { ...baseVisual, visibleAlternatives: 3, visibleAttributes: 4, showTradeoffs: true, adrSectionsVisible: adrSections, highlightWeakLink: "alternatieven" },
  },
  "m6-alternatieven-transfer-v1": {
    id: "m6-alternatieven-transfer-v1",
    objectiveId: "sa.m06.alternatieven-vergelijken",
    speaker: "interviewer",
    title: "Transfer: ontwerp een vierde alternatief",
    kind: "practice",
    body: "Bedenk een vierde manier waarop Middelveen statusterugkoppeling zou kunnen organiseren. De toets is niet of jij hem mooi vindt, maar of een redelijk vakgenoot hem serieus zou kunnen kiezen en of je de consequenties op de relevante besliscriteria kunt benoemen.",
    prompt: "Wat is jouw vierde alternatief en welke trade-off introduceert het?",
    visual: { ...baseVisual, visibleAlternatives: 3, visibleAttributes: 4, showTradeoffs: true },
  },
  "m6-adr-beoordelen-assessment-v1": {
    id: "m6-adr-beoordelen-assessment-v1",
    objectiveId: "sa.m06.adr-beoordelen",
    speaker: "alexander",
    title: "Verplichte eindcheck",
    kind: "assessment",
    body: "De eindcheck blijft in iedere route verplicht. Je antwoorden worden volgens dezelfde vaste beoordelingsregels gecontroleerd; dit is geen persoonlijke beoordeling van Eva of Alexander.",
    visual: { ...baseVisual, visibleAlternatives: 3, visibleAttributes: 4, showTradeoffs: true, adrSectionsVisible: adrSections },
  },
};

export const routeSequences: Record<RouteId, string[]> = {
  A: [
    "m6-attributen-standard-v1",
    "m6-trade-off-repair-v1",
    "m6-alternatieven-standard-v1",
    "m6-alternatieven-genereren-v1",
    "m6-adr-anatomie-standard-v1",
    "m6-consequenties-standard-v1",
    "m6-adr-beoordelen-assessment-v1",
  ],
  B: [
    "m6-adr-onderdelen-check-v1",
    "m6-attributen-recap-v1",
    "m6-alternatieven-standard-v1",
    "m6-consequenties-standard-v1",
    "m6-alternatieven-transfer-v1",
    "m6-adr-beoordelen-assessment-v1",
  ],
  C: [
    "m6-adr-achteraf-repair-v1",
    "m6-attributen-recap-v1",
    "m6-consequenties-repair-v1",
    "m6-veelgemaakte-fouten-deep-v1",
    "m6-alternatieven-transfer-v1",
    "m6-adr-beoordelen-assessment-v1",
  ],
};

export const assessmentQuestions = [
  {
    id: "m6-assess-01",
    question: "Een alternatief scoort op alle relevante kwaliteitsattributen aantoonbaar beter dan de rest. Wat is de beste conclusie?",
    options: [
      "De trade-off is uitzonderlijk goed opgelost.",
      "Er is waarschijnlijk geen echte trade-off; er is een gegeven vastgesteld.",
      "De ADR hoeft geen alternatieven meer te noemen.",
    ],
  },
  {
    id: "m6-assess-02",
    question: "Een ADR bevat Titel, Status, Context, Beslissing en Alternatieven, maar niet wat de keuze daarna veroorzaakt. Welk kernonderdeel ontbreekt?",
    options: ["Status", "Consequenties", "Titel"],
  },
  {
    id: "m6-assess-03",
    question: "Een ADR noemt bij Consequenties alleen voordelen. Hoe beoordeel je dat?",
    options: [
      "Prima: nadelen horen bij risicoanalyse, niet bij een ADR.",
      "Onvolledig: lasten en negatieve gevolgen moeten ook zichtbaar zijn.",
      "Prima zolang de architect de nadelen mondeling kent.",
    ],
  },
] as const;