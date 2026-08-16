# Learning platform

Beveiligde Next.js-leeromgeving voor Enterprise Architecture Works. De applicatie gebruikt Supabase Auth, Row Level Security en cursusrechten uit de gedeelde Supabase-inrichting.

## Ontwikkelen

```bash
npm ci
npm run dev
```

De standaardconfiguratie wijst naar de geïsoleerde Supabase-testbranch. Productiesecrets horen uitsluitend in de hosting- of Supabase-omgeving en nooit in Git.
