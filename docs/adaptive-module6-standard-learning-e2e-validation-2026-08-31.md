# Adaptive Module 6 — standaard `/leren` integratievalidatie

**Datum:** 31 augustus 2026  
**Scope:** Solution Architecture – Module 6  
**Productie gewijzigd:** nee  
**Tijdelijke Supabase development branch verwijderd:** ja

## Doel

Valideer de integratievolgorde die de normale learning route gebruikt:

`session → published course → learning access/entitlement → startCourse → published module → adaptive allowlist gate`

De adaptive presentatiecode is eerder al succesvol gecompileerd in de normale `/leren/[slug]/module/[id]` route. Deze run valideert de branch-only data- en HTTP-contracten waar die route op steunt.

## Branch-only fixture

Op een tijdelijke Supabase development branch zijn uitsluitend synthetische testrecords aangemaakt voor:

- een bevestigde Auth testgebruiker;
- `solution-architectuur-ontwerppraktijk` als gepubliceerde testcursus;
- gepubliceerde Module 6 `Ontwerpkeuzes en trade-offs`;
- een betaald testorder/item;
- actief entitlement;
- enrollment voor Module 6.

Geen productiegegevens zijn gekopieerd.

## Auth-runtimebevinding

De actuele Supabase Auth-schema's bevatten generated columns:

- `auth.users.confirmed_at`;
- `auth.identities.email`.

Deze waarden mogen niet handmatig worden ingevuld in een fixture. De werkende branch-only fixture laat ze door het schema afleiden en gebruikt `instance_id = 00000000-0000-0000-0000-000000000000` voor de email/password testuser.

Dit is een testfixturebevinding, geen aanbeveling om productie-authgebruikers via SQL te beheren.

## Echte Auth endpoint

De branch-only gebruiker is aangemeld via:

`POST /auth/v1/token?grant_type=password`

Resultaat:

- HTTP 200;
- access token aanwezig;
- refresh token aanwezig;
- expiry 3600 seconden.

Tokens en wachtwoord zijn niet in GitHub-documentatie opgeslagen.

## Exacte HTTP-contractketen uit `lib/platform.ts`

Met het echte access token zijn de HTTP-calls uitgevoerd die de learning app zelf gebruikt.

| Stap | Resultaat |
|---|---|
| `/auth/v1/user` | 200, juiste testuser |
| published `courses` query | 200, exact één Solution Architecture course |
| `get_my_learning_access` | 200, `can_access=true` |
| `start_my_course` | 200, bestaande test-enrollment teruggegeven |
| published `course_modules` query | 200, Module 6 gevonden en gepubliceerd |

De teruggegeven enrollment was dezelfde enrollment als de branch-only fixture. `start_my_course` gedroeg zich dus idempotent voor deze testcontext.

## Entitlement denial

Het test-entitlement is tijdelijk op `revoked` gezet en dezelfde `get_my_learning_access` HTTP-RPC is opnieuw uitgevoerd.

Resultaat:

- HTTP 200;
- `can_access=false`;
- `entitlement_status=revoked`.

Daarna is het branch-only entitlement terug op `active` gezet.

## Vercel / Next.js

De geïntegreerde `/leren` code compileert en typecheckt succesvol op Vercel.

Een tijdelijke probe is gemaakt om de beschermde preview daadwerkelijk via HTTP te openen met de branch-only sessie. Vercel Deployment Protection onderschepte de request echter vóór Next.js en stuurde hem naar `vercel.com/sso-api`.

Ook de officiële tijdelijke share-link vereiste in de beschikbare machine-to-machine route een Vercel SSO/browsercookieflow die niet kon worden afgerond. Dit is een infrastructuur-/testtransportbeperking; het is geen PASS of FAIL van de Next.js route.

Daarom geldt:

- Vercel build + TypeScript: **PASS**;
- standaard platform HTTP-contracten tegen branch Supabase: **PASS**;
- auth endpoint: **PASS**;
- entitlement allow/deny: **PASS**;
- protected Vercel `/leren` request tot in Next.js: **OPEN**;
- live desktop/mobile/screenreader: **OPEN**.

## Cleanup

Na de test:

- tijdelijke testprobe verwijderd;
- tijdelijke Supabase URL/key override uit de featurebranch verwijderd;
- tijdelijke adaptive presentation override verwijderd;
- tijdelijke Supabase branch verwijderd;
- testcredentials/tokens niet vastgelegd in de blijvende code of documentatie.

## Retrospective

### Wat werkte

- presentatie- en persistenceflags gescheiden houden beperkt blast radius;
- het normale platformcontract kan onafhankelijk van de adaptive didactiek worden bewezen;
- een echte Auth token + REST/RPC-calls geeft sterker bewijs dan alleen directe SQL;
- entitlement denial is in dezelfde keten controleerbaar.

### Wat verbeterd moet worden

1. Voeg een officiële `VERCEL_AUTOMATION_BYPASS_SECRET` toe voor geautomatiseerde previewtests.
2. Gebruik die bypass in Playwright/agent-browser CI, niet share-link SSO voor machine-to-machine tests.
3. Maak een ondersteunde testuser-fixture via Auth Admin API/testrunner in plaats van duurzame handmatige SQL-fixtures.
4. Houd build-, data-contract-, HTTP-route- en visuele UX-gates als afzonderlijke bewijscategorieën.

## Gatebesluit

**Standaard learning platform contract: PASS.**  
**Protected Vercel `/leren` HTTP E2E: OPEN.**  
**Live UX/mobile/screenreader: OPEN.**  
**Productierelease: NO-GO.**
