# MetaFan — Documentazione Tecnica Completa

> Versione: 1.2.0 · Aggiornato: Aprile 2026

---

## Sommario

1. [Panoramica del Progetto](#1-panoramica-del-progetto)
2. [Stack Tecnologico](#2-stack-tecnologico)
3. [Struttura Directory](#3-struttura-directory)
4. [Design System](#4-design-system)
5. [Pagine Pubbliche](#5-pagine-pubbliche)
6. [Area Gestionale (Dashboard)](#6-area-gestionale-dashboard)
7. [Componenti Riutilizzabili](#7-componenti-riutilizzabili)
8. [API Routes](#8-api-routes)
9. [Autenticazione & Sicurezza](#9-autenticazione--sicurezza)
10. [Database](#10-database)
11. [Account Disponibili](#11-account-disponibili)
12. [Guida allo Sviluppo](#12-guida-allo-sviluppo)

---

## 1. Panoramica del Progetto

**MetaFan** è una web application per un'azienda di manifattura elettronica specializzata in
Industria 4.0. Il sistema espone:

- Un **sito pubblico** con presentazione dei servizi, tecnologie, about e contatti
- Un'**area gestionale protetta** (dashboard) per la gestione del database, ordini di produzione e connessione VPN remota

Il sito è accessibile pubblicamente; la dashboard richiede autenticazione via cookie di sessione.

---

## 2. Stack Tecnologico

| Layer | Tecnologia | Versione |
|---|---|---|
| Framework | Next.js (App Router) | 16.x |
| UI Library | React | 19.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | v4 |
| Database | Turso (libSQL / SQLite edge) | latest |
| DB Client | @libsql/client | latest |
| Runtime | Node.js | 20+ |
| Deployment | Vercel (consigliato) | — |

### Dipendenze principali

```json
{
  "next": "^16",
  "react": "^19",
  "typescript": "^5",
  "@libsql/client": "latest",
  "tailwindcss": "^4"
}
```

---

## 3. Struttura Directory

```
metafan/
├── app/                          # Next.js App Router
│   ├── globals.css               # Design system + Tailwind tokens
│   ├── layout.tsx                # Root layout (font Inter, metadata)
│   ├── page.tsx                  # Homepage pubblica
│   ├── about/page.tsx            # Pagina Chi Siamo
│   ├── contact/page.tsx          # Pagina Contatti (form)
│   ├── services/page.tsx         # Pagina Servizi con cowork I4.0
│   ├── technology/page.tsx       # Pagina Tecnologie + gestione macchine
│   ├── login/page.tsx            # Pagina Login
│   ├── dashboard/page.tsx        # Area gestionale protetta
│   └── api/
│       ├── login/route.ts        # POST /api/login
│       ├── logout/route.ts       # POST /api/logout
│       ├── orders/route.ts       # GET /api/orders
│       └── db/route.ts           # GET+POST /api/db (CRUD completo)
│
├── components/
│   ├── Navbar.tsx                # Navigazione pubblica sticky
│   ├── Footer.tsx                # Footer con link e social
│   └── OrdersDashboard.tsx       # Dashboard ordini produzione (BI)
│
├── lib/
│   └── db.ts                     # Client Turso DB (singleton)
│
├── middleware.ts                  # Protezione route /dashboard
│
├── public/
│   └── machines/                 # Immagini SVG macchine industriali
│       ├── cnc-5axis.svg
│       ├── pick-place.svg
│       ├── reflow-oven.svg
│       ├── aoi-saki.svg
│       ├── 3d-sls.svg
│       ├── laser-cutter.svg
│       ├── wave-solder.svg
│       └── flying-probe.svg
│
├── DOCUMENTATION.md              # Questo file
├── package.json
├── next.config.ts
├── middleware.ts
├── tsconfig.json
└── postcss.config.mjs
```

> **Legacy**: La directory `/frontend/` e `/backend/` contengono un prototipo PHP/HTML
> non più in uso attivo. Tutta la logica produttiva è nel codice Next.js.

---

## 4. Design System

Il design system è definito in `app/globals.css` e usa Tailwind CSS v4 con token custom.

### Palette colori

| Variabile CSS | Valore | Uso |
|---|---|---|
| `--gold` | `#c9a44c` | Accento principale |
| `--gold-light` | `#e2c373` | Gradienti, highlight |
| `--gold-dark` | `#a88630` | Hover, ombre |
| `--bg-primary` | `#060910` | Sfondo globale |
| `--surface-1` | `#0c1120` | Card primer livello |
| `--surface-2` | `#111827` | Card secondo livello |
| `--surface-3` | `#1a2332` | Bordi, testate tabelle |
| `--surface-4` | `#212d40` | Elementi interattivi |

### Classi utility principali

| Classe | Comportamento |
|---|---|
| `.glow-card` | Card con hover lift + ombra gold |
| `.text-gradient` | Testo con gradiente gold |
| `.hero-grid` | Pattern griglia sottile (sfondo hero) |
| `.dash-table` | Stili tabella dashboard |
| `.animate-fade-up` | Animazione fadeUp 0.6s |
| `.pulse-dot` | Punto pulsante (status indicatori) |
| `.spin` | Spinner rotante |
| `.stagger-1` … `.stagger-6` | Delay animazioni scaglionate |

### Animazioni CSS

- `fadeUp` — entrata dal basso
- `pulseDot` — pulsazione ciclica
- `spin` — rotazione continua
- `toastIn/Out` — notifica scorrimento
- `modalIn` — apertura modale con scale

---

## 5. Pagine Pubbliche

### 5.1 Homepage (`app/page.tsx`)

Pagina di presentazione principale con:
- Hero section con CTA
- Grid servizi in anteprima
- Sezione I4.0 highlights
- Navigazione verso le sezioni principali

### 5.2 Servizi (`app/services/page.tsx`)

**Componente client** (richiede `"use client"`).

Visualizza 6 card di servizio, ciascuna con:
- Icona, titolo, descrizione, features list
- **Pannello espandibile "Cooperazione Uomo-Macchina"** (I4.0)
  - Due colonne: ruolo Operatore vs ruolo Sistema I4.0
  - Descrizione della sinergia
  - KPI di miglioramento

**Servizi disponibili:**

| Servizio | KPI Cowork |
|---|---|
| Progettazione PCB | −65% errori design |
| Soluzioni IoT | −70% tempo risposta allarmi |
| Sistemi AR/VR | −40% errori operativi |
| Stampa 3D | Iterazioni prototipo 5→2 |
| Firmware & Embedded | −55% debug time |
| Manifattura & Collaudo | Scarto 2.5%, +73% produttività |

**State:** `expandedId: string | null` — ID del pannello aperto (uno alla volta).

### 5.3 Tecnologie (`app/technology/page.tsx`)

**Componente client** (richiede `"use client"`).

Sezioni:
1. **Pilastri I4.0** — 4 card con metriche (riduzione consumi, integrazione dati, HMI, BI)
2. **Tabella comparativa** — Mercato tradizionale vs MetaFan su 6 parametri
3. **Parco Macchine** — 8 macchine industriali con controlli di gestione
4. **Stack tecnologico** — 4 aree con strumenti e competenze
5. **Certificazioni** — 6 certificazioni qualità

#### Gestione Macchine

Ogni macchina ha uno stato gestibile interattivamente:

```typescript
interface MachineConfig {
  power: number;         // 0–100% livello potenza
  status: MachineStatus; // 'active' | 'maintenance' | 'offline'
}
```

**Specifiche base macchine:**

| Macchina | Potenza (kW) | Consumo ciclo (kWh) | Temp. max (°C) |
|---|---|---|---|
| CNC Fresatrice 5-Assi | 7.5 | 3.2 | 85 |
| Pick & Place SMT | 2.1 | 1.8 | 45 |
| Reflow Oven IR | 12.0 | 4.8 | 260 |
| AOI Saki BF-Comet | 0.8 | 0.6 | 40 |
| Stampante 3D SLS | 3.5 | 2.8 | 200 |
| Laser Cutter CO₂ | 5.0 | 3.5 | 60 |
| Saldatrice a Onda | 8.0 | 4.2 | 250 |
| Flying Probe Tester | 0.5 | 0.4 | 35 |

**Calcoli live:**
- `currentPower = basePowerKw × (power / 100)`
- `currentConsumption = baseConsumptionKwh × (power / 100)`
- `currentTemp = maxTempC × (power / 100) × 0.9`

**Aggregati:** Totale potenza attiva, totale consumo ciclo, conteggio macchine attive.

### 5.4 Chi Siamo (`app/about/page.tsx`)

Pagina statica con storia, valori e team aziendale.

### 5.5 Contatti (`app/contact/page.tsx`)

Componente client con form di contatto:
- Campi: nome, email, oggetto, messaggio
- Validazione lato client
- Invio via `fetch` (attualmente con risposta simulata)

### 5.6 Login (`app/login/page.tsx`)

Componente client con form di autenticazione.
- `POST /api/login` con username e password
- In caso di successo: redirect a `/dashboard`
- In caso di errore: mostra messaggio inline

---

## 6. Area Gestionale (Dashboard)

### File: `app/dashboard/page.tsx`

**Componente client** protetto da cookie di sessione. Il middleware blocca l'accesso
a `/dashboard` se `mf_session !== "1"`.

### Layout

Il layout usa `h-screen overflow-hidden` sull'elemento radice per garantire che:
- La sidebar rimanga **sempre visibile** indipendentemente dall'altezza del contenuto
- Lo scrolling avvenga solo nell'elemento `<main>` (interno)
- La sidebar non si sposti mai durante lo scorrimento

```
┌──────────────────────────────────────────┐
│  Sidebar (260px, fisso)  │  Topbar        │
│  ────────────────────    │  ─────────────  │
│  📊 Panoramica           │                │
│  🏭 Ordini Produzione    │  CONTENUTO     │
│  🔐 VPN Aziendale        │  (overflow-    │
│  🔍 Visualizza Dati      │   auto, scr.   │
│  ➕ Aggiungi Record      │   interno)     │
│  ✏️  Modifica Record     │                │
│  🗑️  Elimina Record      │                │
│  ⚠️  Elimina Tabella     │                │
│  ─────────────────────   │                │
│  🌐 Sito Pubblico        │                │
│  🚪 Logout               │                │
└──────────────────────────────────────────┘
```

### Viste disponibili

| View ID | Descrizione |
|---|---|
| `overview` | KPI stats + lista tabelle DB |
| `ordini` | Dashboard ordini produzione (BI) |
| `vpn` | Pannello VPN aziendale |
| `view` | Visualizza dati di una tabella |
| `add` | Inserisci un nuovo record |
| `edit` | Modifica un record esistente |
| `delete` | Elimina un record |
| `drop` | Elimina una tabella intera |

### Funzionalità VPN

Il pannello VPN (`view === "vpn"`) simula una connessione VPN aziendale:

**Stati:**
- `disconnected` — nessun tunnel attivo
- `connecting` — handshake in corso (2.5 secondi simulati con `setTimeout`)
- `connected` — tunnel sicuro attivo

**Quando connesso mostra:**
- Server: MetaFan HQ (10.10.0.1) · Protocollo: OpenVPN / AES-256-GCM · Latenza: 12ms
- Lista sessioni dipendenti attive con IP, location, attività corrente
- Un indicatore animato (pulse-dot verde)

**Indicatore sidebar:** Punto colorato nella voce "VPN Aziendale" quando la connessione
è attiva (verde = connesso, giallo = connessione in corso).

### Username dinamico

Il dashboard legge il cookie non-httpOnly `mf_user` per visualizzare l'username
corrente nell'header (top-right). Il cookie viene impostato al login insieme al
cookie di sessione.

### Validazione numeri negativi

I form di inserimento e modifica hanno l'attributo `min="0"` su tutti i campi
numerici (rilevati via `getInputType()`), impedendo l'inserimento di valori negativi.

### Sub-componenti

#### `TableSelector`
Barra di tab per selezionare la tabella attiva.

#### `ResponsiveRows`
Tabella dati responsive:
- **Desktop** (`md:`) → `<table>` classica con header sticky
- **Mobile** → card grid con tutti i campi espansi

**Props:**
```typescript
{
  columns: Column[];
  rows: Row[];
  summaryColumns: Column[];   // Colonne mostrate nel riepilogo card mobile
  emptyLabel: string;
  actionLabel?: string;        // Etichetta pulsante azione
  onAction?: (row: Row) => void;
  actionVariant?: "gold" | "danger";
}
```

#### `VpnPanel`
Pannello VPN autonomo.

**Props:**
```typescript
{
  status: VpnStatus;
  connectedAt: string | null;
  onToggle: () => void;
  sessions: VpnSession[];
}
```

#### `Spinner`
Indicatore di caricamento centrato.

#### `getInputType(column: Column)`
Funzione che mappa il tipo di colonna DB al tipo HTML input:
- `email` per campi con "email" nel nome
- `datetime-local` per "timestamp"
- `date` per "data"
- `number` per INT, REAL, FLOAT, DOUBLE, NUMERIC, DECIMAL
- `text` per tutto il resto

---

## 7. Componenti Riutilizzabili

### 7.1 Navbar (`components/Navbar.tsx`)

**Componente client** — navigazione principale del sito pubblico.

**Comportamento:**
- Trasparente quando la pagina è in cima
- Sfondo scuro con blur (`rgba(12,17,32,.85)`) dopo 40px di scroll
- Link attivo evidenziato con bordo gold
- Mobile: menu fullscreen overlay con hamburger animato

**Link di navigazione:**

| Label | Path |
|---|---|
| Home | `/` |
| Chi Siamo | `/about` |
| Servizi | `/services` |
| Tecnologie | `/technology` |
| Contatti | `/contact` |
| Area Gestione (CTA gold) | `/login` |

### 7.2 Footer (`components/Footer.tsx`)

Footer statico con:
- Logo MetaFan
- Colonne di link: Servizi, Azienda, Contatti
- Link social
- Copyright

### 7.3 OrdersDashboard (`components/OrdersDashboard.tsx`)

Dashboard BI per gli ordini di produzione. Usato in `dashboard/page.tsx` con `view === "ordini"`.

**Struttura:**

1. **4 KPI Cards** — Totale ordini, Ore lavorate, Consumo energetico, Tempo medio ciclo
2. **Banner risparmio energetico** — Confronto vs standard di mercato
3. **Analisi per macchina** — Grid card per ogni macchina con ordini, ore, kWh, risparmio%, qualità%
4. **Tabella ordini** — Ordinabile per macchina/ore/tempo, con badge esito colorati
5. **Modal dettaglio ordine** — Immagine macchina, esito, spec energetiche, risorse, descrizione ciclo, interpretazione dati I4.0

**Tipi principali:**

```typescript
interface ProductionOrder {
  id: number;
  codice_ordine: string;       // ORD-2026-XXXX
  macchina: MachineType;
  immagine_macchina: string;   // Path SVG
  ore_lavorate: number;        // >= 0.5h (clamped)
  tempo_produzione_min: number; // >= 1 min
  consumo_kwh: number;         // >= 0.1 kWh
  consumo_standard_kwh: number; // Riferimento mercato
  risorse_utilizzate: string[];
  descrizione_ciclo: string;
  esito: "Superato" | "Scarto" | "Necessita revisione";
  data_produzione: string;
  operatore: string;
  lotto: string;
}
```

**Logica esito (colori badge):**
- `Superato` → verde `#4ade80`
- `Scarto` → rosso `#f87171`
- `Necessita revisione` → giallo `#fbbf24`

---

## 8. API Routes

### `POST /api/login`

**File:** `app/api/login/route.ts`

Autentica l'utente e imposta i cookie di sessione.

**Request body:**
```json
{ "username": "string", "password": "string" }
```

**Response (successo):**
```json
{ "ok": true, "role": "admin" | "company" }
```

**Response (errore):**
```json
{ "ok": false, "error": "Credenziali non valide" }  // 401
```

**Cookie impostati:**
- `mf_session=1` — httpOnly, 8h, sameSite: lax
- `mf_user=<username>` — non-httpOnly, 8h (per display nel dashboard)

---

### `POST /api/logout`

**File:** `app/api/logout/route.ts`

Termina la sessione eliminando entrambi i cookie.

**Response:**
```json
{ "ok": true }
```

---

### `GET /api/orders`

**File:** `app/api/orders/route.ts`

Richiede autenticazione (`mf_session=1`).

Genera e restituisce 24 ordini produzione sintetici con statistiche aggregate.

**Response:**
```json
{
  "ok": true,
  "orders": ProductionOrder[],
  "stats": AggregatedStats
}
```

**AggregatedStats:**
```typescript
interface AggregatedStats {
  totale_ordini: number;
  ore_totali: number;
  consumo_totale_kwh: number;
  consumo_standard_totale_kwh: number;
  risparmio_percentuale: number;  // Sempre >= 0
  tasso_superamento: number;      // % ordini "Superato"
  tempo_medio_min: number;
  per_macchina: {
    macchina: MachineType;
    ordini: number;
    ore: number;
    consumo_kwh: number;
    consumo_standard_kwh: number;
    risparmio_pct: number;        // Sempre >= 0
    tasso_superamento: number;
  }[];
}
```

**Nota sulla generazione dati:**
I valori numerici sono tutti clamped a valori positivi:
```typescript
const ore         = Math.max(0.5,  ...);
const tempoMin    = Math.max(1,    ...);
const consumoStd  = Math.max(0.1,  ...);
const consumo     = Math.max(0.1,  ...);
```

---

### `GET/POST /api/db`

**File:** `app/api/db/route.ts`

CRUD completo sul database Turso. Richiede autenticazione.

**Azioni GET:**

| `?action=` | Descrizione | Risposta |
|---|---|---|
| `tables` | Lista tabelle | `{ tables: string[] }` |
| `stats` | Conteggio record per tabella | `{ stats: StatItem[] }` |
| `columns` | Colonne di una tabella (`&table=`) | `{ columns, identityColumns }` |
| `data` | Dati di una tabella (`&table=`) | `{ rows, identityColumns }` |

**Azioni POST (body JSON):**

| `action` | Parametri | Effetto |
|---|---|---|
| `insert` | `table, data` | Inserisce record |
| `update` | `table, data, where` | Aggiorna record |
| `delete` | `table, where` | Elimina record |
| `drop` | `table` | Elimina tabella (DROP TABLE) |

---

## 9. Autenticazione & Sicurezza

### Flusso di autenticazione

```
Client → POST /api/login
       → Verifica credentials in VALID_CREDENTIALS[]
       → Imposta cookie mf_session=1 (httpOnly)
       → Imposta cookie mf_user=<username>
       → Redirect a /dashboard

/dashboard → middleware.ts legge mf_session
           → Se !== "1": redirect a /login
           → Se "1": accesso consentito
```

### Middleware (`middleware.ts`)

Protegge tutte le route `/dashboard/*`:
```typescript
if (pathname.startsWith("/dashboard")) {
  if (session !== "1") redirect → /login
}
if (pathname === "/login" && session === "1") redirect → /dashboard
```

### Cookie di sessione

| Cookie | httpOnly | Durata | Valore |
|---|---|---|---|
| `mf_session` | Sì | 8 ore | `"1"` |
| `mf_user` | No | 8 ore | username |

---

## 10. Database

### Client (`lib/db.ts`)

Singleton Turso libSQL client.

```typescript
import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});
```

### Variabili d'ambiente richieste

```env
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
```

### Note sulla gestione colonne identità

L'API `/api/db` usa un meccanismo di rilevamento colonne identità
per determinare le chiavi primarie. Quando nessuna chiave è disponibile,
utilizza `rowid` (colonna virtuale SQLite).

---

## 11. Account Disponibili

| Username | Password | Ruolo | Note |
|---|---|---|---|
| `metafan` | `metapassword` | admin | Account amministratore originale |
| `azienda` | `MetaFan2026!` | company | Account aziendale aggiunto |

**⚠️ Sicurezza:** Le credenziali sono attualmente hardcoded in `app/api/login/route.ts`.
In produzione si raccomanda di:
1. Spostare le credenziali in variabili d'ambiente
2. Usare un hash bcrypt per le password
3. Implementare rate limiting sull'endpoint di login
4. Aggiungere CSRF protection

---

## 12. Guida allo Sviluppo

### Setup locale

```bash
# Installa dipendenze
npm install

# Copia le variabili d'ambiente
cp .env.example .env.local
# Inserisci TURSO_DATABASE_URL e TURSO_AUTH_TOKEN

# Avvia il server di sviluppo
npm run dev
```

### Comandi disponibili

```bash
npm run dev      # Server sviluppo (http://localhost:3000)
npm run build    # Build produzione
npm run start    # Avvia build produzione
npm run lint     # ESLint
```

### Aggiungere un nuovo account

In `app/api/login/route.ts`, aggiungi una entry all'array `VALID_CREDENTIALS`:

```typescript
const VALID_CREDENTIALS = [
  { username: "metafan",  password: "metapassword",  role: "admin"   },
  { username: "azienda",  password: "MetaFan2026!",  role: "company" },
  { username: "nuovo",    password: "NuovaPassword!", role: "operatore" }, // ← aggiunto
];
```

### Aggiungere una nuova vista alla dashboard

1. Aggiungi il nuovo ID al tipo `View` in `app/dashboard/page.tsx`:
   ```typescript
   type View = "overview" | "ordini" | "vpn" | "nuova-vista" | ...;
   ```
2. Aggiungi l'item alla lista `navItems`:
   ```typescript
   { id: "nuova-vista", label: "Nuova Vista", icon: "🆕" }
   ```
3. Aggiungi il blocco JSX condizionale:
   ```tsx
   {view === "nuova-vista" && <NuovaVista />}
   ```

### Aggiungere una nuova macchina

In `app/technology/page.tsx`, aggiungi una entry a `machineSpecs`:

```typescript
{
  name: "Nome Macchina",
  image: "/machines/nome-file.svg",
  type: "optimized",
  basePowerKw: 5.0,
  baseConsumptionKwh: 3.0,
  maxTempC: 100,
}
```

Poi aggiungi l'SVG corrispondente in `public/machines/`.

### Modificare la palette colori

I colori sono centralizzati in `app/globals.css`:

```css
:root {
  --gold:       #c9a44c;
  --gold-light: #e2c373;
  --gold-dark:  #a88630;
  --bg-primary: #060910;
  /* ... */
}
```

---

*Fine documentazione — MetaFan v1.2.0*
