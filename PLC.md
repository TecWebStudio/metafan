Programma di Lettura/Scrittura
di MetaFan © 2026
1. Introduzione
Il presente programma è stato sviluppato per garantire il corretto funzionamento del sistema di acquisizione dati tra un PLC industriale e un database MySQL. L’obiettivo principale è quello di leggere ciclicamente alcuni parametri di processo tramite protocollo OPC/UA e memorizzarli in modo automatico all’interno di un database, così da consentire il monitoraggio, la tracciabilità storica e successive analisi dei dati.
Il software è realizzato in Python e utilizza una struttura asincrona, in modo da mantenere una comunicazione continua con il PLC senza bloccare l’esecuzione del programma. In questo modo è possibile garantire una raccolta dati costante, affidabile e con tempi di campionamento regolari.
Il sistema è pensato per essere facilmente estendibile, consentendo l’aggiunta di nuovi parametri OPC/UA semplicemente modificando la mappa dei nodi, senza dover intervenire sulla logica principale del programma.
2. Utilizzo di pacchetti esterni
Il programma si basa su alcune librerie esterne fondamentali per il suo funzionamento. In particolare, viene utilizzato il pacchetto “asyncua” per la gestione della comunicazione OPC/UA in modalità asincrona, permettendo al client Python di collegarsi al server OPC/UA del PLC e leggere i valori dei nodi configurati.
Per la gestione del database viene utilizzata la libreria “SQLAlchemy”, che consente di creare una connessione verso un database MySQL (o MariaDB) e di eseguire query SQL in modo strutturato e sicuro. L’uso di SQLAlchemy permette inoltre di gestire in modo più pulito le transazioni e le connessioni.
Il modulo “asyncio” viene impiegato per gestire il ciclo asincrono principale del programma, mentre il modulo “datetime” è utilizzato per fornire informazioni temporali nei messaggi di log, utili in fase di debug e monitoraggio del sistema.

3. Connessione al Server OPC/UA su PLC
Per instaurare la connessione del client Python al server OPC/UA del PLC, viene definito l’indirizzo del server tramite la variabile “OPC_URL”. In questo caso, il PLC è raggiungibile all’indirizzo:
opc.tcp://192.168.139.80:4840

All’avvio del programma, viene creato un client OPC/UA asincrono che si collega al PLC utilizzando questo endpoint. Una volta stabilita la connessione, il programma stampa un messaggio di conferma contenente la data e l’ora, in modo da segnalare che la comunicazione con il PLC è attiva.
Successivamente, il programma recupera i riferimenti ai nodi OPC/UA configurati, utilizzando una mappa che associa ogni Node ID a un identificativo di parametro e a una linea di produzione. Questo consente di collegare direttamente ogni valore letto dal PLC a un contesto logico all’interno del database.
4. Gestione dei parametri OPC/UA
I parametri di processo sono definiti all’interno di una struttura di tipo dizionario, nella quale ogni Node ID OPC/UA è associato a una coppia composta da Id_Parametro e Id_Linea. Questa struttura permette di rendere il programma flessibile e facilmente configurabile.
Ad esempio, il nodo relativo alla temperatura, all’umidità e alle vibrazioni è associato rispettivamente a identificativi logici come PAR1, PAR2 e PAR3, tutti riferiti alla linea di produzione numero 1. In questo modo, ogni valore letto dal PLC può essere automaticamente classificato e memorizzato correttamente nel database.
Per adattare il programma a un PLC diverso o a nuovi segnali, è sufficiente modificare questa mappa, senza intervenire sul resto del codice.
5. Connessione al Database MySQL
Il programma utilizza una connessione verso un database MySQL tramite una stringa di connessione definita nella variabile DB_URL. Questa stringa specifica il tipo di database, le credenziali di accesso, l’indirizzo del server e il nome del database utilizzato.
Una volta creata la connessione tramite SQLAlchemy, il motore (engine) viene utilizzato ogni volta che è necessario inserire una nuova rilevazione. Questo approccio garantisce una gestione corretta delle connessioni e riduce il rischio di errori legati a sessioni non chiuse o transazioni incomplete.
6. Ciclo di acquisizione e salvataggio dati
La funzione principale del programma è implementata come funzione asincrona. All’interno di questa funzione, dopo aver stabilito la connessione al PLC, il programma entra in un ciclo infinito che rappresenta il ciclo di acquisizione dati.
Durante ogni iterazione del ciclo, il programma legge il valore di ciascun nodo OPC/UA configurato. Per ogni valore letto, vengono recuperati l’identificativo del parametro e della linea associati, e viene eseguita una query SQL di inserimento nella tabella rilevazione_processo.
Ogni record inserito contiene l’identificativo della linea, l’identificativo del parametro, il valore letto dal PLC e il timestamp corrente, generato direttamente dal database tramite la funzione NOW(). Questo garantisce che ogni rilevazione sia correttamente tracciata nel tempo.
Dopo ogni inserimento, viene effettuato il commit della transazione per rendere permanenti i dati nel database.
7. Gestione degli errori e logging
Il programma include una gestione delle eccezioni per ogni lettura dei nodi OPC/UA. In caso di errore nella lettura di un nodo o durante l’inserimento nel database, viene stampato un messaggio di errore che indica il Node ID coinvolto e la descrizione dell’eccezione.
In condizioni normali, per ogni valore acquisito correttamente, il programma stampa un messaggio di log che indica la linea, il parametro e il valore letto. Questo meccanismo è particolarmente utile in fase di test e debug, permettendo di verificare in tempo reale il corretto funzionamento del sistema.
8. Temporizzazione delle letture
Alla fine di ogni ciclo completo di lettura dei parametri, il programma attende 5 secondi prima di ripetere il ciclo. Questo intervallo definisce il tempo di campionamento del sistema e garantisce che i valori vengano aggiornati a intervalli regolari.
Il tempo di attesa può essere facilmente modificato cambiando il valore del delay, adattando così il sistema a diverse esigenze di monitoraggio.

