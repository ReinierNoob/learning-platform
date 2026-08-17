# EAW learning-platform

Beveiligde leeromgeving voor Enterprise Architecture Works.

## Context

De bestaande werkende learning-platform PoC was als Vercel deployment aanwezig, maar de GitHub-repository bevatte alleen deze README. Deze branch reconstrueert de applicatiebron rond de bestaande gedeelde Supabase-leerdata en behoudt de functionele PoC-opzet: moduleoverzicht, hoofdstukken/video, AI-instructeur Alexander en zelftoets.

De bron van waarheid voor trainingsinhoud en voortgang is de gedeelde EAW Supabase-omgeving. Er is geen leerinhoud uit de live HTML in de repository gekopieerd.

## Vertrouwensgrenzen

- EAW beheert aankoop, account, catalogus en entitlement.
- `public.courses.id` is de canonieke `training_id`.
- De learning-app valideert bij toegang opnieuw `get_my_learning_access(training_id)`.
- `start_my_course(training_id)` registreert eerste opening/enrollment.
- `record-progress` en `complete_module_item` bepalen server-side voortgang en completion.
- `system_instruction` en de zelftoetssleutel zijn niet leesbaar voor de `authenticated` database-role; alleen servercode met een service-role kan deze ophalen.
- Video's blijven in de bestaande aparte Supabase Storage en worden uitsluitend met tijdelijke signed URLs aangeboden.

## SSO

EAW maakt via `create-learning-handoff` een eenmalige Supabase magic-link token hash. EAW stuurt naar:

`/auth/handoff?token_hash=...&training_id=...&next=/leren/<slug>`

De learning-app verifieert de token hash server-side, valideert het entitlement voor dezelfde `training_id`, zet daarna eigen HttpOnly sessiecookies en redirect naar een uitsluitend lokaal `next`-pad. Access- en refresh-tokens worden niet via queryparameters doorgegeven.

## Omgeving

Zie `.env.example`. Geheimen horen uitsluitend in Vercel environment variables; nooit in Git.

## Productiegate

De bestaande Vercel-productiedeployment blijft leidend totdat deze branch als preview succesvol is gebouwd en de volledige flow is getest:

EAW Mijn trainingen → one-time handoff → entitlementcontrole → module → video/chat → zelftoets → progress → completion → EAW bewijs van afronding.
