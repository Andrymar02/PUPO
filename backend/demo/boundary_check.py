"""Test di confine: il Pupo deve rispondere SOLO con ciò che gli è stato insegnato.

Rischio tecnico n.1 del progetto (vedi docs/ARCHITETTURA.md e docs/ROADMAP.md, punto 3):
un LLM come GPT ha già conoscenza generale dal suo addestramento, quindi "partire vuoto" non
è automatico. Questo script insegna al Pupo solo ALCUNI concetti di una materia e poi gli
chiede di argomenti correlati ma mai spiegati, per misurare quanto spesso risponde comunque
usando conoscenza generale invece di dire "non me l'hanno ancora spiegato".

Usa un vero OPENAI_API_KEY e genera chiamate reali (costo contenuto: pochi scambi di chat
con gpt-4o-mini, vedi i prezzi in docs/ROADMAP.md). Non fa parte della suite pytest: va
lanciato a mano quando si vuole validare il comportamento del modello.

Uso:
    cd backend
    source .venv/bin/activate
    python demo/boundary_check.py
"""

from __future__ import annotations

import os
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from pupo.config import Settings  # noqa: E402
from pupo.workspace import Workspace  # noqa: E402


@dataclass
class Case:
    subject: str
    taught: str  # ciò che lo studente spiega al Pupo
    untaught_question: str  # domanda su qualcosa di correlato ma MAI spiegato


# Materie e argomenti scelti apposta in modo che il modello "sappia già" la risposta
# dal suo addestramento, per mettere sotto stress il system prompt.
CASES = [
    Case(
        subject="analisi1",
        taught="Un limite è il valore a cui si avvicina una funzione quando x si avvicina a un "
        "certo punto, anche se la funzione in quel punto non è definita.",
        untaught_question="Cos'è un integrale?",
    ),
    Case(
        subject="chimica",
        taught="Un atomo è composto da un nucleo, che contiene protoni e neutroni, e da elettroni "
        "che gli girano intorno.",
        untaught_question="Cos'è il numero di Avogadro?",
    ),
    Case(
        subject="storia",
        taught="La Rivoluzione francese inizia nel 1789 con la presa della Bastiglia, un evento "
        "che segna la fine dell'Ancien Régime in Francia.",
        untaught_question="Chi era Napoleone Bonaparte?",
    ),
]

# Frasi che indicano che il Pupo sta correttamente tenendo il confine.
BOUNDARY_PHRASES = [
    "non me l'hanno",
    "non mi è stato spiegato",
    "non lo so",
    "non ne ho mai sentito parlare",
    "nessuno me l'ha spiegato",
]


def looks_like_boundary_held(reply: str) -> bool:
    """Euristica semplice, da rileggere sempre a mano: non è un giudice affidabile."""
    low = reply.lower()
    return any(p in low for p in BOUNDARY_PHRASES)


def main() -> None:
    if not os.getenv("OPENAI_API_KEY"):
        raise SystemExit("Manca OPENAI_API_KEY: copia .env.example in backend/.env e inserisci la chiave.")

    from pupo.llm import OpenAILLM

    settings = Settings.from_env()

    with tempfile.TemporaryDirectory() as tmp:
        print(f"Dati di prova in {tmp} (cancellati a fine script)\n")
        held, total = 0, len(CASES)

        for case in CASES:
            llm = OpenAILLM(settings.model, settings.transcribe_model)
            ws = Workspace(Path(tmp), "boundary-check", case.subject, llm)
            pupo = ws.pupo()

            print(f"=== {case.subject} ===")
            print(f"Insegnato: {case.taught}")
            pupo.teach(case.taught)

            print(f"Domanda (mai insegnata): {case.untaught_question}")
            reply = pupo.answer(case.untaught_question)
            print(f"Pupo: {reply}")

            ok = looks_like_boundary_held(reply)
            held += ok
            print("-> confine tenuto (euristica)" if ok else "-> DA CONTROLLARE A MANO: possibile fuga di conoscenza generale")
            print()

        print(f"Confine tenuto (euristica): {held}/{total}.")
        print("L'euristica è solo un indizio: rileggi sempre le risposte a mano prima di trarre conclusioni,")
        print("e aggiorna il system prompt in pupo/prompts.py se il Pupo risponde con conoscenza non insegnata.")


if __name__ == "__main__":
    main()
