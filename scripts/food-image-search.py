#!/usr/bin/env python3
"""Propose Pexels photo candidates for food-catalog image owners.

Search only — no downloads, no source edits. Review
scripts/out/food-image-candidates.tsv, then copy chosen ids into
food-image-download.py.

Requires PEXELS_API_KEY (free key from https://www.pexels.com/api/).
"""
from __future__ import annotations

import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "src/data/nutrition/food-catalog.ts"
OUT_DIR = ROOT / "scripts/out"
OUT_FILE = OUT_DIR / "food-image-candidates.tsv"
SEARCH_URL = "https://api.pexels.com/v1/search"

# Catalog keys that share one photo. Unlisted keys own themselves.
SHARED_OWNER: dict[str, str] = {
    "spinazie-rauw": "spinazie-gekookt",
    "spinazie-gekookt": "spinazie-gekookt",
    "spinazie-diepvries": "spinazie-gekookt",
    "boerenkool-gekookt": "boerenkool-gekookt",
    "boerenkool-rauw": "boerenkool-gekookt",
    "andijvie-rauw": "andijvie-gekookt",
    "andijvie-gekookt": "andijvie-gekookt",
    "witlof-rauw": "witlof-gekookt",
    "witlof-gekookt": "witlof-gekookt",
    "broccoli-gekookt": "broccoli-gekookt",
    "broccoli-gestoomd": "broccoli-gekookt",
    "broccoli-rauw": "broccoli-gekookt",
    "broccoli-diepvries": "broccoli-gekookt",
    "bloemkool-gekookt": "bloemkool-gekookt",
    "bloemkool-rauw": "bloemkool-gekookt",
    "wortel-rauw": "wortel-rauw",
    "wortel-gekookt": "wortel-rauw",
    "tomaat": "tomaat",
    "tomaat-blik": "tomaat",
    "paprika-rauw": "paprika-rauw",
    "paprika-gebakken": "paprika-rauw",
    "courgette-gebakken": "courgette-gebakken",
    "courgette-gekookt": "courgette-gebakken",
    "pompoen-gekookt": "pompoen-gekookt",
    "pompoen-geroosterd": "pompoen-gekookt",
    "ui-rauw": "ui-rauw",
    "ui-gebakken": "ui-rauw",
    "mais-blik": "mais-kolf",
    "mais-kolf": "mais-kolf",
    "sperziebonen-gekookt": "sperziebonen-gekookt",
    "sperziebonen-diepvries": "sperziebonen-gekookt",
    "champignons-gebakken": "champignons-gebakken",
    "champignons-rauw": "champignons-gebakken",
    "abrikoos-vers": "abrikoos-vers",
    "abrikoos-gedroogd": "abrikoos-vers",
    "vijg-vers": "vijg-vers",
    "gedroogde-vijgen": "vijg-vers",
    "pruim": "pruim",
    "pruimen-gedroogd": "pruim",
    "quinoa": "quinoa",
    "quinoa-droog": "quinoa",
    "volkoren-pasta": "volkoren-pasta-gekookt",
    "volkoren-pasta-gekookt": "volkoren-pasta-gekookt",
    "pasta-wit-droog": "pasta-wit-gekookt",
    "pasta-wit-gekookt": "pasta-wit-gekookt",
    "kikkererwten-gekookt": "kikkererwten-gekookt",
    "kikkererwten-blik": "kikkererwten-gekookt",
    "linzen-gekookt": "linzen-gekookt",
    "linzen-rood-gekookt": "linzen-gekookt",
    "linzen-groen-gekookt": "linzen-gekookt",
    "linzen-bruin-gekookt": "linzen-gekookt",
    "linzen-blik": "linzen-gekookt",
    "kidneybonen-gekookt": "kidneybonen-gekookt",
    "kidneybonen-blik": "kidneybonen-gekookt",
    "witte-bonen-gekookt": "witte-bonen-gekookt",
    "cannellinibonen-blik": "witte-bonen-gekookt",
    "doperwten-diepvries": "erwten-diepvries",
    "erwten-diepvries": "erwten-diepvries",
    "zalm-gekweekt": "zalm-gekweekt",
    "zalm-wild": "zalm-gekweekt",
    "zalm-gerookt": "zalm-gekweekt",
    "zalm-blik": "zalm-gekweekt",
    "makreel": "makreel",
    "makreel-gerookt": "makreel",
    "forel": "forel",
    "gerookte-forel": "forel",
    "tonijn-blik": "tonijn-vers",
    "tonijn-vers": "tonijn-vers",
    "ei-gekookt": "ei-gekookt",
    "ei-gebakken": "ei-gekookt",
    "melk-vol": "melk-vol",
    "melk-halfvol": "melk-vol",
    "melk-mager": "melk-vol",
    "yoghurt-vol": "yoghurt-vol",
    "yoghurt-mager": "yoghurt-vol",
    "magere-kwark": "magere-kwark",
    "volle-kwark": "magere-kwark",
    "sojadrink-verrijkt": "sojadrink-verrijkt",
    "sojadrink-onverrijkt": "sojadrink-verrijkt",
    "olijfolie-ev": "olijfolie-ev",
    "olijfolie": "olijfolie-ev",
    "aardappel-gekookt": "aardappel-gekookt",
    "aardappel-gebakken": "aardappel-gekookt",
    "aardappelpuree": "aardappel-gekookt",
    "ovenaardappel": "aardappel-gekookt",
}

QUERIES = {
    "spinazie-gekookt": "cooked spinach",
    "boerenkool-gekookt": "cooked kale",
    "snijbiet-gekookt": "cooked swiss chard",
    "andijvie-gekookt": "cooked endive",
    "sla-kropsla": "iceberg lettuce head",
    "rucola": "fresh arugula leaves",
    "veldsla": "lambs lettuce",
    "witlof-gekookt": "cooked belgian endive",
    "broccoli-gekookt": "cooked broccoli florets",
    "bloemkool-gekookt": "cooked cauliflower",
    "spruitjes-gekookt": "cooked brussels sprouts",
    "rodekool-gekookt": "cooked red cabbage",
    "witte-kool-gekookt": "cooked white cabbage",
    "zuurkool": "sauerkraut",
    "paksoi-gekookt": "cooked bok choy",
    "wortel-rauw": "fresh carrots",
    "pastinaak-gekookt": "cooked parsnip",
    "biet-gekookt": "cooked beetroot",
    "knolselderij-gekookt": "cooked celeriac",
    "radijs": "fresh radishes",
    "koolraap-gekookt": "cooked rutabaga",
    "tomaat": "fresh tomatoes",
    "paprika-rauw": "fresh bell peppers",
    "komkommer": "fresh cucumber",
    "courgette-gebakken": "sauteed zucchini",
    "aubergine-gebakken": "cooked eggplant",
    "pompoen-gekookt": "cooked pumpkin",
    "ui-rauw": "yellow onions",
    "prei-gekookt": "cooked leeks",
    "knoflook": "garlic bulbs",
    "asperges-gekookt": "cooked asparagus",
    "mais-kolf": "corn on the cob",
    "erwten-diepvries": "green peas bowl",
    "sperziebonen-gekookt": "cooked green beans",
    "champignons-gebakken": "sauteed mushrooms",
    "paddenstoelen-uv": "white button mushrooms",
    "zeewier-nori": "nori seaweed sheets",
    "avocado": "fresh avocado",
    "appel": "fresh apples",
    "peer": "fresh pears",
    "banaan": "bananas",
    "sinaasappel": "oranges",
    "mandarijn": "tangerines",
    "grapefruit": "grapefruit",
    "citroen": "lemons",
    "limoen": "limes",
    "kiwi": "kiwi fruit",
    "mango": "fresh mango",
    "ananas": "fresh pineapple",
    "druiven": "grapes",
    "aardbeien": "strawberries",
    "blauwe-bessen": "blueberries",
    "frambozen": "raspberries",
    "bramen": "blackberries",
    "kersen": "cherries",
    "perzik": "peaches",
    "nectarine": "nectarines",
    "pruim": "fresh plums",
    "abrikoos-vers": "fresh apricots",
    "meloen": "cantaloupe melon",
    "granaatappel": "pomegranate",
    "vijg-vers": "fresh figs",
    "dadels": "dried dates",
    "rozijnen": "raisins",
    "fruit-diepvries": "frozen mixed berries",
    "appelmoes": "applesauce bowl",
    "havermout": "rolled oats",
    "haverzemelen": "oat bran",
    "rijst-wit-gekookt": "cooked white rice",
    "zilvervliesrijst": "cooked brown rice",
    "basmatirijst-gekookt": "cooked basmati rice",
    "wilde-rijst-gekookt": "cooked wild rice",
    "quinoa": "cooked quinoa",
    "bulgur-gekookt": "cooked bulgur",
    "couscous-gekookt": "cooked couscous",
    "boekweit-gekookt": "cooked buckwheat groats",
    "gierst-gekookt": "cooked millet",
    "amarant-gekookt": "cooked amaranth grain",
    "teff": "teff grain",
    "gerst-gekookt": "cooked barley",
    "spelt-gekookt": "cooked spelt grain",
    "polenta": "polenta",
    "volkorenbrood": "whole wheat bread loaf",
    "witbrood": "white bread loaf",
    "meergranenbrood": "multigrain bread",
    "roggebrood": "rye bread",
    "zuurdesembrood": "sourdough bread",
    "speltbrood": "spelt bread",
    "stokbrood": "baguette",
    "pita": "pita bread",
    "naan": "naan bread",
    "tortilla-wrap": "flour tortilla",
    "bagel": "bagel",
    "croissant": "croissant",
    "crackers-volkoren": "whole wheat crackers",
    "knackebrod": "crispbread",
    "beschuit": "rusk toast",
    "rijstwafel": "rice cakes",
    "maiswafel": "corn cakes",
    "toast": "toasted bread",
    "volkoren-pasta-gekookt": "cooked whole wheat pasta",
    "pasta-wit-gekookt": "cooked spaghetti",
    "linzenpasta-droog": "red lentil pasta",
    "kikkererwtenpasta-droog": "chickpea pasta",
    "rijstnoedels-gekookt": "cooked rice noodles",
    "eiernoedels-gekookt": "cooked egg noodles",
    "ramen-noedels": "ramen noodles bowl",
    "sobanoedels-gekookt": "soba noodles",
    "kikkererwten-gekookt": "cooked chickpeas",
    "linzen-gekookt": "cooked lentils",
    "kidneybonen-gekookt": "cooked kidney beans",
    "zwarte-bonen-gekookt": "cooked black beans",
    "witte-bonen-gekookt": "cooked white beans",
    "bruine-bonen-gekookt": "cooked brown beans",
    "sojabonen-gekookt": "cooked soybeans",
    "edamame": "edamame",
    "spliterwten-gekookt": "cooked split peas",
    "kapucijners": "marrowfat peas",
    "tuinbonen-gekookt": "cooked fava beans",
    "amandelen": "raw almonds",
    "walnoten": "walnuts",
    "cashewnoten": "cashew nuts",
    "hazelnoten": "hazelnuts",
    "pecannoten": "pecan nuts",
    "pistachenoten": "pistachios",
    "paranoten": "brazil nuts",
    "macadamia": "macadamia nuts",
    "pinda": "peanuts",
    "pijnboompitten": "pine nuts",
    "notenmix": "mixed nuts unsalted",
    "chiazaad": "chia seeds",
    "lijnzaad": "ground flaxseed",
    "hennepzaad": "hulled hemp seeds",
    "sesamzaad": "sesame seeds",
    "pompoenzaden": "pumpkin seeds",
    "zonnebloempitten": "sunflower seeds",
    "maanzaad": "poppy seeds",
    "kipfilet": "chicken breast",
    "kipdij": "chicken thighs",
    "kippenvleugel": "chicken wings",
    "kalkoenfilet": "turkey breast",
    "rundvlees-mager": "lean beef steak",
    "biefstuk": "beef steak",
    "rundergehakt": "ground beef",
    "half-om-half-gehakt": "ground meat",
    "varkenshaas": "pork tenderloin",
    "varkenskarbonade": "pork chop",
    "schnitzel": "schnitzel",
    "kalfsvlees": "veal",
    "lamsvlees": "lamb meat",
    "eend": "duck breast",
    "konijn": "rabbit meat",
    "wild": "venison steak",
    "hamburger": "beef hamburger patty",
    "worst": "sausage",
    "bacon": "bacon strips",
    "ham": "sliced ham",
    "rosbief": "roast beef slices",
    "salami": "salami slices",
    "kipfilet-vleeswaren": "sliced chicken deli",
    "runderlever": "beef liver raw",
    "kippenlever": "chicken liver",
    "varkenslever": "pork liver",
    "leverpastei": "liver pate",
    "hart": "beef heart",
    "nier": "beef kidney",
    "tong": "beef tongue",
    "pens": "tripe",
    "zalm-gekweekt": "salmon fillet",
    "makreel": "mackerel fish",
    "haring": "herring fish",
    "sardines-blik": "canned sardines",
    "ansjovis": "anchovies",
    "sprot": "sprat fish",
    "forel": "trout fillet",
    "tonijn-vers": "tuna steak",
    "kabeljauw": "cod fillet",
    "koolvis": "pollock fillet",
    "schelvis": "haddock fillet",
    "schol": "plaice fish",
    "zeebaars": "sea bass",
    "dorade": "sea bream",
    "paling": "eel fish",
    "pangasius": "pangasius fillet",
    "vissticks": "fish sticks",
    "garnalen": "shrimp",
    "mosselen": "mussels",
    "oesters": "oysters",
    "krab": "crab",
    "kreeft": "lobster",
    "inktvis": "squid calamari",
    "octopus": "octopus",
    "ei-gekookt": "boiled eggs",
    "roerei": "scrambled eggs",
    "omelet": "omelette",
    "eiwit": "egg whites",
    "eidooier": "egg yolks",
    "verrijkte-eieren": "brown eggs",
    "melk-vol": "glass of milk",
    "karnemelk": "buttermilk",
    "yoghurt-vol": "bowl of yogurt",
    "griekse-yoghurt": "greek yogurt",
    "skyr": "skyr yogurt",
    "magere-kwark": "quark bowl",
    "kefir": "kefir drink",
    "huttenkase": "cottage cheese",
    "creme-fraiche": "creme fraiche",
    "room": "heavy cream",
    "slagroom": "whipped cream",
    "boter": "butter",
    "drinkyoghurt": "drinking yogurt",
    "jonge-kaas": "young gouda cheese",
    "belegen-kaas": "aged gouda cheese",
    "oude-kaas": "old gouda cheese",
    "magere-kaas": "low fat cheese slices",
    "mozzarella": "mozzarella",
    "feta": "feta cheese",
    "geitenkaas": "goat cheese",
    "schapenkaas": "sheep cheese",
    "parmezaan": "parmesan cheese",
    "blauwe-kaas": "blue cheese",
    "roomkaas": "cream cheese",
    "smeerkaas": "cheese spread",
    "sojadrink-verrijkt": "soy milk glass",
    "havermelk": "oat milk glass",
    "amandeldrink": "almond milk glass",
    "kokosdrink": "coconut milk drink",
    "rijstdrink": "rice milk glass",
    "plantaardige-drank-verrijkt": "plant milk glass",
    "sojayoghurt": "soy yogurt",
    "plantaardige-yoghurt": "plant based yogurt",
    "tofu": "tofu block",
    "tempe": "tempeh",
    "seitan": "seitan",
    "vegan-gehakt": "plant based mince",
    "vegan-burger": "veggie burger",
    "vegan-worst": "vegetarian sausage",
    "vleesvervanger-stukjes": "plant based chunks",
    "olijfolie-ev": "olive oil bottle",
    "koolzaadolie": "rapeseed oil",
    "zonnebloemolie": "sunflower oil",
    "avocado-olie": "avocado oil",
    "lijnzaadolie": "flaxseed oil",
    "sesamolie": "sesame oil",
    "kokosolie": "coconut oil",
    "algenolie": "algae oil",
    "halvarine": "margarine spread",
    "margarine": "margarine",
    "bakboter": "cooking butter",
    "pindakaas": "peanut butter",
    "amandelpasta": "almond butter",
    "tahin": "tahini",
    "hummus": "hummus",
    "mayonaise": "mayonnaise",
    "ketchup": "ketchup",
    "mosterd": "mustard",
    "pesto": "pesto",
    "tomatensaus": "tomato pasta sauce",
    "sojasaus": "soy sauce",
    "teriyakisaus": "teriyaki sauce",
    "chilisaus": "chili sauce",
    "sambal": "sambal chili paste",
    "currysaus": "curry sauce",
    "dressing": "salad dressing",
    "appelstroop": "apple syrup",
    "muesli": "muesli",
    "granola": "granola",
    "cornflakes": "cornflakes",
    "ontbijtgranen-volkoren": "whole grain cereal",
    "ontbijtgranen-verrijkt": "breakfast cereal bowl",
    "ontbijtkoek": "spice cake slice",
    "jam": "fruit jam",
    "honing": "honey",
    "hagelslag": "chocolate sprinkles",
    "popcorn": "popcorn",
    "chips": "potato chips",
    "tortillachips": "tortilla chips",
    "koek": "cookie",
    "pure-chocolade": "dark chocolate",
    "melkchocolade": "milk chocolate",
    "snoep": "candy",
    "ijs": "ice cream scoop",
    "proteinereep": "protein bar",
    "mueslireep": "granola bar",
    "gebak": "slice of cake",
    "stroopwafel": "stroopwafel",
    "groentesoep": "vegetable soup",
    "tomatensoep": "tomato soup",
    "linzensoep": "lentil soup",
    "erwtensoep": "pea soup",
    "kippensoep": "chicken soup",
    "pompoensoep": "pumpkin soup",
    "champignonsoep": "mushroom soup",
    "bouillon": "broth in a bowl",
    "pizza": "pizza",
    "lasagne": "lasagna",
    "nasi": "nasi goreng",
    "bami": "bami goreng noodles",
    "curry-maaltijd": "curry with rice",
    "stamppot": "mashed potato kale stew",
    "maaltijdsalade": "meal salad bowl",
    "pokebowl": "poke bowl",
    "burrito": "burrito",
    "wrap-gevuld": "filled wrap",
    "quiche": "quiche",
    "friet": "french fries",
    "aardappel-gekookt": "boiled potatoes",
    "zoete-aardappel-gekookt": "cooked sweet potato",
    "water": "glass of water",
    "bruiswater": "sparkling water glass",
    "koffie": "cup of coffee",
    "thee": "cup of tea",
    "groene-thee": "green tea",
    "sinaasappelsap": "orange juice",
    "appelsap": "apple juice",
    "groentesap": "vegetable juice",
    "frisdrank": "soda glass",
    "frisdrank-light": "diet soda can",
    "chocolademelk": "chocolate milk",
    "sportdrank": "sports drink",
    "bier": "glass of beer",
    "wijn": "glass of wine",
    "eiwitshake": "protein shake",
}

def load_catalog() -> list[tuple[str, str]]:
    src = CATALOG.read_text(encoding="utf-8")
    return re.findall(r'f\("([^"]+)",\s*"([^"]+)"', src)


def photo_owners(entries: list[tuple[str, str]]) -> list[tuple[str, str]]:
    seen: set[str] = set()
    owners: list[tuple[str, str]] = []
    labels = {key: label for key, label in entries}
    for key, _label in entries:
        owner = SHARED_OWNER.get(key, key)
        if owner in seen:
            continue
        seen.add(owner)
        owners.append((owner, labels[owner]))
    return owners


def search(api_key: str, query: str) -> list[dict]:
    params = urllib.parse.urlencode(
        {"query": query, "per_page": 3, "orientation": "square"}
    )
    req = urllib.request.Request(
        f"{SEARCH_URL}?{params}",
        headers={"Authorization": api_key, "User-Agent": "PerfectSupplement/1.0"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        payload = json.loads(resp.read().decode("utf-8"))
    photos = payload.get("photos") or []
    rows = []
    for photo in photos[:3]:
        src = photo.get("src") or {}
        rows.append(
            {
                "id": photo.get("id"),
                "photographer": photo.get("photographer") or "",
                "thumbnail": src.get("medium") or "",
                "page": photo.get("url") or "",
            }
        )
    return rows


def main() -> int:
    api_key = os.environ.get("PEXELS_API_KEY", "").strip()
    if not api_key:
        print(
            "PEXELS_API_KEY is missing. Get a free key at https://www.pexels.com/api/ "
            "and export it before running this script. Nothing was written.",
            file=sys.stderr,
        )
        return 1

    entries = load_catalog()
    if not entries:
        print(f"no catalog entries found in {CATALOG}", file=sys.stderr)
        return 1

    owners = photo_owners(entries)
    missing_query = [key for key, _label in owners if key not in QUERIES]
    if missing_query:
        print(
            "No English query for these photo owners — add them to QUERIES:\n  "
            + "\n  ".join(missing_query),
            file=sys.stderr,
        )
        return 1

    only = set(sys.argv[1:])
    jobs = [(key, label) for key, label in owners if not only or key in only]

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    lines = ["key\tlabelNl\tquery\tphoto_id\tphotographer\tthumbnail_url\tpage_url"]
    empty = 0
    for index, (key, label) in enumerate(jobs):
        query = QUERIES[key]
        try:
            photos = search(api_key, query)
        except urllib.error.HTTPError as err:
            print(f"FAIL {key}: HTTP {err.code} {err.reason}", file=sys.stderr)
            return 1
        except urllib.error.URLError as err:
            print(f"FAIL {key}: {err}", file=sys.stderr)
            return 1
        if not photos:
            empty += 1
            print(f"NONE {key:42s}  q={query!r}")
        else:
            print(f"OK   {key:42s}  {len(photos)}  q={query!r}")
            for photo in photos:
                lines.append(
                    "\t".join(
                        [
                            key,
                            label.replace("\t", " "),
                            query.replace("\t", " "),
                            str(photo["id"]),
                            str(photo["photographer"]).replace("\t", " "),
                            str(photo["thumbnail"]),
                            str(photo["page"]),
                        ]
                    )
                )
        if index + 1 < len(jobs):
            time.sleep(0.5)

    OUT_FILE.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"\nwrote {OUT_FILE} ({len(lines) - 1} candidate rows, {len(jobs)} owners)")
    print(f"owners with 0 candidates: {empty}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
