import importlib.util
import pathlib
import unittest

PAD = pathlib.Path(__file__).resolve().parent.parent / "off-extract.py"
spec = importlib.util.spec_from_file_location("off_extract", PAD)
off_extract = importlib.util.module_from_spec(spec)
spec.loader.exec_module(off_extract)


def nutriment(name, waarde_100g, unit):
    return {"name": name, "value": None, "100g": waarde_100g, "unit": unit}


def rij(*nutriments):
    basis = [nutriment("energy-kcal", 400, "kcal"), nutriment("fat", 44, "g"), nutriment("proteins", 0.5, "g")]
    uit, reden = off_extract.bouw_rij(
        "8719200054196", [{"lang": "nl", "text": "Blue Band Goede Start!"}], "Blue Band", None, basis + list(nutriments), "2026-10-04"
    )
    assert reden is None, reden
    return uit


class Omrekenen(unittest.TestCase):
    def test_100g_veld_staat_in_gram_ongeacht_de_invoer_eenheid(self):
        self.assertAlmostEqual(off_extract.omrekenen(0.603, "mg", "mg"), 603)
        self.assertAlmostEqual(off_extract.omrekenen(0.603, "g", "mg"), 603)
        self.assertAlmostEqual(off_extract.omrekenen(7.5e-06, "µg", "µg"), 7.5)
        self.assertAlmostEqual(off_extract.omrekenen(0.051, "mcg", "mg"), 51)

    def test_energie_alleen_in_kcal(self):
        self.assertEqual(off_extract.omrekenen(400, "kcal", "kcal"), 400)
        self.assertEqual(off_extract.omrekenen(400, None, "kcal"), 400)
        self.assertIsNone(off_extract.omrekenen(1674, "kJ", "kcal"))


class BouwRij(unittest.TestCase):
    def test_natrium_en_zout_ingevoerd_in_mg_worden_geen_0(self):
        uit = rij(nutriment("sodium", 0.4, "mg"), nutriment("salt", 1.0, "mg"))
        self.assertEqual(uit["sodium_mg"], 400)
        self.assertEqual(uit["salt_g"], 1.0)

    def test_geschatte_micros_worden_niet_overgenomen(self):
        uit = rij(
            nutriment("calcium", 0.603, "mg"),
            nutriment("iron", 0.0004, "g"),
            nutriment("vitamin-c", 0.0004, "g"),
            nutriment("vitamin-d", 7.5e-06, "µg"),
        )
        for kolom in ("calcium_mg", "iron_mg", "vitamin_c_mg", "vitamin_d_ug"):
            self.assertIn(kolom, uit)
            self.assertIsNone(uit[kolom])

    def test_natrium_boven_puur_zout_wordt_null(self):
        self.assertIsNone(rij(nutriment("sodium", 45.0, "g"))["sodium_mg"])
        self.assertEqual(rij(nutriment("sodium", 39.3, "g"))["sodium_mg"], 39300)

    def test_niet_eindige_waarde_wordt_overgeslagen(self):
        uit = rij(nutriment("sodium", float("nan"), "g"), nutriment("salt", float("inf"), "g"))
        self.assertIsNone(uit["sodium_mg"])
        self.assertIsNone(uit["salt_g"])

    def test_ontbrekende_stof_blijft_null(self):
        self.assertIsNone(rij()["sodium_mg"])


if __name__ == "__main__":
    unittest.main()
