# Ekonomi Platform Monorepo

Produktionsinriktat monorepo för en svensk AI-baserad ekonomi- och verksamhetsplattform för serviceföretag. Repositoriet är byggt för att vara enkelt att förstå, lätt att ta över och tydligt uppdelat mellan presentation, affärslogik och datalager.

## Teknik

- `pnpm` arbetsyta med `Turborepo`
- TypeScript överallt
- `apps/web`: Next.js App Router + Tailwind + shadcn/ui-inspirerade komponenter
- `apps/mobile`: Expo + React Native
- `apps/api`: NestJS
- `packages/db`: Prisma + PostgreSQL
- Delade paket för `ui`, `types`, `utils`, `business` och `config`

## Mappstruktur

```text
.
|-- apps
|   |-- api
|   |-- mobile
|   `-- web
|-- packages
|   |-- business
|   |-- config
|   |-- db
|   |-- types
|   |-- ui
|   `-- utils
|-- package.json
|-- pnpm-workspace.yaml
`-- turbo.json
```

## Kom igång

1. Installera beroenden:

```bash
corepack pnpm install
```

2. Kopiera miljövariabler:

```bash
cp .env.example .env
```

3. Starta PostgreSQL lokalt och uppdatera `DATABASE_URL` vid behov.

4. Generera Prisma-klient, kör migration och seed:

```bash
corepack pnpm db:generate
corepack pnpm db:migrate
corepack pnpm db:seed
```

5. Starta alla appar i utvecklingsläge:

```bash
corepack pnpm dev
```

## Vanliga scripts

- `corepack pnpm dev`: startar web, api och mobile parallellt
- `corepack pnpm build`: bygger alla projekt
- `corepack pnpm lint`: kör lint i alla projekt
- `corepack pnpm test`: kör definierade tester
- `corepack pnpm db:generate`: genererar Prisma-klient
- `corepack pnpm db:migrate`: kör första databasmigrationen
- `corepack pnpm db:seed`: lägger in demoorganisation och demoanvändare

## Arkitekturidé

- `apps/web` fokuserar på enkel dashboard och arbetsflöden för användaren
- `apps/api` ansvarar för API, moduler och orkestrering
- `packages/business` innehåller återanvändbar affärslogik
- `packages/db` innehåller schema, migrationer, seed och Prisma-klient
- `packages/types` definierar stabila domänkontrakt
- `packages/ui` levererar delade UI-komponenter för web
- `packages/utils` innehåller rena hjälpfunktioner utan domänberoenden

## Demo

Seed-data skapar:

- Företaget `Nordic Service Group AB`
- Demoanvändaren `Anders Larsson`
- Några kunder, projekt, tidrader, kvitton och AI-insikter

Dashboarden i webben visar svensk text och en lugn, ljus startsida med:

- välkomsthälsning
- AI-sammanfattning
- snabba åtgärder
- senaste aktiviteter

## Paket och appar

Varje app och paket har en egen README med lokal kontext och ansvar.
