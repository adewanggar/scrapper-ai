import copy
import json
import unittest
from unittest.mock import patch

from research_planner import generate_research, prepare_dataset, THEORIES


def request(kind="titles"):
    return {"kind": kind, "filename": "private-cloud-only.json",
            "dataset": {"caption": "Pembahasan fasilitas kampus", "comments": [
                {"comment": "Fasilitas perpustakaan perlu diperbaiki.", "replies": [{"comment": "Jam buka juga perlu ditambah."}]},
                {"comment": "Saya senang dengan layanan daringnya."}]},
            "context": {"department": "Ilmu Komunikasi", "method": "Belum menentukan metode", "framework_id": "entman_framing"}}


def titles():
    return {"items": [{"title": f"Pembingkaian fasilitas kampus dalam komentar unggahan {i}",
                       "method": "Kualitatif" if i % 2 else "Kuantitatif", "focus": "Fasilitas kampus",
                       "rationale": "Komentar membahas fasilitas", "data_available": "Teks komentar",
                       "data_needed": "Tidak perlu untuk deskripsi teks", "question": "Bagaimana fasilitas dibicarakan?",
                       "objective": "Mendeskripsikan pembingkaian", "approach": "Pengodean dan hitungan deskriptif"}
                      for i in range(5)], "limitations": "Terbatas pada komentator unggahan ini."}


def theories():
    return {"items": [{"theory_id": key, "explanation": "Penjelasan", "relevance": "Relevansi bersyarat",
                       "indicators": "Usulan peneliti", "application": "Pengodean komentar", "quote_id": "0",
                       "limitations": "Memerlukan peninjauan pembimbing"} for key in ("framing", "spiral", "agenda")],
            "limitations": "Katalog terbatas."}


class ResearchTests(unittest.TestCase):
    def test_cloud_dataset_uses_existing_llm_and_no_local_filename_lookup(self):
        with patch("research_planner.call_llm", return_value=(json.dumps(titles()), "mock")) as llm:
            result = generate_research(request())
        sent = json.loads(llm.call_args.args[0])
        self.assertEqual(sent["dataset"]["comments"][1]["text"], "Jam buka juga perlu ditambah.")
        self.assertEqual(result["filename"], "private-cloud-only.json")
        self.assertEqual(len(result["items"]), 5)
        self.assertEqual(result["coverage"]["total"], 3)

    def test_large_sample_covers_start_end_and_reports_truncation(self):
        data = {"comments": [{"comment": str(i) + "x" * 2000} for i in range(1000)]}
        sample, originals, meta = prepare_dataset(data)
        self.assertEqual((sample[0]["id"], sample[-1]["id"]), ("0", "999"))
        self.assertEqual(meta["sampled"], 100)
        self.assertEqual(meta["truncated"], 100)
        self.assertEqual(len(sample[0]["text"]), 1000)
        self.assertGreater(len(originals["0"]), 1000)

    def test_empty_or_malformed_dataset_never_calls_ai(self):
        for dataset in (None, {}, {"comments": []}, {"comments": [None]}, {"comments": [{"comment": " "}]}):
            body = request(); body["dataset"] = dataset
            with patch("research_planner.call_llm") as llm, self.assertRaises(ValueError):
                generate_research(body)
            llm.assert_not_called()

    def test_theory_metadata_and_quotes_are_server_owned(self):
        response = theories()
        response["items"][0].update(name="Invented", reference="Fake", url="javascript:alert(1)", quote="Fake quote", framework_id="bogus")
        with patch("research_planner.call_llm", return_value=(json.dumps(response), "mock")):
            result = generate_research(request("theories"))
        self.assertEqual(result["items"][0]["name"], THEORIES["framing"]["name"])
        self.assertEqual(result["items"][0]["quote"], request()["dataset"]["comments"][0]["comment"])
        self.assertIsNone(result["items"][2]["framework_id"])

    def test_unknown_theory_or_fabricated_quote_rejected(self):
        for field, value in (("theory_id", "fake"), ("quote_id", "999"), ("theory_id", [])):
            response = theories(); response["items"][0][field] = value
            with patch("research_planner.call_llm", return_value=(json.dumps(response), "mock")), self.assertRaises(ValueError):
                generate_research(request("theories"))

    def test_invalid_ai_formats_counts_duplicates_and_causal_titles(self):
        bad = [[], {}, {"items": []}, {"items": [None] * 5}]
        duplicate = titles(); duplicate["items"][1] = copy.deepcopy(duplicate["items"][0]); bad.append(duplicate)
        causal = titles(); causal["items"][0]["title"] = "Pengaruh media terhadap masyarakat"; bad.append(causal)
        missing = titles(); del missing["items"][0]["data_needed"]; bad.append(missing)
        for output in ["not json"] + [json.dumps(value) for value in bad]:
            with patch("research_planner.call_llm", return_value=(output, "mock")), self.assertRaises(ValueError):
                generate_research(request())

    def test_chosen_method_and_mixed_alternatives_enforced(self):
        body = request(); body["context"]["method"] = "Kualitatif"
        with patch("research_planner.call_llm", return_value=(json.dumps(titles()), "mock")), self.assertRaises(ValueError):
            generate_research(body)
        response = titles()
        for item in response["items"]: item["method"] = "Kualitatif"
        with patch("research_planner.call_llm", return_value=(json.dumps(response), "mock")), self.assertRaises(ValueError):
            generate_research(request())

    def test_fenced_json_accepted(self):
        with patch("research_planner.call_llm", return_value=("```json\n" + json.dumps(titles()) + "\n```", "mock")):
            self.assertEqual(len(generate_research(request())["items"]), 5)

    def test_request_validation(self):
        for body in (None, [], {}, {"kind": "bad"}, {**request(), "context": []}):
            with self.assertRaises(ValueError): generate_research(body)


if __name__ == "__main__":
    unittest.main()
