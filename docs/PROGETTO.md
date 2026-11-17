# PUPO — contesto del progetto

> Documento di contesto per chiunque (persona o Claude) lavori su questo repository.
> Leggilo prima di proporre modifiche a comportamento o architettura: la sezione 3
> elenca le decisioni di progetto da rispettare finché non vengono cambiate qui.

## 1. Origine e stato attuale

PUPO è nato come progetto per la **Reply Student Tech Clash 2026 – "AI on Campus"**
(direzione **Learning**), realizzato in team durante l'hackathon. Il team non ha vinto
e il progetto è stato poi ripreso come **side-project personale e curriculare**,
con il permesso degli ex-compagni di squadra.

Da qui in avanti:
- **nessuna scadenza di competizione, nessun vincolo di team o di pitch**;
- lo sviluppo procede a ritmo libero, con l'obiettivo di avere qualcosa di solido
  da mostrare nel curriculum/portfolio, non di vincere una gara;
- le "decisioni di progetto" (sezione 3) restano perché sono scelte di design
  valide in sé, non perché imposte da un team — possono essere cambiate, ma di
  proposito e con una motivazione scritta, non di passaggio.

## 2. L'idea in una frase

**PUPO è un agente AI che fa lo studente: non sa niente e impara solo da quello che gli
spieghi tu. Spiegandogli la materia, lo studente impara davvero e scopre, argomento per
argomento, quanto è preparato.**

Principio di base: *"So di aver capito un argomento quando so spiegarlo a qualcun altro"*
(learning by teaching, effetto protégé, tecnica Feynman).
Ribaltamento chiave: di solito l'AI dà le risposte; **PUPO le riceve**.

## 2.1 Descrizione completa

### Un Pupo per ogni materia
Ogni studente ha un Pupo per ogni corso che segue. Il Pupo nasce "vuoto" (pupo = bambino).

### Architettura: due database separati
1. **Database di riferimento (conoscenza a priori)**
   - Lo costruisce lo studente caricando registrazioni delle lezioni (trascritte
     automaticamente), sbobinature, appunti, slide, programma d'esame.
   - **Sta allo studente caricare materiale corretto e pertinente**: la qualità del
     riferimento determina l'affidabilità della percentuale.
   - **Il Pupo NON può estrarre dati da questo database**: non lo legge per rispondere,
     non lo usa per suggerire, non lo cita, non lo usa per fare domande.
   - Il suo unico uso è fare da metro di paragone per calcolare la percentuale di
     preparazione, tramite un **modulo di confronto separato** che restituisce solo numeri.
2. **Database di apprendimento (la "mente" del Pupo)**
   - All'inizio è vuoto, si riempie **solo** con ciò che lo studente spiega al Pupo.
   - Se la spiegazione è sbagliata, il Pupo impara una cosa sbagliata.
   - È l'unica fonte che il Pupo usa per ragionare, rispondere e fare domande.
3. **Percentuale di preparazione**
   - Risultato del confronto tra i due database: quanta parte del riferimento il Pupo
     ha imparato, e quanto correttamente.
   - Un argomento è "imparato" solo se è **coperto E spiegato correttamente**.
   - Mostrata **per argomento** (es. "Limiti 80%, Derivate 35%"), senza che il Pupo
     riveli il contenuto mancante.

### L'app ha due sezioni
**A) "Materiale"**: lo studente costruisce il riferimento (registrazioni trascritte,
sbobinature, altro materiale). Tutto finisce nel database di riferimento, **non** nella
mente del Pupo.

**B) "Insegna al Pupo"**: lo studente spiega gli argomenti al Pupo (voce o testo). Il Pupo
si comporta come uno studente vero: chiede "perché?", "e se invece…?", chiede esempi, si
confonde davanti a spiegazioni vaghe o contraddittorie e fa errori plausibili, basandosi
solo su ciò che ha imparato. Lo studente può interrogarlo per ripassare. Una barra di
preparazione per argomento mostra i progressi.

### Gioco e sfida
Sfide amichevoli tra Pupi (quiz, duelli tra compagni di corso), senza classifiche
pubbliche competitive (reintrodurrebbero un incentivo a barare per fare bella figura).

### Perché non ha senso imbrogliare
Il Pupo non dà punti all'esame: nessun voto dipende da lui. Se lo studente legge al Pupo
gli appunti o incolla testo generato da un'altra AI, il Pupo arriva al 100% ma lo
studente resta al 10%: si inganna da solo e lo scopre all'esame. *"Un Pupo al 100% con
uno studente al 10% non serve a nessuno."*

### Perché funziona
Motivazione (gamification), apprendimento profondo (per spiegare bisogna capire, non
memorizzare), feedback onesto (le domande del Pupo e la percentuale mostrano subito le
lacune), uso dell'AI per rafforzare il pensiero dello studente invece di sostituirlo.
Sviluppo futuro possibile: statistiche anonime e aggregate per il professore su quali
argomenti la classe spiega peggio.

### Rischi da affrontare
- **Separazione dei database**: va garantita tecnicamente (modulo di confronto separato,
  verificato da test — vedi [ARCHITETTURA.md](ARCHITETTURA.md)).
- **Affidabilità della percentuale**: dipende dalla qualità del materiale e dalla
  robustezza della valutazione di "spiegato correttamente".
- **Registrazione delle lezioni**: consenso del professore, GDPR (voci di altri
  studenti in aula), diritti sul materiale didattico — non urgente per un uso personale,
  da affrontare seriamente solo se il progetto arrivasse a un uso reale multi-utente.
- **Privacy**: materiale e conversazioni restano dello studente.

## 3. Decisioni di progetto (da non cambiare senza motivo scritto)

1. Direzione: **Learning** (con aggancio ad Assessment come autovalutazione).
2. Il Pupo **non dà punti o bonus all'esame**. Nessun coinvolgimento nel voto.
3. Due database separati: il Pupo **non può leggere** il database di riferimento. Solo il
   modulo di confronto lo usa, e **restituisce solo percentuali** (mai contenuti).
   - Vincolo tecnico: `backend/pupo/agent.py` **non deve mai importare** `reference_db` —
     c'è un test che lo verifica (`backend/tests/test_separation.py`).
   - Il modulo di confronto (`backend/pupo/comparison.py`) restituisce **solo numeri**,
     mai testo del riferimento o del quaderno.
4. Il database di riferimento lo riempie **lo studente** (registrazioni trascritte,
   sbobinature, materiale caricato).
5. La mente del Pupo (`learning_db.py`) si riempie **solo** con le spiegazioni dello
   studente.
6. Percentuale di preparazione **per argomento**, basata su copertura **e** correttezza.
7. App con due sezioni: **Materiale** e **Insegna al Pupo**.
8. Sfide amichevoli sì, classifiche pubbliche competitive no.

Se una di queste sembra sbagliata o limitante, va cambiata con una proposta esplicita e
una motivazione scritta in questo file o nel messaggio di commit — non in modo implicito
dentro una PR che fa altro.

## 4. Decisioni ancora aperte

- **Acronimo di PUPO** (opzionale, non urgente ora che non serve per un pitch):
  - Italiano: *Pupillo Universitario Pronto all'Orale*
  - Inglese: *Prove Understanding by Passing On*, *Pupil Until Proven Otherwise*,
    *Preparation Unveiled by Pupil Output*, *Pupil Under Professor's Oversight*
- Come calcolare esattamente la percentuale: la formula attuale è in
  [ARCHITETTURA.md](ARCHITETTURA.md); va validata su casi d'uso reali (vedi
  [ROADMAP.md](ROADMAP.md)).

## 5. Documentazione collegata

- [Architettura](ARCHITETTURA.md) — come funziona: input, mente, confronto, formula.
- [Roadmap](ROADMAP.md) — prossimi passi tecnici, in ordine di priorità.
