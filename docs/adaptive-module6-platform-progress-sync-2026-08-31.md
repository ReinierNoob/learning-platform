# Adaptive Module 6 — standaard EAW platformprogress

**Datum:** 31 augustus 2026  
**Doel:** een geslaagde adaptive eindcheck synchroniseren met dezelfde EAW-voortgangsregistratie als vaste modules  
**Productie gewijzigd:** nee

## Architectuurbesluit

Er komt geen tweede adaptive completion-percentage.

De bestaande EAW-keten blijft canoniek:

`module_items → record-progress Edge Function → complete_module_item → get_my_learning_access.completion_percentage`

Adaptive mastery is didactisch bewijs; platformprogress is de centrale registratie van voortgang in de leeromgeving.

## Implementatie

Nieuw:

`lib/adaptive-platform-progress.ts`

Na een **volledig geslaagde** adaptive eindcheck kan de standaard `/leren`-route:

1. opnieuw de normale adaptive learning context valideren;
2. controleren dat de gepubliceerde Module 6-quiz inhoudelijk exact gelijk is aan de adaptive eindcheck;
3. de centrale `system_instruction`-antwoordsleutel ophalen;
4. controleren dat ook de centrale antwoordsleutel exact overeenkomt;
5. de bestaande vereiste content-items via `recordProgress` voltooien;
6. dezelfde assessment-antwoorden naar de centrale `record-progress` Edge Function sturen;
7. alleen bij centrale score 100 de sync als geslaagd behandelen;
8. `getLearningAccess` opnieuw ophalen om het actuele algemene completion percentage terug te geven.

## Fail-closed regels

Er worden **geen standaard progresswrites** gedaan wanneer vóór de eerste write één van deze controles faalt:

- andere vraagtekst;
- andere optievolgorde;
- ander aantal vragen;
- afwijkende centrale antwoordsleutel;
- geen exact één verplicht assessment-item;
- ontbrekende auth/entitlement/modulecontext.

Dit voorkomt dat adaptive content en het centrale cursusmodel ongemerkt uit elkaar groeien.

## Lab versus standaard leeromgeving

De QA/lab-harness schrijft geen normale platformprogress.

De standaard `/leren` host vraagt wel om synchronisatie. De referer bepaalt alleen **of** synchronisatie wordt geprobeerd; iedere write wordt daarna opnieuw server-side beschermd door:

- sessie;
- actieve entitlement;
- gepubliceerde cursus/module;
- inhoudelijk assessmentcontract.

Een vervalste referer kan dus geen voortgang voor een andere gebruiker of cursus schrijven.

## Huidige validatiestatus

- TypeScript/Next.js build van de progresskoppeling: PASS.
- Hergebruik centrale `record-progress` functie: PASS in code.
- Fail-closed assessmentcontract: PASS in code.
- Productie-mutatie: geen.

Een volledige data-E2E voor deze specifieke Solution Architecture-cursus kan pas wanneer er een branch-only gepubliceerde cursus/moduleconfiguratie bestaat die dezelfde quiz bevat. Er wordt nu bewust **geen productiecourse-row uitgevonden**, omdat `price_cents` en `launch_path` verplicht zijn en nog niet commercieel zijn besloten.

## Gate

**Implementatie platformprogress-sync: PASS.**  
**Branch-data E2E van de uiteindelijke Solution Architecture course-config: release-validatie, nog niet uitgevoerd.**
