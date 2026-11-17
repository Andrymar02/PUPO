"""Test della CLI (pupo.cli.main), senza chiamare OpenAI (FakeLLM) e senza input reale da terminale.

La CLI non aveva copertura: i test esistenti coprono Workspace (test_core.py) e l'API
(test_api.py), ma non l'argument parsing, il loop di chat interattivo e i messaggi
stampati a schermo, che sono codice a sé in cli.py.
"""

import json

import pytest

from pupo import cli
from pupo.llm import FakeLLM
from pupo.workspace import Workspace


@pytest.fixture(autouse=True)
def _isolated_data_dir(tmp_path, monkeypatch):
    """Ogni test scrive in una cartella dati isolata, mai in quella reale."""
    monkeypatch.setenv("PUPO_DATA_DIR", str(tmp_path))
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    return tmp_path


def _patch_llm(monkeypatch, handler):
    monkeypatch.setattr(cli, "make_llm", lambda settings: FakeLLM(handler))


def _scripted_input(monkeypatch, answers):
    """Sostituisce input() con una coda di risposte scriptate, come un utente che digita."""
    queue = list(answers)
    monkeypatch.setattr("builtins.input", lambda prompt="": queue.pop(0))


def test_upload_then_material_lists_document(tmp_path, capsys):
    doc = tmp_path / "sbobina.txt"
    doc.write_text("I limiti descrivono il comportamento di una funzione.", encoding="utf-8")

    cli.main(["--subject", "analisi1", "upload", str(doc)])
    out = capsys.readouterr().out
    assert "✓ Caricato nel materiale: sbobina.txt" in out

    cli.main(["--subject", "analisi1", "material"])
    out = capsys.readouterr().out
    assert "sbobina.txt" in out
    assert "upload" in out


def test_material_empty_by_default(capsys):
    cli.main(["--subject", "analisi1", "material"])
    assert "Nessun materiale caricato." in capsys.readouterr().out


def test_upload_unsupported_extension_exits(tmp_path):
    doc = tmp_path / "appunti.docx"
    doc.write_bytes(b"qualcosa")

    with pytest.raises(SystemExit):
        cli.main(["--subject", "analisi1", "upload", str(doc)])


def test_command_needing_llm_without_api_key_exits_with_clear_message(capsys):
    with pytest.raises(SystemExit) as exc_info:
        cli.main(["--subject", "analisi1", "syllabus"])
    assert "OPENAI_API_KEY" in str(exc_info.value)


def test_syllabus_builds_topics_from_material(tmp_path, monkeypatch, capsys):
    doc = tmp_path / "lezione.txt"
    doc.write_text("lezione sui limiti", encoding="utf-8")
    cli.main(["--subject", "analisi1", "upload", str(doc)])
    capsys.readouterr()

    _patch_llm(monkeypatch, lambda m, j: json.dumps({"topics": [{"name": "Limiti", "concepts": ["c1", "c2"]}]}))
    cli.main(["--subject", "analisi1", "syllabus"])

    out = capsys.readouterr().out
    assert "✓ Programma creato: 1 argomenti." in out
    assert "Limiti (2 concetti)" in out


def test_teach_chat_loop_stores_belief_and_prints_reply(tmp_path, monkeypatch, capsys):
    def handler(messages, json_mode):
        if json_mode:
            return json.dumps({"statements": ["Un limite può non esistere"]})
        return "Ho capito. Ma quando succede?"

    _patch_llm(monkeypatch, handler)
    _scripted_input(monkeypatch, ["Un limite può non esistere.", "/esci"])

    cli.main(["--subject", "analisi1", "teach"])

    out = capsys.readouterr().out
    assert "Pupo > Ho capito. Ma quando succede?" in out

    ws = Workspace(tmp_path, "demo", "analisi1", None)
    assert [b.statement for b in ws.learning.beliefs()] == ["Un limite può non esistere"]


def test_teach_chat_loop_ignores_blank_lines(monkeypatch, capsys):
    calls = []

    def handler(messages, json_mode):
        calls.append(json_mode)
        return '{"statements": []}' if json_mode else "Ciao, dimmi pure!"

    _patch_llm(monkeypatch, handler)
    _scripted_input(monkeypatch, ["", "  ", "Ciao Pupo", "/esci"])

    cli.main(["--subject", "analisi1", "teach"])

    out = capsys.readouterr().out
    assert out.count("Pupo >") == 1  # le righe vuote non hanno generato una risposta


def test_quiz_chat_loop_prints_pupo_reply(monkeypatch, capsys):
    _patch_llm(monkeypatch, lambda m, j: "Non me l'hanno ancora spiegato.")
    _scripted_input(monkeypatch, ["Cos'è un integrale?", "/esci"])

    cli.main(["--subject", "analisi1", "quiz"])

    assert "Pupo > Non me l'hanno ancora spiegato." in capsys.readouterr().out


def test_progress_prints_bar_and_total(tmp_path, monkeypatch, capsys):
    doc = tmp_path / "lezione.txt"
    doc.write_text("lezione sui limiti", encoding="utf-8")
    cli.main(["--subject", "analisi1", "upload", str(doc)])
    capsys.readouterr()

    _patch_llm(monkeypatch, lambda m, j: json.dumps({"topics": [{"name": "Limiti", "concepts": ["c1", "c2"]}]}))
    cli.main(["--subject", "analisi1", "syllabus"])
    capsys.readouterr()

    _patch_llm(monkeypatch, lambda m, j: json.dumps({"statements": ["qualcosa"]}) if j else "Ok, domanda?")
    _scripted_input(monkeypatch, ["Un limite è un valore.", "/esci"])
    cli.main(["--subject", "analisi1", "teach"])
    capsys.readouterr()

    _patch_llm(
        monkeypatch,
        lambda m, j: json.dumps({"results": [{"i": 0, "status": "correct"}, {"i": 1, "status": "missing"}]}),
    )
    cli.main(["--subject", "analisi1", "progress"])

    out = capsys.readouterr().out
    assert "Limiti" in out
    assert "50%" in out
    assert "TOTALE" in out


def test_reset_confirmed_clears_beliefs_but_keeps_material(tmp_path, monkeypatch, capsys):
    ws = Workspace(tmp_path, "demo", "analisi1", None)
    ws.reference.add_document("a.txt", "materiale")
    ws.learning.add_lesson("spiegazione", ["qualcosa"])

    _scripted_input(monkeypatch, ["s"])
    cli.main(["--subject", "analisi1", "reset"])

    assert "✓ Il Pupo è tornato a non sapere niente." in capsys.readouterr().out
    ws2 = Workspace(tmp_path, "demo", "analisi1", None)
    assert ws2.learning.beliefs() == []
    assert len(ws2.reference.documents()) == 1  # il materiale non viene toccato


def test_reset_declined_keeps_beliefs(tmp_path, monkeypatch, capsys):
    ws = Workspace(tmp_path, "demo", "analisi1", None)
    ws.learning.add_lesson("spiegazione", ["qualcosa"])

    _scripted_input(monkeypatch, ["n"])
    cli.main(["--subject", "analisi1", "reset"])

    ws2 = Workspace(tmp_path, "demo", "analisi1", None)
    assert len(ws2.learning.beliefs()) == 1
