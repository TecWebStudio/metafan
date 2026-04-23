# Guida Utente — MetaFan

**MetaFan** è la piattaforma digitale dell'azienda per la gestione della produzione elettronica I4.0.
Questa guida è rivolta al personale aziendale e spiega come utilizzare tutte le funzionalità disponibili.

---

## Indice

1. [Accesso alla piattaforma](#1-accesso-alla-piattaforma)
2. [Sito pubblico](#2-sito-pubblico)
3. [Area di gestione — Dashboard](#3-area-di-gestione--dashboard)
4. [Panoramica](#4-panoramica)
5. [Ordini di produzione](#5-ordini-di-produzione)
6. [Gestione macchine](#6-gestione-macchine)
7. [VPN aziendale](#7-vpn-aziendale)
8. [Gestione database](#8-gestione-database)
9. [Logout](#9-logout)
10. [Account disponibili](#10-account-disponibili)
11. [Problemi frequenti](#11-problemi-frequenti)

---

## 1. Accesso alla piattaforma

### Come effettuare il login

1. Aprire il browser e navigare all'indirizzo del sito aziendale.
2. Cliccare su **Accedi** nella barra di navigazione in alto, oppure andare direttamente a `/login`.
3. Inserire le proprie credenziali (username e password).
4. Cliccare su **Accedi**.

Se le credenziali sono corrette si viene reindirizzati automaticamente all'**area di gestione** (dashboard).

> **Nota:** Dopo l'accesso, la sessione rimane attiva fino al logout esplicito o alla chiusura del browser.
> Se si prova ad accedere alla dashboard senza aver effettuato il login, il sistema reindirizza automaticamente alla pagina di login.

---

## 2. Sito pubblico

Il sito pubblico è accessibile a tutti, senza bisogno di login. Contiene le seguenti sezioni:

| Sezione        | Contenuto                                                    |
| -------------- | ------------------------------------------------------------ |
| **Home**       | Presentazione aziendale e highlights I4.0                    |
| **Servizi**    | Dettaglio dei servizi offerti con cooperazione uomo-macchina |
| **Tecnologia** | Stack tecnologico, parco macchine e certificazioni           |
| **Chi siamo**  | Storia, valori e team dell'azienda                           |
| **Contatti**   | Modulo di contatto e recapiti                                |

### Sezione Servizi — Cooperazione Uomo-Macchina

In ogni scheda servizio è presente il pulsante **"Scopri la cooperazione Uomo-Macchina"**.
Cliccandolo si espande un pannello che mostra:

- Il ruolo dell'**operatore umano** nel processo
- Il ruolo del **sistema automatizzato** (I4.0)
- La **sinergia** tra i due
- Il **KPI** (indicatore di performance) principale

### Sezione Tecnologia — Parco Macchine

Il parco macchine è visualizzato in modalità informativa: nome, potenza nominale e temperatura massima.
La gestione operativa (potenza, stato, consumi) è riservata all'area di gestione.

---

## 3. Area di gestione — Dashboard

L'area di gestione è accessibile solo dopo il login. Si compone di:

- Una **barra laterale** a sinistra con la navigazione tra le sezioni
- Un'**intestazione** in alto con il nome utente e il titolo della sezione corrente
- L'**area principale** al centro con il contenuto della sezione selezionata

La barra laterale rimane fissa durante lo scorrimento della pagina.

Su dispositivi mobili la barra laterale si nasconde automaticamente: usare il pulsante **☰** in alto a sinistra per aprirla.

---

## 4. Panoramica

La sezione **Panoramica** è la schermata iniziale dopo il login. Mostra:

- Il **conteggio dei record** per ogni tabella del database (es. clienti, ordini, prodotti)
- L'elenco delle **tabelle disponibili** nel database

Cliccando su una tabella nell'elenco si viene portati direttamente alla visualizzazione dei suoi dati.

---

## 5. Ordini di produzione

La sezione **Ordini Produzione** mostra la dashboard operativa della linea di produzione.

### Selezione fonte dati — Mock / PLC

In alto a destra nella sezione è presente il pulsante **Fonte dati**. Permette di scegliere da dove provengono i dati visualizzati:

| Modalità | Colore pulsante | Descrizione                                                                                                                             |
| -------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Mock** | Oro             | Dati simulati generati automaticamente (24 ordini sintetici). Sempre disponibile, utile per demo e test.                                |
| **PLC**  | Verde           | Dati reali letti dal robot UR3 e salvati nel database. Disponibile solo quando `backend/main.py` è in esecuzione e il robot è connesso. |

Per cambiare modalità, cliccare il pulsante: alterna tra Mock e PLC ad ogni click. L'etichetta **In uso** accanto al pulsante conferma quale fonte è effettivamente attiva.

#### Vista Mock

Mostra la dashboard BI completa con:

- **4 KPI card** — totale ordini, ore lavorate, consumo energetico, tempo medio ciclo
- **Banner risparmio energetico** — confronto consumi reali vs standard di mercato
- **Analisi per macchina** — una card per ciascuna delle 8 macchine industriali
- **Tabella ordini** — ordinabile per macchina, ore lavorate o tempo di produzione; ogni riga ha un badge esito colorato (verde/rosso/giallo) e un pulsante **Apri** per il dettaglio completo

#### Vista PLC

Mostra i dati reali acquisiti dal robot UR3 tramite OPC UA. Il contenuto cambia rispetto alla vista Mock:

- **3 card di riepilogo** — numero totale di rilevazioni nel database, numero di cicli di lettura distinti, timestamp dell'ultima lettura
- **Snapshot robot** — griglia con i valori dell'ultimo ciclo di lettura, uno per ogni registro (Robot Mode, is PowerOn, ecc.). Il valore appare in verde quando il segnale è attivo (≠ 0), in oro quando è inattivo (= 0)
- **Tabella storica** — elenco delle ultime 500 rilevazioni con timestamp, linea di produzione, nome parametro e valore

Se il database non contiene ancora rilevazioni, viene mostrato un messaggio informativo che indica che il programma `backend/main.py` deve essere avviato.

### Come leggere i dati (vista Mock)

| Colonna     | Significato                                                                   |
| ----------- | ----------------------------------------------------------------------------- |
| Codice      | Identificativo univoco dell'ordine                                            |
| Macchina    | Nome della macchina industriale                                               |
| Ore         | Ore di lavorazione effettuate                                                 |
| Tempo (min) | Durata totale del ciclo di produzione                                         |
| Consumo     | Energia consumata; la freccia verde ↓ indica risparmio rispetto allo standard |
| Esito       | Superato / Scarto / Necessita revisione                                       |
| Data        | Data della produzione                                                         |

> Tutti i valori sono garantiti non negativi. Se un valore apparisse anomalo, contattare il responsabile di produzione.

---

## 6. Gestione macchine

La sezione **Gestione Macchine** permette di monitorare e configurare il parco macchine aziendale direttamente dall'area di gestione.

### Riepilogo aggregato

In cima alla sezione sono sempre visibili tre valori in tempo reale:

- **Macchine attive**: quante macchine sono operative sul totale
- **Potenza totale**: somma della potenza assorbita da tutte le macchine non offline (in kW)
- **Consumo totale/ciclo**: energia totale consumata per ciclo produttivo (in kWh)

Questi valori si aggiornano automaticamente ogni volta che si modifica una macchina.

### Schede macchina

Ogni macchina è rappresentata da una scheda che mostra:

- **Abbreviazione** identificativa (es. CN per CNC, RF per Reflow Oven)
- **Nome** della macchina
- **Stato operativo** (Attiva / Manutenzione / Offline)
- **Potenza corrente** e **consumo corrente** (calcolati in base al livello di potenza impostato)

### Aprire il pannello di gestione

Cliccare il pulsante **Gestisci** sulla scheda di una macchina per aprire il pannello di configurazione inline.

Il pannello mostra:

#### Livello potenza

- Uno **slider** da 0% a 100% per regolare il livello di potenza della macchina.
- I valori di potenza (kW), consumo (kWh) e temperatura (°C) si aggiornano in tempo reale.
- Lo slider è disabilitato quando la macchina è in stato **Offline**.

#### Statistiche live

Tre indicatori mostrano i valori attuali calcolati:

| Indicatore | Descrizione                                                              |
| ---------- | ------------------------------------------------------------------------ |
| Potenza    | kW assorbiti al livello impostato                                        |
| Consumo    | kWh per ciclo al livello impostato                                       |
| Temp.      | Temperatura operativa stimata; diventa rossa se supera l'85% del massimo |

#### Specifiche nominali

Valori di riferimento fissi della macchina (potenza nominale e consumo massimo a ciclo completo).

#### Stato operativo

Tre pulsanti per cambiare lo stato della macchina:

| Stato            | Significato                                    |
| ---------------- | ---------------------------------------------- |
| **Attiva**       | Macchina in funzione normale                   |
| **Manutenzione** | Macchina ferma per intervento tecnico          |
| **Offline**      | Macchina spenta, esclusa dai calcoli aggregati |

Cliccare **Chiudi** per chiudere il pannello senza perdere le modifiche.

---

## 7. VPN aziendale

La sezione **VPN Aziendale** permette di simulare la connessione al tunnel sicuro aziendale per l'accesso remoto.

### Stati della VPN

| Stato                    | Significato                                                      |
| ------------------------ | ---------------------------------------------------------------- |
| **Disconnessa**          | Nessun tunnel attivo                                             |
| **Connessione in corso** | Autenticazione e handshake TLS in esecuzione (circa 2-3 secondi) |
| **Connessa**             | Tunnel sicuro attivo, accesso remoto abilitato                   |

### Come connettersi

1. Cliccare il pulsante **Connetti VPN**.
2. Attendere il completamento della barra di progresso (autenticazione).
3. Quando lo stato diventa **VPN Connessa**, il tunnel è attivo.

Una volta connessa vengono mostrati:

- **Informazioni server**: indirizzo, protocollo (OpenVPN / AES-256-GCM) e latenza
- **Sessioni dipendenti attive**: elenco dei colleghi connessi con nome, IP, posizione e attività corrente

### Come disconnettersi

Cliccare il pulsante **Disconnetti VPN**. Il tunnel viene chiuso immediatamente.

> Nella barra laterale, una spia colorata accanto alla voce "VPN Aziendale" segnala lo stato:
>
> - **Gialla**: connessione in corso
> - **Verde**: connessa

---

## 8. Gestione database

L'area di gestione fornisce quattro operazioni sul database:

### Visualizza Dati

Permette di consultare il contenuto di qualsiasi tabella del database.

1. Selezionare la tabella desiderata dalla barra dei pulsanti in alto.
2. La tabella mostra tutti i record con tutte le colonne.
3. Su dispositivi mobili i record appaiono come schede individuali.

### Aggiungi Record

Permette di inserire un nuovo record in una tabella.

1. Selezionare la tabella.
2. Compilare i campi del modulo (i campi chiave primaria sono gestiti automaticamente).
3. Cliccare **Inserisci Record**.
4. Comparirà un messaggio di conferma in basso a destra.

> I campi numerici non accettano valori negativi.

### Modifica Record

Permette di modificare un record esistente.

1. Selezionare la tabella.
2. Cliccare **Modifica** sulla riga da modificare.
3. Aggiornare i valori desiderati (i campi chiave primaria non sono modificabili).
4. Cliccare **Salva Modifiche** oppure **Annulla** per tornare indietro.

### Elimina Record

Permette di eliminare un record dal database.

1. Selezionare la tabella.
2. Cliccare **Elimina** sulla riga da rimuovere.
3. Confermare l'operazione nel dialogo di conferma.

> L'eliminazione è irreversibile. Verificare bene prima di confermare.

### Elimina Tabella

Permette di eliminare permanentemente un'intera tabella e tutti i suoi dati.

1. Cliccare **DROP** accanto al nome della tabella.
2. Leggere attentamente il messaggio di avviso.
3. Cliccare **Conferma** per procedere.

> Questa operazione è irreversibile. Usare solo se strettamente necessario.

---

## 9. Logout

Per uscire dalla piattaforma:

1. Aprire la barra laterale (se non è già visibile).
2. Cliccare **Logout** in fondo alla barra.
3. Si viene reindirizzati automaticamente alla pagina di login.

---

## 10. Account disponibili

| Username  | Password       | Ruolo             |
| --------- | -------------- | ----------------- |
| `metafan` | `metapassword` | Amministratore    |
| `azienda` | `MetaFan2026!` | Account aziendale |

> Le credenziali sono riservate al personale autorizzato. Non condividerle con soggetti esterni.

---

## 11. Problemi frequenti

### Non riesco ad accedere alla dashboard

Verificare di aver inserito correttamente username e password (rispettano maiuscole/minuscole).
Se il problema persiste, contattare l'amministratore di sistema.

### La barra laterale scompare durante lo scroll

Aggiornare la pagina. Se il problema si ripresenta, svuotare la cache del browser (Ctrl+Shift+R su Windows/Linux, Cmd+Shift+R su Mac).

### I valori degli ordini sembrano anomali

I dati degli ordini sono calcolati in tempo reale. Aggiornare la pagina per ricaricare i valori più recenti.

### La VPN non si connette

La connessione impiega circa 2-3 secondi. Attendere il completamento della barra di progresso prima di riprovare.

### Un campo del database non accetta il valore inserito

Verificare che il tipo di dato sia corretto (es. non inserire testo in un campo numerico). I campi numerici accettano solo valori uguali o maggiori di zero.

---

_Guida utente MetaFan — uso interno riservato al personale aziendale._
