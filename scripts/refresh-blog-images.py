#!/usr/bin/env python3
"""Make blog covers + inlines unique and on-topic.

Eenmalige mapping. Niet blind opnieuw draaien: sommige bronnen zijn
blogbestanden die na de eerste run al zijn overschreven.

Prefer files already in the repo (kennisbank + leftover blog images).
Use verified local Unsplash crops only for remaining gaps.
"""
from __future__ import annotations

import hashlib
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BLOG = ROOT / "public/images/blog"
INLINE = BLOG / "inline"
KB = ROOT / "public/images/kennisbank"
KBI = KB / "inline"
TMPV = Path("/tmp/blog-verified")
TMPF = Path("/tmp/blog-fill")
TMPC = Path("/tmp/blog-img-candidates")


def md5_bytes(data: bytes) -> str:
    return hashlib.md5(data).hexdigest()


def md5_path(path: Path) -> str:
    return md5_bytes(path.read_bytes())


def dest_for(kind: str, slug: str) -> Path:
    folder = BLOG if kind == "cover" else INLINE
    v2 = folder / f"{slug}-v2.jpg"
    if v2.exists():
        return v2
    return folder / f"{slug}.jpg"


def ffmpeg_fit(src: Path) -> bytes:
    dest = Path(tempfile.mkstemp(suffix=".jpg")[1])
    try:
        ff = subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(src),
                "-vf",
                "scale=1600:900:force_original_aspect_ratio=increase,crop=1600:900",
                "-q:v",
                "3",
                str(dest),
            ],
            capture_output=True,
            text=True,
        )
        if ff.returncode != 0 or not dest.exists() or dest.stat().st_size < 8000:
            raise RuntimeError(f"ffmpeg fail {src}: {ff.stderr[-200:]}")
        return dest.read_bytes()
    finally:
        dest.unlink(missing_ok=True)


def load_src(src: Path) -> bytes:
    if not src.exists():
        raise FileNotFoundError(src)
    if src.is_relative_to(ROOT):
        return src.read_bytes()
    return ffmpeg_fit(src)


# kind, slug, source — one unique source per destination. Category fallbacks are copied last.
COPIES: list[tuple[str, str, Path]] = [
    # --- covers: split duplicate pairs + fix context mismatches ---
    ("cover", "buikvet-cortisol-slaap-mannen", TMPV / "hike_trail.jpg"),
    ("cover", "slaapkwaliteit-testosteron-herstel", TMPV / "bed_hotel.jpg"),
    ("cover", "magnesium-en-stress", KB / "cortisol-v2.jpg"),
    ("cover", "eiwit-na-40", TMPV / "boiled_eggs.jpg"),
    ("cover", "hoeveel-magnesium-per-dag", TMPV / "pumpkin_seeds.jpg"),
    ("cover", "beste-magnesium", KBI / "magnesiumvormen.jpg"),
    ("cover", "is-whey-schadelijk", TMPV / "whey_jar.jpg"),
    ("cover", "magnesium-en-spierkrampen", TMPF / "gym.jpg"),
    ("cover", "omega-3-en-medicijnen", TMPC / "pharmacy.jpg"),
    ("cover", "magnesium-overgang-vrouwen", BLOG / "overgang.jpg"),
    ("cover", "magnesium-en-slaapkwaliteit", TMPV / "bed_white.jpg"),
    ("cover", "magnesium-wanneer-innemen", KB / "adh.jpg"),
    ("cover", "magnesium-voor-wie-wel-niet", KB / "claimdekking-v2.jpg"),
    ("cover", "omega-3-en-hart-onderzoek", KB / "onafhankelijke-toetsing.jpg"),
    ("cover", "omega-3-hoeveel-per-dag", TMPF / "capsules.jpg"),
    ("cover", "omega-3-en-herstel", TMPV / "salmon_board.jpg"),
    ("cover", "overgang-stress-cortisol", BLOG / "inline/overgang.jpg"),
    ("cover", "omega-3-index-meten", TMPF / "lab.jpg"),
    ("cover", "visolie-oxidatie-en-bijwerkingen", TMPV / "fishoil_spill.jpg"),
    ("cover", "algenolie-of-visolie", TMPV / "seaweed_rocks.jpg"),
    ("cover", "whey-concentraat-isolaat-hydrolysaat", TMPV / "powder_scoop.jpg"),
    ("cover", "whey-etiket-lezen", TMPF / "desk.jpg"),
    ("cover", "whey-hoeveel-en-wanneer", TMPF / "blender.jpg"),
    ("cover", "whey-of-plantaardig-eiwit", KB / "eiwitbehoefte-na-40.jpg"),
    ("cover", "eiwit-en-whey-in-de-overgang", TMPV / "cottage_blue.jpg"),
    ("cover", "whey-en-darmklachten", TMPF / "dairy.jpg"),
    ("cover", "magnesium-uit-voeding", BLOG / "beste-magnesium.jpg"),
    ("cover", "krachttraining-na-40", BLOG / "testosteron-na-40.jpg"),
    ("cover", "magnesium-en-slaap", TMPV / "spinach.jpg"),
    ("cover", "vitamine-d-meten-wanneer-zinvol", KB / "derde-partij-testen.jpg"),
    ("cover", "magnesium-tekort-herkennen", TMPV / "almonds.jpg"),
    ("cover", "whey-wanneer-wel-en-niet", BLOG / "eiwit-na-40.jpg"),
    # --- inlines: cover≠inline + split remaining duplicate inlines ---
    ("inline", "algenolie-of-visolie", TMPV / "kelp.jpg"),
    ("inline", "eiwit-en-whey-in-de-overgang", TMPV / "breakfast.jpg"),
    ("inline", "hoeveel-magnesium-per-dag", TMPF / "greens.jpg"),
    ("inline", "is-whey-schadelijk", TMPF / "shake.jpg"),
    ("inline", "magnesium-en-spierkrampen", KBI / "overtrainingssyndroom.jpg"),
    ("inline", "magnesium-en-stress", TMPF / "forest.jpg"),
    ("inline", "magnesium-overgang-vrouwen", KBI / "hpa-as.jpg"),
    ("inline", "magnesium-tekort-herkennen", KBI / "kalium-natrium-balans.jpg"),
    ("inline", "magnesium-uit-voeding", TMPV / "greek_salad.jpg"),
    ("inline", "magnesium-voor-wie-wel-niet", KBI / "claimdekking.jpg"),
    ("inline", "magnesium-wanneer-innemen", KBI / "adh.jpg"),
    ("inline", "omega-3-en-hart-onderzoek", KBI / "derde-partij-testen.jpg"),
    ("inline", "omega-3-en-medicijnen", TMPF / "pills.jpg"),
    ("inline", "omega-3-hoeveel-per-dag", TMPC / "salmon1.jpg"),
    ("inline", "omega-3-index-meten", KBI / "onafhankelijke-toetsing.jpg"),
    ("inline", "omega-3-uit-voeding-of-supplement", KBI / "epa-dha.jpg"),
    ("inline", "visolie-oxidatie-en-bijwerkingen", TMPF / "omega_inline.jpg"),
    ("inline", "whey-concentraat-isolaat-hydrolysaat", TMPF / "powder.jpg"),
    ("inline", "whey-en-darmklachten", TMPF / "yogurt.jpg"),
    ("inline", "whey-etiket-lezen", KBI / "etikettransparantie.jpg"),
    ("inline", "whey-hoeveel-en-wanneer", TMPC / "smoothie.jpg"),
    ("inline", "whey-wanneer-wel-en-niet", TMPV / "egg_toast.jpg"),
    ("inline", "buikvet-cortisol-slaap-mannen", TMPV / "hike_forest.jpg"),
    ("inline", "overgang-slaapproblemen-opvliegers", TMPV / "bed_modern.jpg"),
    ("inline", "overgang-stress-cortisol", KBI / "cortisol.jpg"),
    ("inline", "krachttraining-na-40", KBI / "testosteron.jpg"),
    ("inline", "cortisol-en-slaap", TMPC / "bed2.jpg"),
    ("inline", "creatine-vormen-en-keurmerken", TMPF / "powder2.jpg"),
    ("inline", "vitamine-d-botgezondheid-overgang", KBI / "vitamine-d.jpg"),
    ("inline", "vitamine-d-en-energie", TMPV / "walk_sun.jpg"),
    ("inline", "testosteron-en-energie-na-40", TMPV / "hike_trees.jpg"),
    ("inline", "eiwit-na-40", TMPV / "oatmeal_cc.jpg"),
    ("inline", "beste-magnesium", TMPC / "greens.jpg"),
    ("inline", "omega-3-en-herstel", TMPF / "fish2.jpg"),
    ("inline", "magnesium-en-slaapkwaliteit", KBI / "slaaphygiene.jpg"),
    ("inline", "magnesium-en-slaap", KBI / "melatonine.jpg"),
    ("inline", "creatine-en-herstel", KBI / "atp.jpg"),
    ("inline", "krachtverlies-eiwitbehoefte-na-40", KBI / "leucinedrempel.jpg"),
    ("inline", "multivitamine-zinvol-na-40", KBI / "multivitamine.jpg"),
    ("inline", "supplement-kiezen-waar-op-letten", KBI / "efsa-claims.jpg"),
    ("inline", "omega-3-concentratie-energie", TMPF / "salmon.jpg"),
    ("inline", "wat-is-omega-3", TMPF / "ocean.jpg"),
    ("inline", "waar-let-je-op-bij-omega-3", TMPF / "veg.jpg"),
    ("inline", "ademhaling-tegen-stress", KBI / "nervus-vagus.jpg"),
    ("inline", "slaap-verbeteren-40-plus", TMPF / "bed.jpg"),
    ("inline", "energie-verhogen-natuurlijk", TMPV / "hike_path.jpg"),
    ("inline", "creatine-en-brein-slaaptekort", TMPF / "night.jpg"),
    ("inline", "zout-kalium-bloeddruk-na-40", TMPV / "avocado.jpg"),
    ("inline", "whey-of-plantaardig-eiwit", KBI / "insulineresistentie.jpg"),
    ("inline", "magnesium-in-de-overgang", KBI / "circadiaan-ritme.jpg"),
    ("inline", "beste-omega-3-supplement", TMPV / "kelp2.jpg"),
]


COVER_ALTS: dict[str, str] = {
    "buikvet-cortisol-slaap-mannen": "Wandelpad door het bos — beweging, slaap en minder buikvet horen bij elkaar",
    "slaapkwaliteit-testosteron-herstel": "Hotelbed met strak wit linnengoed in een rustige slaapkamer",
    "magnesium-en-stress": "Persoon in meditatiehouding in warm tegenlicht, gericht op herstel",
    "eiwit-na-40": "Gekookte eieren op een bord als praktische eiwitbron na 30",
    "hoeveel-magnesium-per-dag": "Pompoenpitten in een kom — een magnesiumrijke portie uit voeding",
    "beste-magnesium": "Verschillende poeders in glazen schaaltjes: magnesiumvormen naast elkaar",
    "is-whey-schadelijk": "Pot wei-eiwitpoeder met schepje op een rustig aanrecht",
    "magnesium-en-spierkrampen": "Krachttraining in een sportschool — krampen na inspanning vragen om context",
    "omega-3-en-medicijnen": "Apotheekschap met geneesmiddelen: omega-3 naast andere medicatie",
    "magnesium-overgang-vrouwen": "Vrouw van middelbare leeftijd in rustig daglicht, overgang en herstel",
    "magnesium-en-slaapkwaliteit": "Strak opgemaakt wit bed in een lichte slaapkamer",
    "magnesium-wanneer-innemen": "Glas helder water op een houten tafel bij het raam",
    "magnesium-voor-wie-wel-niet": "Witte capsules naast een checklist in een notitieboek",
    "omega-3-en-hart-onderzoek": "Laborant achter een microscoop bij onafhankelijk onderzoek",
    "omega-3-hoeveel-per-dag": "Supplementcapsules op een licht werkblad, klaar om te doseren",
    "omega-3-en-herstel": "Zalmfilet op een houten plank als omega-3-bron na training",
    "overgang-stress-cortisol": "Vrouw in een rustmoment bij gedempt licht",
    "omega-3-index-meten": "Laboratoriumwerkplek met samples en meetapparatuur",
    "visolie-oxidatie-en-bijwerkingen": "Gemorste visolie op een werkblad — versheid telt zwaarder dan de claim",
    "algenolie-of-visolie": "Zeewier op rotsen in ondiep water, de plantaardige bron van EPA en DHA",
    "whey-concentraat-isolaat-hydrolysaat": "Maatlepel met eiwitpoeder op een licht blad",
    "whey-etiket-lezen": "Handen aan een bureau met documenten bij het vergelijken van etiketten",
    "whey-hoeveel-en-wanneer": "Blender op het aanrecht voor een eiwitshake",
    "whey-of-plantaardig-eiwit": "Kom met tofu, ei en groenten als plantaardige én dierlijke eiwitbronnen",
    "eiwit-en-whey-in-de-overgang": "Kwark of cottage cheese als eiwitrijke basis in de overgang",
    "whey-en-darmklachten": "Zuivel in glazen flessen — lactose is vaak de boosdoener bij whey",
    "magnesium-uit-voeding": "Spinazie, pompoenpitten en amandelen op een houten plank",
    "krachttraining-na-40": "Man die krachttraining doet in een sportschool",
    "magnesium-en-slaap": "Verse spinazie als magnesiumrijke groente bij de avondmaaltijd",
    "vitamine-d-meten-wanneer-zinvol": "Laboratoriumglaswerk in een lichte werkruimte, klaar voor een meting",
    "magnesium-tekort-herkennen": "Amandelen op een lichte ondergrond, rijk aan magnesium",
    "whey-wanneer-wel-en-niet": "Eiwitshake in een shaker naast een schepje poeder",
    "energie-verhogen-natuurlijk": "Hardloopschoenen op betonnen trappen bij buitenbeweging",
    "slaap-verbeteren-40-plus": "Opgemaakt bed met nachtlamp in een rustige slaapkamer",
    "cortisol-verlagen-natuurlijk": "Persoon in meditatiehouding in warm tegenlicht",
    "omega-3-concentratie-energie": "Gebakken zalmfilet met groenten op een donker bord",
    "beste-omega-3-supplement": "Omega-3-flesje met softgels en een schaaltje zalm",
    "omega-3-uit-voeding-of-supplement": "Zalmfilet en makreel op ijs met citroen",
    "wat-is-omega-3": "Forel, sardines en een schaaltje olie als omega-3-bronnen",
    "waar-let-je-op-bij-omega-3": "Witte potjes, visoliecapsules en verse vis op een aanrecht",
    "creatine-en-herstel": "Halterstang die van de vloer wordt getild na een set",
    "creatine-vormen-en-keurmerken": "Wit supplementpoeder met een maatlepel op een neutraal vlak",
    "zink-en-testosteron": "Biefstuk, oesters en pompoenpitten als zinkrijke voeding",
    "zout-kalium-bloeddruk-na-40": "Kom met avocado, kikkererwten en groenten, rijk aan kalium",
    "magnesium-in-combinatie-met-medicijnen": "Witte potjes, capsules en medicijnblisters op een houten tafel",
    "magnesium-in-de-overgang": "Supplementpot, capsules en een glas water op een licht blad",
    "melatonine-na-40": "Rode zonsondergang boven een stil landschap",
    "multivitamine-zinvol-na-40": "Keuken met verse groenten en olie in plaats van alleen een multi",
    "ademhaling-tegen-stress": "Persoon in yogahouding bij zonsondergang aan het water",
    "krachtverlies-eiwitbehoefte-na-40": "Rij dumbbells in een sportschool",
    "eiwitinname-timing-mannen-40": "Bord met kip, eieren, cottage cheese en peulvruchten",
    "supplement-kiezen-waar-op-letten": "Mensen aan een bureau die documenten en een etiket vergelijken",
}


BODY_COPY: dict[str, tuple[str, str]] = {
    "algenolie-of-visolie": (
        "Zeewier in ondiep water, de oorsprong van EPA en DHA in algenolie",
        "Algenolie haalt EPA en DHA bij de bron; visolie volgt dezelfde keten één schakel later.",
    ),
    "eiwit-en-whey-in-de-overgang": (
        "Ontbijttafel met eiwitrijke producten in ochtendlicht",
        "In de overgang stijgt de eiwitbehoefte; een vast ontbijt met eiwit is praktischer dan één late shake.",
    ),
    "hoeveel-magnesium-per-dag": (
        "Stapel verse bladgroenten als magnesium uit voeding",
        "De ADH telt voeding mee: groene bladgroenten vullen het dagtotaal voordat een poeder dat doet.",
    ),
    "is-whey-schadelijk": (
        "Eiwitshake in een blenderbeker op het aanrecht",
        "Voor gezonde nieren is whey binnen normale doseringen geen alarm — de context van het etiket telt.",
    ),
    "magnesium-en-spierkrampen": (
        "Hardloopschoenen na een training, klaar voor herstel",
        "Bij krampen zonder tekort doet extra magnesium meestal niets; eerst vocht, zout en belasting checken.",
    ),
    "magnesium-en-stress": (
        "Stil bospad in zacht licht, minder prikkels dan een volle werkdag",
        "Stress verhoogt de magnesiumbehoefte; een boswandeling haalt de bron van de spanning niet weg, wel de piek.",
    ),
    "magnesium-overgang-vrouwen": (
        "Persoon op een parkbank in een korte rustpauze",
        "In de overgang verandert de slaap eerder dan de magnesiumstatus — rustmomenten tellen minstens zo zwaar.",
    ),
    "magnesium-tekort-herkennen": (
        "Snijplank met tomaat, avocado en bladgroen",
        "Een magnesiumtekort herken je zelden aan één klacht; groenten en noten zeggen meer dan één bloedwaarde.",
    ),
    "magnesium-uit-voeding": (
        "Kleurrijke salade met bladgroen, tomaat en kaas",
        "Groene bladgroenten, noten en volkoren dragen je magnesium — het potje vult alleen het gat.",
    ),
    "magnesium-voor-wie-wel-niet": (
        "Capsules naast een notitieboek met een afweging",
        "Bij nierproblemen of bepaalde medicatie is magnesium geen vanzelfsprekende keuze.",
    ),
    "magnesium-wanneer-innemen": (
        "Glas water op een houten tafel bij daglicht",
        "Wanneer je magnesium inneemt verandert vooral hoe goed je het verdraagt, niet de voorraad in één nacht.",
    ),
    "omega-3-en-hart-onderzoek": (
        "Laboratoriumglaswerk in een heldere werkruimte",
        "VITAL, REDUCE-IT en STRENGTH vonden niet hetzelfde — dosis, vorm en het labprotocol verschilden.",
    ),
    "omega-3-en-medicijnen": (
        "Losse tabletten en capsules op een licht blad",
        "Omega-3 en bloedverdunners vragen om overleg met je arts, niet om zelf de doses stapelen.",
    ),
    "omega-3-hoeveel-per-dag": (
        "Verse zalmfilet als natuurlijke bron van EPA en DHA",
        "Hoeveel omega-3 per dag hangt af van EPA en DHA samen, niet van het aantal capsules op het etiket.",
    ),
    "omega-3-index-meten": (
        "Laborant achter een microscoop bij een bloedmeting",
        "De omega-3-index meet wat er in je membranen zit, niet wat je die ochtend hebt geslikt.",
    ),
    "omega-3-uit-voeding-of-supplement": (
        "Vette visfilet met schilferige structuur op een bord",
        "Twee porties vette vis per week leveren vaak al wat een visoliecapsule belooft.",
    ),
    "visolie-oxidatie-en-bijwerkingen": (
        "Gegrilde zalm als verse omega-3, zonder ranzige olie",
        "Ranzige visolie ruik je eerder dan je hem proeft; versheid staat zelden in milligrammen op het etiket.",
    ),
    "whey-concentraat-isolaat-hydrolysaat": (
        "Schepje eiwitpoeder op een donkere ondergrond",
        "Concentraat, isolaat en hydrolysaat verschillen in lactose en prijs, nauwelijks in spieropbouw.",
    ),
    "whey-en-darmklachten": (
        "Schaal yoghurt als zuivelalternatief naast whey",
        "Darmklachten bij whey komen vaker van lactose dan van het eiwit zelf — yoghurt of isolaat is een tussenstap.",
    ),
    "whey-etiket-lezen": (
        "Supplementpot met een volledig leesbare achterkant",
        "Op het etiket telt het eiwit per portie, niet de claim op de voorkant van de pot.",
    ),
    "whey-hoeveel-en-wanneer": (
        "Groene smoothie in een blender als eiwitmoment op de dag",
        "De dagtotalen bepalen je spieropbouw; de timing van de shake is de fijnafstelling.",
    ),
    "whey-of-plantaardig-eiwit": (
        "Kom met groenten en een eiwitrijke maaltijd uit de pan",
        "Plantaardig eiwit werkt ook, mits je op de leucine en de totale inname per maaltijd let.",
    ),
    "whey-wanneer-wel-en-niet": (
        "Geroosterd ei op toast als eiwit uit de keuken in plaats van een shake",
        "Whey is handig als je bord het niet redt, niet als vervanging van eieren, kwark of vis.",
    ),
    "buikvet-cortisol-slaap-mannen": (
        "Boswandeling in gefilterd licht, minder stress dan een late workout",
        "Voldoende slaap en rustige beweging remmen cortisolgedreven buikvet sterker dan nóg een HIIT-sessie.",
    ),
    "overgang-slaapproblemen-opvliegers": (
        "Modern bed met strak linnengoed in een koele slaapkamer",
        "Een koele slaapkamer met laag-voor-laag beddengoed dempt nachtelijke opvliegers beter dan extra dekens.",
    ),
    "overgang-stress-cortisol": (
        "Theekop in ochtendlicht bij een raam — een vast ochtendritme",
        "Regelmaat en ademhaling dempen een stresssysteem dat in de overgang gevoeliger reageert.",
    ),
    "krachttraining-na-40": (
        "Krachttraining met een barbell in een sobere sportschool",
        "Krachttraining na 30 is een van de duidelijkste manieren om spier- en botmassa te beschermen.",
    ),
    "cortisol-en-slaap": (
        "Slaapkamer met gedempt licht en een opgemaakt bed",
        "Als cortisol ’s nachts piekt, blijf je wakker terwijl het bed klaarstaat — eerst het ritme, dan de pil.",
    ),
    "creatine-vormen-en-keurmerken": (
        "Beige poeder met een maatlepel, klaar om de vorm te vergelijken",
        "Bij creatine-vormen telt zuivere monohydraat met keurmerk zwaarder dan een exotische variant op het etiket.",
    ),
    "vitamine-d-botgezondheid-overgang": (
        "Zon op huid bij een wandeling — vitamine D begint bij licht",
        "Vitamine D ondersteunt calciumopname voor de botten, maar vervangt niet de oestrogeenbescherming die wegvalt.",
    ),
    "vitamine-d-en-energie": (
        "Wandelaar in tegenlicht op een pad, energie bij genoeg zonlicht",
        "Vitamine D en energie: een tekort kan moeheid in stand houden, vooral in de donkere maanden.",
    ),
    "testosteron-en-energie-na-40": (
        "Wandelaar in de zon op een buitenpad",
        "Testosteron en energie na 30: slaaptekort en overtraining drukken vaak harder dan één bloedwaarde.",
    ),
    "eiwit-na-40": (
        "Havermout met kwark als eiwit bij het ontbijt",
        "Eiwit na 30 ondersteunt spierbehoud; de verdeling over de dag telt minstens zo zwaar als het dagtotaal.",
    ),
    "beste-magnesium": (
        "Verse bladgroenten in een keuken als magnesium uit voeding én context bij een supplement",
        "Het beste magnesium hangt af van het doel: bisglycinaat, citraat of tauraat zijn niet inwisselbaar.",
    ),
    "omega-3-en-herstel": (
        "Verse vis bij de visboer, omega-3 vóór de capsule",
        "Omega-3 en herstel: EPA en DHA spelen een rol bij ontstekingsresolutie na inspanning.",
    ),
    "magnesium-en-slaapkwaliteit": (
        "Slaapkamer met gedempt licht en strak linnengoed",
        "Een avonddosis magnesium kan rust ondersteunen, maar vervangt geen vast slaapritme.",
    ),
    "magnesium-en-slaap": (
        "Avondhemel met de eerste sterren boven een donker veld",
        "Magnesium en slaap: de minerale voorraad telt, het licht-donkerritme bepaalt of je überhaupt inslaapt.",
    ),
    "creatine-en-herstel": (
        "Start van een korte krachtinspanning in de sportschool",
        "Creatine helpt ATP aanvullen, vooral bij herhaalde sets — herstel begint bij de voorraad in de spier.",
    ),
    "krachtverlies-eiwitbehoefte-na-40": (
        "Kwark, eieren en peulvruchten op een werkblad",
        "Oudere spieren hebben meer eiwit per maaltijd nodig om dezelfde opbouwprikkel te bereiken.",
    ),
    "multivitamine-zinvol-na-40": (
        "Bord met groenten, vis en volkoren in plaats van alleen een multi",
        "Een multivitamine vult gaten; de basis blijft een gevarieerd voedingspatroon.",
    ),
    "supplement-kiezen-waar-op-letten": (
        "Stapel documenten en een markeerstift op een bureau",
        "Een supplement kiezen begint bij het etiket: dosis, vorm, keurmerk en wat er juist niet op staat.",
    ),
    "omega-3-concentratie-energie": (
        "Zalmfilet op een bord, rijk aan EPA en DHA",
        "Omega-3 zit vooral in vette vis; concentratie en energie vragen om een werkzame dosis, niet om marketing.",
    ),
    "wat-is-omega-3": (
        "Open zee als herkomst van EPA en DHA, of je nu vis of algen kiest",
        "Wat is omega-3: het gaat om EPA en DHA uit vis of algen, niet om elk plantaardig oliezuur op een etiket.",
    ),
    "waar-let-je-op-bij-omega-3": (
        "Groenten op een werkblad naast de keuze voor vis of capsule",
        "Waar let je op bij omega-3: dosis EPA/DHA, versheid, en of de claim de milligrammen dekt.",
    ),
    "ademhaling-tegen-stress": (
        "Persoon die rustig ademhaalt met gesloten ogen",
        "Ademhaling tegen stress werkt via het autonome zenuwstelsel — een trage uitademing kan de spanning laten zakken.",
    ),
    "slaap-verbeteren-40-plus": (
        "Opgemaakt bed in een lichte slaapkamer, klaar voor de nacht",
        "Slaap verbeteren na 30 vraagt vaak om ritme en licht — niet alleen om een extra supplement.",
    ),
    "energie-verhogen-natuurlijk": (
        "Pad door het landschap in helder daglicht",
        "Energie verhogen na 30 lukt vaker met beweging, slaap en voeding dan met een snelle stimulant.",
    ),
    "creatine-en-brein-slaaptekort": (
        "Nachtelijk landschap — slaaptekort is geen probleem dat je alleen met poeder oplost",
        "Creatine en het brein bij slaaptekort is een jong onderzoeksveld: hoopvol, maar geen vervanging van slaap.",
    ),
    "zout-kalium-bloeddruk-na-40": (
        "Avocado in de schil, rijk aan kalium naast minder zout",
        "Kalium uit groenten en fruit helpt de natrium-kaliumbalans; bloeddruk reageert op het geheel.",
    ),
    "magnesium-in-de-overgang": (
        "Ochtendzon boven water — ritme telt zwaarder dan één capsule",
        "Magnesium ondersteunt slaap en spierontspanning in de overgang, maar is geen bewezen middel tegen opvliegers.",
    ),
    "beste-omega-3-supplement": (
        "Zeewier onder water, dezelfde EPA en DHA-keten als in visolie",
        "Het beste omega-3-supplement herken je aan EPA+DHA per capsule, oxidatie en een leesbaar etiket.",
    ),
}


# metaDescription tweaks only where the visual subject should appear in search snippets.
META_DESC: dict[str, str] = {
    "vitamine-d-meten-wanneer-zinvol": "Wanneer vitamine D laten meten zinvol is, wat een labwaarde zegt, en waarom een eenmalige prik geen seizoensritme vervangt.",
    "omega-3-en-hart-onderzoek": "Wat grote hartstudies met omega-3 wel en niet lieten zien: dosis, vorm en waarom VITAL, REDUCE-IT en STRENGTH uiteenlopen.",
    "omega-3-index-meten": "De omega-3-index meet EPA en DHA in je cellen, niet wat je slikt. Wanneer een labtest zinvol is en wat het getal betekent.",
    "algenolie-of-visolie": "Algenolie of visolie: dezelfde EPA en DHA, andere bron. Voor wie plantaardig wil, waar je op let bij dosis en versheid.",
    "magnesium-uit-voeding": "Magnesium uit voeding: spinazie, pitten en noten per portie, en wanneer een supplement het gat nog moet vullen.",
    "eiwit-na-40": "Eiwit na 30: hoeveel per maaltijd, waarom eieren en kwark vaak winnen van alleen een shake, en hoe je verdeelt over de dag.",
    "whey-of-plantaardig-eiwit": "Whey of plantaardig eiwit: leucine, dagtotaal en wanneer een tofu- of erwtenpoeder dezelfde spierprikkel haalt.",
    "krachttraining-na-40": "Krachttraining na 30: waarom spier- en botmassa een halter nodig hebben, en hoe je dosering en herstel praktisch houdt.",
    "is-whey-schadelijk": "Is whey schadelijk voor nieren, lever of huid? Wat onderzoek zegt bij normale doseringen en hoe je het etiket leest.",
    "visolie-oxidatie-en-bijwerkingen": "Ranzige visolie, oprispingen en oxidatie: hoe je versheid herkent en wanneer een supplement meer kwaad dan goed doet.",
}


def patch_cover_alt(slug: str, alt: str) -> None:
    targets = [
        ROOT / "src/data/blog" / f"{slug}.ts",
        ROOT / "src/data/blog/cornerstone-supplementen.ts",
        ROOT / "src/data/blog-posts.ts",
    ]
    escaped_alt = alt.replace("\\", "\\\\").replace('"', '\\"')
    for path in targets:
        if not path.exists():
            continue
        text = path.read_text()
        if slug not in text and path.name != f"{slug}.ts":
            continue
        if path.name == f"{slug}.ts":
            new, n = re.subn(
                r'coverImageAlt: "[^"]*"',
                f'coverImageAlt: "{escaped_alt}"',
                text,
                count=1,
            )
            if n:
                path.write_text(new)
                print(f"alt {path.relative_to(ROOT)}")
            continue
        # Multi-artikelbestanden: vervang de alt bij dit cover-pad.
        pattern = (
            rf'(coverImage: "/images/blog/{re.escape(slug)}(?:-v\d+)?\.jpg",\n\s*)'
            r'coverImageAlt: "[^"]*"'
        )
        new, n = re.subn(
            pattern,
            rf'\1coverImageAlt: "{escaped_alt}"',
            text,
            count=1,
        )
        if n:
            path.write_text(new)
            print(f"alt {path.relative_to(ROOT)} ({slug})")


def patch_body_copy(slug: str, alt: str, caption: str) -> None:
    path = ROOT / "src/data/article-body-images.ts"
    text = path.read_text()
    escaped_alt = alt.replace("\\", "\\\\").replace('"', '\\"')
    escaped_cap = caption.replace("\\", "\\\\").replace('"', '\\"')
    pattern = (
        rf'("{re.escape(slug)}": img\(\n'
        rf'    "blog",\n'
        rf'    "{re.escape(slug)}",\n)'
        rf'    "[^"]*",\n'
        rf'    "[^"]*"'
    )
    repl = rf'\1    "{escaped_alt}",\n    "{escaped_cap}"'
    new, n = re.subn(pattern, repl, text, count=1)
    if not n:
        print(f"WARN body copy not patched: {slug}")
        return
    path.write_text(new)


def patch_meta_desc(slug: str, desc: str) -> None:
    path = ROOT / "src/data/blog" / f"{slug}.ts"
    if not path.exists():
        print(f"WARN no meta file {slug}")
        return
    text = path.read_text()
    escaped = desc.replace("\\", "\\\\").replace('"', '\\"')
    new, n = re.subn(
        r'metaDescription:\s*"[^"]*"',
        f'metaDescription: "{escaped}"',
        text,
        count=1,
    )
    if n:
        path.write_text(new)
        print(f"meta {slug}")
    else:
        print(f"WARN metaDescription not patched: {slug}")


def verify() -> int:
    covers: dict[str, list[str]] = {}
    inlines: dict[str, list[str]] = {}
    for p in BLOG.glob("*.jpg"):
        if p.name.startswith("categorie-"):
            continue
        covers.setdefault(md5_path(p), []).append(p.name)
    for p in INLINE.glob("*.jpg"):
        inlines.setdefault(md5_path(p), []).append(p.name)

    errors = 0
    print("\n=== duplicate covers ===")
    for h, names in covers.items():
        arts = [n for n in names]
        if len(arts) > 1:
            print(" ", arts)
            errors += 1
    print("=== duplicate inlines ===")
    for h, names in inlines.items():
        if len(names) > 1:
            print(" ", names)
            errors += 1
    print("=== cover == inline same slug ===")
    for p in BLOG.glob("*.jpg"):
        if p.name.startswith("categorie-"):
            continue
        slug = re.sub(r"-v\d+$", "", p.stem)
        ip = dest_for("inline", slug)
        if ip.exists() and md5_path(p) == md5_path(ip):
            print(" ", slug)
            errors += 1
    print("errors", errors)
    return errors


def main() -> int:
    seen_src: dict[str, str] = {}
    staged: list[tuple[Path, bytes, str]] = []
    for kind, slug, src in COPIES:
        dest = dest_for(kind, slug)
        data = load_src(src)
        digest = md5_bytes(data)
        label = f"{kind}:{slug}"
        prev = seen_src.get(digest)
        if prev:
            print(f"SOURCE COLLISION {prev} vs {label} ({src})")
            return 1
        seen_src[digest] = label
        staged.append((dest, data, label))

    for dest, data, label in staged:
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
        print(f"write {dest.relative_to(ROOT)} ← {label}")

    # Categorie-fallbacks: kopieën van representatieve artikelcovers.
    fallbacks = {
        "categorie-stress.jpg": dest_for("cover", "cortisol-verlagen-natuurlijk"),
        "categorie-slaap.jpg": dest_for("cover", "slaap-verbeteren-40-plus"),
        "categorie-energie.jpg": dest_for("cover", "energie-verhogen-natuurlijk"),
        "categorie-supplementen.jpg": dest_for("cover", "supplement-kiezen-waar-op-letten"),
    }
    for name, src in fallbacks.items():
        shutil.copyfile(src, BLOG / name)
        print(f"fallback {name} ← {src.name}")

    for slug, alt in COVER_ALTS.items():
        patch_cover_alt(slug, alt)
    for slug, (alt, caption) in BODY_COPY.items():
        patch_body_copy(slug, alt, caption)
    for slug, desc in META_DESC.items():
        patch_meta_desc(slug, desc)

    return 0 if verify() == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
