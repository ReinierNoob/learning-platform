# Adaptive Solution Architecture Module 6 — persistence runtime integration

**Datum:** 2026-08-31  
**Branch:** `feature/adaptive-solution-architecture-module-6`  
**Status:** code complete / preview build PASS / live persistence environment not yet configured

## Doel

De eerder gevalideerde Adaptive Learning v2 persistence-laag koppelen aan de daadwerkelijke Module 6 pilotflow zonder productie te wijzigen.

## Gerealiseerde runtimeketen

Wanneer `EAW_ADAPTIVE_PERSISTENCE_ENABLED=true` in een niet-productieomgeving:

1. Eva-diagnostiek wordt server-side geclassificeerd.
2. De bestaande learning sessie wordt gevalideerd.
3. De cursus `solution-architectuur-ontwerppraktijk`, actieve entitlement, enrollment en gepubliceerde bronmodule 6 worden gecontroleerd via de bestaande EAW learning-access laag.
4. Profiel + compacte diagnostische evidence + routebeslissing worden atomisch opgeslagen via `adaptive_record_transition(...)`.
5. Route A/B/C wordt uitgevoerd.
6. Een expliciete learner override wordt via een aparte API als evidence + decision vastgelegd.
7. De eindcheck wordt server-side beoordeeld.
8. Assessment evidence + mastery-update + eventuele remediation-decision worden atomisch opgeslagen.
9. Bij refresh haalt `/state` de persistente route, mastery, misconcepties en recente evidence op zodat de cursist niet opnieuw hoeft te beginnen.

Wanneer de feature flag uit staat blijft de pilot session-only werken.

## Nieuwe/gewijzigde componenten

- `lib/adaptive-pilot-runtime.ts`
  - canonieke course slug en module-id;
  - schema/classifier/orchestrator versions;
  - preview-only persistence feature flag;
  - HTTP-mapping voor learning-access errors.

- `app/api/lab/solution-architecture-module-6/diagnose/route.ts`
  - persistence van diagnostic evidence en routebeslissing;
  - geen vrije antwoordtekst opgeslagen, alleen compacte didactische bewijsresultaten.

- `app/api/lab/solution-architecture-module-6/assess/route.ts`
  - persistence van assessment evidence, mastery en remediation-decision.

- `app/api/lab/solution-architecture-module-6/state/route.ts`
  - state restore op basis van het bestaande enrollmentgebonden learner profile.

- `app/api/lab/solution-architecture-module-6/override/route.ts`
  - audit van expliciete learner route override.

- `AdaptiveModule6Pilot.tsx`
  - state restore bij laden;
  - route override via server endpoint;
  - zichtbare persistence-status;
  - foutmelding voor ontbrekende authenticatie/toegang in persistence mode.

## Fail-closed gedrag

Persistence is alleen actief als beide voorwaarden gelden:

- `VERCEL_ENV !== "production"`;
- `EAW_ADAPTIVE_PERSISTENCE_ENABLED === "true"`.

Bij persistence mode wordt niet stil teruggevallen naar session-only als auth, entitlement of database persistence faalt. De request faalt expliciet, zodat een test nooit ten onrechte als succesvol persistent wordt beoordeeld.

## Privacykeuze

De diagnostische vrije tekst van de cursist wordt niet naar `learning_evidence` gekopieerd. De persistence bevat per vraag alleen:

- objective id;
- pass/uncertain resultaat;
- evidence strength;
- classifier version;
- bron-id.

Dit volgt het principe: bewaar didactisch bewijs, niet automatisch volledige chat-/antwoordinhoud.

## Buildvalidatie

Vercel preview na de runtime-integratie: **READY**.

Geen TypeScript- of Next.js-buildfouten. De enige buildmelding is de bestaande Node `engines >=22.13.0` waarschuwing; deze is niet door Adaptive Learning geïntroduceerd.

## Nog open voor echte end-to-end persistence

1. tijdelijke Supabase development branch aanmaken;
2. drie reeds gevalideerde adaptive migraties daarop toepassen;
3. branch-only testcursus/module/testuser/entitlement/enrollment aanmaken;
4. preview laten wijzen naar die branch;
5. server-only branch service-role key aan de Preview environment toevoegen;
6. `EAW_ADAPTIVE_PERSISTENCE_ENABLED=true` voor die preview zetten;
7. diagnose → refresh → override → assessment → remediation → refresh uitvoeren;
8. database audittrail na iedere stap controleren;
9. daarna branch en tijdelijke secrets weer verwijderen.

Voor een nieuwe Supabase development branch is opnieuw expliciete kostenbevestiging nodig.

## Gate

**Runtime code integration:** PASS  
**Session-only regression/build:** PASS  
**Persistence fail-closed:** PASS in code  
**State restore:** PASS in code  
**Learner override audit:** PASS in code  
**Live browser persistence:** OPEN  
**Production release:** NO-GO
