# Commonplace

Commonplace is a private, local-first household finance tracker. It stores member and expense records in the browser's IndexedDB database; there is no application server, account system, analytics, or network API. Shared purchases are allocated proportionally by monthly net income, while personal expenses remain assigned to one member.

## Documentation

- [Architecture](arquitectura.md): browser boundary, IndexedDB, calculations, reports, and privacy model.
- [Installation and Operations](guia-instalacion.md): Docker/Make setup, lifecycle, quality checks, and troubleshooting.
- [User Manual](manual-usuario.md): household setup, transactions, reporting, and backup workflows.
- [Technical Reference](referencia-tecnica.md): stored types, internal domain functions, backup format, and exports. This application has no HTTP API.

## Features

- Manage household members and monthly take-home income.
- Split shared expenses by income weight, distributing leftover cents deterministically so member shares always add up to the original expense.
- Record personal expenses against one household member.
- Review monthly spending, balances, trends, categories, and an itemized ledger.
- Search and filter the ledger by description, category, and expense type.
- Export CSV and printable PDF reports for any date range and category, including a member contribution chart.
- Export a versioned JSON backup and validate before atomically replacing or merging records.
- Keep all household records on the current browser and device.

## Requirements

Docker Engine, Docker Compose, and GNU Make are required on the host. Node.js, npm, and application dependencies are installed and run only inside Docker containers.

## Common commands

Run these commands from the project root:

| Command | Description |
| --- | --- |
| `make help` | List available targets |
| `make dev` | Build and run the Vite development server in the foreground |
| `make up` | Build and start the development server in the background |
| `make stop` | Stop development and production containers without removing them |
| `make down` | Stop and remove both Compose stacks; preserve the dependency volume |
| `make restart` | Start or rebuild the development server |
| `make logs` | Follow development server logs |
| `make test` | Run tests and the coverage gate inside Docker |
| `make test-watch` | Run Vitest in watch mode inside Docker |
| `make lint` | Run ESLint inside Docker |
| `make build` | Run the strict TypeScript check and production build inside Docker |
| `make production` | Build and run the static Nginx production image |
| `make production-stop` | Stop and remove the production stack |
| `make status` | Show development and production container status |
| `make clean` | Stop both stacks, remove generated/cache directories, and remove the development dependency volume |

The development app is available at <http://localhost:5173>. The production target defaults to <http://localhost:8081>, because port 8080 may already be in use; choose another port with `make PORT=8082 production`.

`make clean` removes `node_modules`, `dist`, `coverage`, `.vite`, both stacks, and the development npm volume. It does not remove Docker images or browser storage. To stop foreground `make dev`, press `Ctrl+C`; `make stop` stops background containers.

## Tests and quality gates

Vitest, Testing Library, and fake IndexedDB run in the Docker test service. Tests cover cent-accurate income weighting, date-range and category filters, summaries, currency validation, CSV formula-injection protection, PDF generation, backup validation and merging, IndexedDB transactions, and member/expense UI workflows. Domain line coverage has an 85% minimum threshold.

Available scripts inside the container are `npm run test`, `npm run test:coverage`, `npm run test:watch`, `npm run lint`, and `npm run build`. The Makefile wraps the commonly used commands so host-side Node/npm is not needed.

## Privacy and data

The app stores data in an IndexedDB database named `commonplace-household`. There is no server-side database or synchronization. Data is isolated to the browser profile and origin where it was entered. Clearing browser site data, removing the browser profile, or switching devices can permanently remove the ledger; export a JSON backup regularly and keep it somewhere you control. Anyone with access to the same browser profile can access the ledger.

The development origin (`localhost:5173`) and production origin (`localhost:8081` by default) have separate browser databases. Use the same URL consistently or export a backup before switching between them.

Backups are versioned and limited to 10 MB. Restore validates the entire file before changing data; overwrite and merge operations are atomic. CSV exports neutralize spreadsheet formula prefixes in user-provided text.

## Financial calculations

Each shared expense is split using a member's non-negative monthly income divided by the household's combined income. If every income is zero, the expense is split equally. Shares use integer cents; the largest fractional remainders receive leftover cents with stable member-order tie-breaking. Personal expenses do not affect other members' balances. Current income weights apply to all shared expenses in the selected period.

The interface and source are in English. The default report currency is USD; currency input accepts decimal amounts with up to two decimal places.

## Architecture

```text
src/
  App.tsx                 Application views and workflows
  domain/
    backup.ts             Versioned backup validation and merging
    database.ts           IndexedDB persistence and transactions
    finance.ts            Income weights, cent allocation, date filters
    format.ts             Currency and date formatting
    reports.ts            CSV and printable PDF exports
    *.test.ts             Domain and persistence tests
  App.test.tsx            Household workflow tests
compose.yaml              Development and Docker test services
compose.prod.yaml         Static production service
Dockerfile                Development, build, and production stages
Makefile                  Docker-backed lifecycle and quality commands
doc/
  README.md               Documentation index and overview
  arquitectura.md         System/data architecture and privacy
  guia-instalacion.md     Docker setup and operations
  manual-usuario.md       Household and reporting workflows
  referencia-tecnica.md   Local types, persistence, and exports
```
