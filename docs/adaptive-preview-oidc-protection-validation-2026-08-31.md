# Adaptive preview OIDC protection validation — 2026-08-31

## Doel

Bewijs dat de protected Vercel preview daadwerkelijk tot in Next.js kan worden bereikt zonder Deployment Protection te verlagen en zonder een langlevend automation-bypass secret te introduceren.

## Methode

Een tijdelijke `postbuild`-probe is op de featurebranch uitgevoerd. De nieuwe preview ontving tijdens build het kortlevende `VERCEL_OIDC_TOKEN` en stuurde dit als:

`x-vercel-trusted-oidc-idp-token`

naar een eerder READY deployment van hetzelfde Vercel-project.

De probe bevatte of logde de tokenwaarde niet.

## Resultaten

### QA-harness

Request:

`/lab/solution-architecture-module-6`

Resultaat:
- HTTP 200;
- geen redirect naar `vercel.com/sso-api`;
- protected deployment is dus via Trusted Sources tot in de applicatie bereikt.

### Standaard learning route

Request:

`/leren/solution-architectuur-ontwerppraktijk/module/6`

Resultaat:
- HTTP 307;
- redirect geclassificeerd als applicatie-eigen redirect;
- geen Vercel SSO redirect;
- hiermee is bewezen dat de request de Next.js `/leren`-route bereikt en daarna door de eigen EAW-authflow wordt afgehandeld.

## Beveiligingskeuze

Er is geen Deployment Protection uitgezet.
Er is geen share-link als CI-authenticatie gebruikt.
Er is geen langlevend `VERCEL_AUTOMATION_BYPASS_SECRET` aangemaakt.

Voor same-project Vercel automation heeft short-lived OIDC/Trusted Sources de voorkeur boven een langlevend bypass-secret.

## Cleanup

Na de valide run zijn verwijderd:
- tijdelijke `postbuild` hook;
- tijdelijke OIDC probe-script.

De reguliere buildconfiguratie is hersteld en opnieuw gedeployed.

## Gate-status

PASS:
- protected preview transport naar applicatie;
- protected `/leren` route bereikt Next.js;
- Vercel OIDC self-access/Trusted Sources werkt voor dit project.

OPEN:
- authenticated `/leren` E2E met branch-only Solution Architecture cursus/module/entitlement;
- interactieve browser routes A/B/C;
- mobile/touch;
- keyboard/screenreader;
- geïntegreerde persona-review.

**Productie blijft NO-GO.**
