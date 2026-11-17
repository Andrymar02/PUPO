# CLAUDE.md

## Descrizione del progetto

PUPO è un agente AI che fa lo studente: non sa niente e impara solo da quello che lo studente gli
spiega. Spiegando la materia al Pupo, lo studente impara davvero (learning by teaching / tecnica
Feynman) e scopre, argomento per argomento, quanto è preparato. L'architettura si basa su due
database separati per studente e materia (`reference.db` e `learning.db`) e su un modulo di
confronto isolato che calcola una percentuale di preparazione per argomento, senza mai far leggere
al Pupo il materiale di riferimento. Il Pupo non dà punti o bonus all'esame: serve solo a far
scoprire allo studente le proprie lacune.

Nato come progetto per la Reply Student Tech Clash 2026 (*AI on Campus*, direzione Learning),
ora proseguito come **side-project personale**, senza scadenze né vincoli di competizione.

Per il contesto completo (origine, decisioni di progetto, rischi) vedi `docs/PROGETTO.md`; per
come funziona il sistema `docs/ARCHITETTURA.md`; per i prossimi passi `docs/ROADMAP.md`.

## Decisioni di progetto da non cambiare senza motivo esplicito

Da `docs/PROGETTO.md`, sezione 3. Sono scelte di design, non vincoli imposti da altri: possono
cambiare, ma di proposito e con una motivazione scritta (in una PR o in `docs/PROGETTO.md`), non
di passaggio dentro una modifica che fa altro.

1. Direzione: **Learning** (con aggancio ad Assessment come autovalutazione).
2. Il Pupo **non dà punti o bonus all'esame**. Nessun coinvolgimento nel voto.
3. Due database separati: il Pupo **non può leggere** il database di riferimento. Solo il modulo
   di confronto lo usa, e **restituisce solo percentuali** (mai contenuti).
   - Vincolo tecnico: `backend/pupo/agent.py` **non deve mai importare** `reference_db` né
     `comparison` — c'è un test che lo verifica.
   - Il modulo di confronto (`backend/pupo/comparison.py`) restituisce **solo numeri**, mai testo
     del riferimento o del quaderno.
4. Il database di riferimento lo riempie **lo studente** (registrazioni trascritte, sbobinature,
   materiale caricato).
5. La mente del Pupo (`learning_db.py`) si riempie **solo** con le spiegazioni dello studente.
6. Percentuale di preparazione **per argomento**, basata su copertura **e** correttezza.
7. App con due sezioni: **Materiale** e **Insegna al Pupo**.
8. Sfide amichevoli sì, classifiche pubbliche competitive no.

## Comandi

Installazione (richiede **Python 3.10+**; verificare `python3 --version` prima, il default di
sistema potrebbe essere più vecchio):

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
```

Test:

```bash
cd backend
pytest
```

I test non usano OpenAI: girano con un LLM finto e verificano, tra le altre cose, che l'agente Pupo
non possa accedere al database di riferimento.

## Regola di lavoro

- Ogni modifica va fatta su un **branch separato** (es. `feat/...`, `fix/...`, `docs/...`), non
  direttamente su `main`, anche lavorando da soli: mantiene la history leggibile.
- I **test devono essere sempre verdi prima di ogni commit**.
- Non fare mai commit di `.env` o della cartella `data/`.
- Non firmare commit o PR con attribuzioni di co-authorship: git deve riportare solo l'autore
  umano del progetto.
