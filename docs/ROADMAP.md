# Roadmap

Backlog personale, in ordine di priorità. Non è un piano a scadenza: si avanza una voce
alla volta, a ritmo libero. Per il contesto del progetto vedi [PROGETTO.md](PROGETTO.md);
per come funziona oggi il sistema vedi [ARCHITETTURA.md](ARCHITETTURA.md).

## Regole di lavoro sul repository

- Non lavorare direttamente su `main`: crea un branch descrittivo (`feat/...`, `fix/...`,
  `docs/...`) e apri una pull request, anche lavorando da soli — tiene la history leggibile
  e dà un punto dove tornare indietro se qualcosa va storto.
- Non fare mai commit di `.env` o della cartella `data/` (materiale e registrazioni).
- Le decisioni di progetto sono in [PROGETTO.md](PROGETTO.md), sezione 3. Il codice le
  rispetta: in particolare `backend/pupo/agent.py` **non deve mai** importare
  `reference_db` (c'è un test che lo controlla, `backend/tests/test_separation.py`).
- Backend: serve **Python 3.10+** (il sistema potrebbe avere una versione più vecchia
  come default — verificare con `python3 --version` prima di creare il venv).

## 1. Sblocco: chiave API e budget

La chiave API usata durante l'hackathon non è più disponibile. Prima di poter testare
qualunque cosa che tocchi il modello:

- Creare una nuova chiave su [platform.openai.com](https://platform.openai.com).
- Impostare subito un **hard limit di spesa** nel dashboard (consigliati $5–10 per
  partire) — i costi di `gpt-4o-mini`/`whisper-1` sono bassi per uso personale, ma un bug
  in loop o un test lasciato girare può comunque generare chiamate ripetute.
- Verificare alla pagina ufficiale dei prezzi che `gpt-4o-mini` sia ancora disponibile:
  ci sono segnali (non confermati ufficialmente) di una possibile dismissione a favore di
  modelli più recenti. Se non è più disponibile, cambiare `PUPO_MODEL` in `.env` — nessuna
  modifica al codice richiesta (`backend/pupo/config.py` legge il modello da env).
- Copiare `.env.example` in `backend/.env` e inserire la chiave.

## 2. Smoke test end-to-end

Prima di aggiungere qualunque cosa, verificare che il prototipo esistente funzioni ancora
così com'è, seguendo `backend/demo/DEMO.md` (upload → syllabus → teach → quiz → progress)
con la chiave nuova. Serve a scoprire subito eventuali rotture per modelli deprecati o
dipendenze invecchiate, prima di costruirci sopra.

> Nota: la parte simulabile senza chiave è già verificata. La CLI ha ora una suite di test
> dedicata (`backend/tests/test_cli.py`, con `FakeLLM`) che prima mancava, e l'app Expo è
> stata controllata end-to-end contro un'API locale reale (typecheck, lint, `expo-doctor`
> e build del bundle web puliti). Quello che resta, e richiede la chiave vera, è la qualità
> delle risposte del modello stesso.

## 3. Test di "confine": il Pupo non deve sapere ciò che non gli è stato insegnato

Rischio tecnico noto (vedi [ARCHITETTURA.md](ARCHITETTURA.md), "Rischio tecnico n.1"): un
LLM come GPT ha già conoscenza generale, quindi "partire vuoto" non è automatico.

Script pronto: `backend/demo/boundary_check.py` — insegna al Pupo solo alcuni concetti su tre
materie diverse e gli chiede di argomenti correlati ma mai spiegati, stampando ogni risposta
perché vada riletta a mano (l'euristica inclusa è solo un indizio, non un giudice affidabile).
Richiede `OPENAI_API_KEY` ed esegue chiamate reali (poche, costo minimo): lanciarlo con
`python demo/boundary_check.py` una volta pronta la chiave, prima di fidarsi del comportamento
del Pupo su materie nuove.

- Scrivere una suite di domande su argomenti **mai spiegati** al Pupo (in materie diverse,
  non solo la demo di Analisi 1) e verificare quante volte risponde comunque usando
  conoscenza generale invece di dire "non me l'hanno ancora spiegato".
- Affinare il system prompt (`backend/pupo/prompts.py`) di conseguenza.
- Questo va fatto *prima* di investire tempo sull'app, perché è il rischio che minaccia
  la credibilità dell'intera idea, non solo una funzionalità.

## 4. Collegare l'app Expo al backend reale

L'app (`app/`) ha già le schermate (Home, Materiale, Insegna/Interroga, Preparazione,
Sfide).

**Verificato**: `app/lib/api.ts` chiama già l'API reale sugli endpoint giusti (non dati finti),
con `EXPO_PUBLIC_API_URL` configurabile (default `localhost:8000`) e gestione corretta degli
errori (es. 503 quando manca la chiave). Controllato end-to-end con backend locale: upload
materiale, lista materiale, isolamento per studente (header `X-Student`), rifiuto di formati
non supportati, e build pulita del bundle web Expo contro quell'API. `expo-doctor`, typecheck
e lint sono ora puliti (aggiornate le dipendenze Expo a versioni patch compatibili con
`expo install --fix`, e sistemati due problemi preesistenti nel codice scaffolding generato dal
template: un errore di lint in `useClientOnlyValue.web.ts` e un errore di tipo in
`ExternalLink.tsx` che compariva solo dopo aver generato i tipi delle route — `npx expo start`
almeno una volta — perché prima la codegen di `typedRoutes` non era ancora stata eseguita).

Resta da fare **a mano, con la chiave reale**: percorrere il flusso che usa il modello
(syllabus → insegna → interroga → percentuale) su un dispositivo/simulatore, non solo via API —
la UI delle schermate Insegna/Interroga/Preparazione non è ancora stata vista a schermo in uso
reale.

## 5. Autenticazione dell'API: scelta deliberatamente minimale per ora

Oggi l'API identifica lo studente con un header `X-Student` non protetto: va bene per uso
**personale e locale**, non va bene se l'API gira su una rete raggiungibile da altri.

Scelta sensata per un side-project a singolo utente, senza sovra-ingegnerizzare:
- Finché il backend gira solo in locale (`localhost`) per uso proprio, **non serve** un
  sistema di autenticazione completo (OAuth, JWT, utenti multipli) — sarebbe lavoro speso
  prima del tempo.
- Se/quando il backend verrà esposto fuori da `localhost` (es. per farlo provare a
  qualcun altro, o per usarlo dal telefono fuori rete locale), aggiungere prima una API
  key condivisa semplice (header statico verificato lato server) — un passo intermedio
  proporzionato, prima di pensare a un vero sistema multi-utente.

## 6. Validare la formula della percentuale di preparazione

La formula (`backend/pupo/comparison.py`, descritta in ARCHITETTURA.md) è stata provata
solo sulla demo di Analisi 1. Prima di fidarsene:

- Provarla su almeno un'altra materia, con argomenti e concetti diversi.
- Confrontare a occhio il risultato con quanto ci si aspetterebbe davvero di sapere,
  per avere un riscontro qualitativo (non serve un esperimento formale con gruppo di
  controllo per un side-project).

## 7. Migliorare la personalità del Pupo

Arricchire `backend/pupo/prompts.py` con più esempi di dialogo (spiegazione corretta,
vaga, sbagliata) per rendere le domande del Pupo più naturali e meno ripetitive.

## 8. Redesign frontend — fatto

L'app era rimasta allo stile minimo dell'hackathon (nessun sistema di design). Fatto:
token di spaziatura/raggi/tipografia e temi light/dark derivati dalla palette del Pupo
(`app/constants/theme.ts`), font Baloo 2 + Nunito, componenti UI riutilizzabili
(`app/components/ui/`), animazioni misurate (reanimated, già una dipendenza) su barra di
progresso, bolle della chat e controllo a schede, e le 4 espressioni del Pupo che erano
già disegnate ma mai usate (addormentato, competitivo, illuminato, triste).

Non coperto da questo giro di lavoro, perché non riguarda il frontend: autenticazione
multi-utente, hosting del backend, database non-SQLite-locale, consenso GDPR per le
registrazioni, costi a scala — restano da affrontare prima di un uso reale con altri
utenti, vedi [PROGETTO.md](PROGETTO.md) sezione "Rischi da affrontare".
