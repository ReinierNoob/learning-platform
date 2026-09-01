# Adaptive Solution Architecture Module 6 — tutor observation review

**Datum:** 2026-08-31  
**Branch:** `feature/adaptive-solution-architecture-module-6`  
**Productie gewijzigd:** nee  
**Status:** code/build PASS; persistence E2E en live browserbewijs nog open

## Aanleiding

De UX/persona-review vond dat Eva en Alexander inhoudelijke vragen stelden, maar de cursistrespons nog niet pedagogisch werd gebruikt. Een tekstveld alleen is geen tutorinteractie.

De nieuwe lus is:

`cursistredenering → server-side tutor observation → afgeleide evidence → feedback/vervolgvraag → herschrijven of doorgaan`

Wanneer persistence in een niet-productieomgeving is ingeschakeld:

`... → tutor_observation evidence → learner state behouden → adaptive decision → audittrail`

## Implementatie

Nieuwe API:

- `/api/lab/solution-architecture-module-6/observe`

Nieuwe pure classifier:

- `lib/module6-tutor-observation.ts`

Actieve UI:

- `AdaptiveModule6PilotV3.tsx`

### Ondersteunde prompt-interventies

1. `m6-trade-off-repair-v1`
   - verwacht expliciete winst én verlies;
   - kwaliteitsattribuut is aanvullende verdieping.
2. `m6-alternatieven-genereren-v1`
   - verwacht een substantief vierde alternatief;
   - geen inhoudelijke ‘goedkeuring’ van een specifieke oplossing, alleen didactische minimale uitwerking.
3. `m6-adr-onderdelen-check-v1`
   - verwacht herkenning van Consequenties/gevolgen.
4. `m6-alternatieven-transfer-v1`
   - verwacht een substantief alternatief plus expliciete trade-off.

## Classificatie

De observatie kent drie niveaus:

- `strong` → cursist kan door;
- `partial` → gerichte vervolgvraag, nog niet door;
- `needs_work` → herstelhint, nog niet door.

Bij wijziging van het antwoord wordt een eerdere observatie ongeldig en moet opnieuw worden beoordeeld.

## Privacy

De vrije antwoordtekst wordt **niet** naar `learning_evidence` geschreven.

Persistente tutor evidence bevat alleen afgeleide signalen, bijvoorbeeld:

- `level`;
- `canProceed`;
- compacte indicators zoals `winst_benoemd`, `verlies_ontbreekt`.

Daarmee blijft de audittrail didactisch bruikbaar zonder onnodig vrije cursisttekst te bewaren.

## Adaptive decision mapping

Zonder nieuwe database-enum te introduceren gebruikt de pilot bestaande semantische acties:

- strong → `challenge`;
- partial → `deeper_explanation`;
- needs_work → `extra_practice`.

De huidige mastery-state wordt door deze heuristische observatie niet automatisch overschreven. De observatie is aanvullend bewijs; formele mastery blijft primair gebaseerd op diagnostiek/assessment en toekomstige evidence-aggregatie.

## Belangrijke ontwerpkeuze

De eerste pilot gebruikt bewust een **deterministische classifier** in plaats van een vrije LLM-beoordeling.

Redenen:

- reproduceerbaar;
- uitlegbaar;
- minder risico op inhoudelijke hallucinatie;
- kleine en expliciete bronset;
- gemakkelijker te valideren voordat AI-evaluatie wordt toegevoegd.

Dit betekent niet dat iedere toekomstige tutorobservatie regex-gebaseerd moet blijven. Voor complexere open opdrachten kan later een rubric-gestuurde modelbeoordeling worden toegevoegd, maar alleen met:

- expliciete rubric;
- bronbegrenzing;
- structured output;
- confidence/fallback;
- menselijke/referentietestset;
- geen stille mastery-promotie.

## Reviewbevinding tijdens implementatie

Een te brede termset zou het woord `minder` zowel als winst als verlies kunnen herkennen. Dit is vóór activatie gecorrigeerd door contextspecifieke patronen te gebruiken, bijvoorbeeld:

- winst: `minder fouten`, `minder complex`, `betere vertrouwelijkheid`;
- verlies: `minder beschikbaar`, `meer afhankelijk`, `extra beheer`.

Generieke les: classifier-signalen mogen niet semantisch dubbelzinnig zijn wanneer twee tegengestelde categorieën daarmee worden bepaald.

## UX-gedrag

- de knop Volgende blijft geblokkeerd totdat de tutorobservatie `canProceed=true` retourneert;
- partial/needs_work toont feedback en een vervolgvraag;
- cursist past antwoord aan en laat Eva/Alexander opnieuw reageren;
- wijzigen van antwoord verwijdert de oude feedbackstatus;
- technische observation indicators blijven buiten de primaire leerervaring.

## Buildbewijs

Vercel deployment voor commit `3c90b35a977db6a33971add21e7f8cd7ddcfb9d6`:

- Next.js compile: PASS;
- TypeScript: PASS;
- `/api/lab/solution-architecture-module-6/observe`: aanwezig;
- `/lab/solution-architecture-module-6`: gegenereerd;
- deployment state: READY.

## Gate

| Gate | Status |
|---|---|
| Tutorvraag leidt tot verwerking | PASS |
| Server-side observatie | PASS |
| Strong/partial/needs_work feedbackflow | PASS in code |
| Vrije tekst niet persistent opgeslagen | PASS in ontwerp/code |
| Geen automatische mastery-promotie door heuristiek | PASS |
| Vercel/TypeScript build | PASS |
| Observation persistence op Supabase development branch | OPEN |
| Live browserinteraction A/B/C | OPEN |
| Mobile/touch/screenreaderbewijs | OPEN |
| Productie | NO-GO |

## Retrospective — nieuwe generieke regels

1. **Tutorvraag heeft een contract.** Iedere inhoudelijke vraag is expliciet `self_reflection`, `tutor_observation` of `assessment`.
2. **Geen decoratieve interactiviteit.** Als een antwoord vereist is, moet het antwoord feedback, evidence of een expliciet reflectiedoel hebben.
3. **Heuristische observatie promoveert mastery niet stilzwijgend.** Zij levert evidence; formele mastery volgt uit evidence-aggregatie en/of assessment.
4. **Vrije tekst is niet standaard persistence.** Bewaar alleen wat aantoonbaar nodig is; afgeleide compacte evidence heeft de voorkeur.
5. **Tegengestelde classifier-signalen mogen niet dezelfde ambigue tokenmatch delen.** Voeg negatieve/contrasterende regressiegevallen toe.
6. **Routekaart is status, geen bypass.** Toekomstige verplichte stappen blijven locked.
7. **Mobile taakvorm is expliciet.** Een desktopmatrix wordt niet automatisch een horizontale mobiele scrollcontainer.
8. **Build blijft geen browserbewijs.** Live browser/mobile/screenreader-gates blijven afzonderlijk.

## Volgende gate

Test de nieuwe `tutor_observation`-persistence op een tijdelijke Supabase development branch, inclusief minimaal:

- strong observation;
- partial observation;
- needs_work observation;
- antwoordwijziging + re-observation;
- afwezigheid van vrije antwoordtekst in evidence;
- decision ordering;
- entitlement denial;
- atomic rollback.

Daarvoor is opnieuw een tijdelijke betaalde Supabase development branch nodig en dus opnieuw expliciet kostenakkoord voordat die branch wordt aangemaakt.