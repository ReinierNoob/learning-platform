# Adaptive Module 6 — standaard `/leren` integratievalidatie

**Datum:** 31 augustus 2026  
**Scope:** Solution Architecture – Module 6  
**Productie gewijzigd:** nee  
**Tijdelijke Supabase development branch verwijderd:** ja

## Doel

Valideer de integratievolgorde die de normale learning route gebruikt:

`session → published course → learning access/entitlement → startCourse → published module → adaptive allowlist gate`

De adaptive presentatiecode is succesvol gecompileerd in de normale `/leren/[slug]/module/[id]` route. Deze validatie bewijst zowel de branch-only data-/HTTP-contracten als het transport door Vercel Deployment Protection tot in Next.js.

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

## Vercel / Next.js — protected transport

De geïntegreerde `/leren` code compileert en typecheckt succesvol op Vercel.

De eerdere share-link/SSO-route bleek ongeschikt voor machine-to-machine validatie. Daarna is dezelfde preview protection opnieuw getest via Vercel Trusted Sources met een kortlevend same-project OIDC-token.

Een tijdelijke `postbuild`-probe gebruikte `VERCEL_OIDC_TOKEN` uitsluitend als headerwaarde:

`x-vercel-trusted-oidc-idp-token`

tegen een eerder READY deployment van hetzelfde project. De tokenwaarde is niet gelogd of opgeslagen.

Resultaten:

| Request | Resultaat |
|---|---|
| `/lab/solution-architecture-module-6` | HTTP 200, geen Vercel SSO redirect |
| `/leren/solution-architectuur-ontwerppraktijk/module/6` | HTTP 307, applicatie-eigen redirect, geen Vercel SSO redirect |

Daarmee is bewezen dat de protected `/leren` request de Next.js applicatie bereikt en daarna door de eigen EAW-authflow wordt afgehandeld.

Daarom geldt nu:

- Vercel build + TypeScript: **PASS**;
- standaard platform HTTP-contracten tegen branch Supabase: **PASS**;
- auth endpoint: **PASS**;
- entitlement allow/deny: **PASS**;
- protected Vercel transport tot in Next.js: **PASS**;
- volledige authenticated `/leren` adaptive flow in één live run: **OPEN**;
- live desktop/mobile/screenreader: **OPEN**.

## Cleanup

Na de validaties:

- tijdelijke testprobe verwijderd;
- tijdelijke `postbuild` hook verwijderd;
- tijdelijke Supabase URL/key override uit de featurebranch verwijderd;
- tijdelijke adaptive presentation override verwijderd;
- tijdelijke Supabase branch verwijderd;
- testcredentials/tokens niet vastgelegd in de blijvende code of documentatie.

## Retrospective

### Wat werkte

- presentatie- en persistenceflags gescheiden houden beperkt blast radius;
- het normale platformcontract kan onafhankelijk van de adaptive didactiek worden bewezen;
- een echte Auth token + REST/RPC-calls geeft sterker bewijs dan alleen directe SQL;
- entitlement denial is in dezelfde keten controleerbaar;
- same-project OIDC/Trusted Sources omzeilt Deployment Protection zonder protection uit te zetten of een langlevend bypass-secret te beheren.

### Wat verbeterd moet worden

1. Gebruik voor same-project Vercel automation primair short-lived OIDC/Trusted Sources.
2. Gebruik `VERCEL_AUTOMATION_BYPASS_SECRET` alleen als fallback voor runners die geen geschikte OIDC identity kunnen leveren.
3. Maak een ondersteunde testuser-fixture via Auth Admin API/testrunner in plaats van duurzame handmatige SQL-fixtures.
4. Houd build-, data-contract-, protected-transport-, authenticated-runtime- en visuele UX-gates als afzonderlijke bewijscategorieën.
5. Combineer in de volgende run OIDC trusted-source access met branch-only EAW sessie/entitlement om de volledige `/leren` adaptive flow in één keten te bewijzen.

## Gatebesluit

**Standaard learning platform contract: PASS.**  
**Protected Vercel transport tot in Next.js: PASS.**  
**Volledige authenticated `/leren` adaptive E2E: OPEN.**  
**Live UX/mobile/screenreader: OPEN.**  
**Productierelease: NO-GO.**
