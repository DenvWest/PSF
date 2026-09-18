#!/usr/bin/env python3
"""Download curated Pexels photos for food-catalog entries.

Square product thumbnails (1200x1200), one file per photo-owner key.

Fill IMAGES only after reviewing scripts/out/food-image-candidates.tsv —
never copy the search script's top-1 blindly. Each chosen id gets a short
comment describing what is on the photo (same habit as kennisbank covers).

Does not share ids or the TSV with download-kennisbank-pexels.py.
"""
from __future__ import annotations

import sys
import time
import urllib.error
import urllib.request
from io import BytesIO
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public/images/voedingsmiddelen"
TSV_PATH = ROOT / "scripts/food-image-ids.tsv"
UA = "PerfectSupplement/1.0 editorial stock fetch (https://perfectsupplement.nl)"

# Catalog photo-owner key -> Pexels id.
# Copy pairs here from food-image-candidates.tsv after a human picked a row.
IMAGES: dict[str, int] = {
    "spinazie-gekookt": 6083893,  # cooked spinach
    "boerenkool-gekookt": 1346342,  # cooked kale
    "snijbiet-gekookt": 7368017,  # cooked swiss chard
    "andijvie-gekookt": 14269237,  # cooked endive
    "sla-kropsla": 24532331,  # iceberg lettuce head
    "rucola": 5713736,  # fresh arugula leaves
    "veldsla": 11287049,  # lambs lettuce
    "witlof-gekookt": 14269237,  # cooked belgian endive
    "broccoli-gekookt": 105588,  # cooked broccoli florets
    "bloemkool-gekookt": 24532331,  # cooked cauliflower
    "spruitjes-gekookt": 4929721,  # cooked brussels sprouts
    "rodekool-gekookt": 14269237,  # cooked red cabbage
    "witte-kool-gekookt": 14269237,  # cooked white cabbage
    "zuurkool": 14269237,  # sauerkraut
    "paksoi-gekookt": 38078487,  # cooked bok choy
    "wortel-rauw": 38802742,  # fresh carrots
    "pastinaak-gekookt": 38802742,  # cooked parsnip
    "biet-gekookt": 11663127,  # cooked beetroot
    "knolselderij-gekookt": 14163204,  # cooked celeriac
    "radijs": 33899546,  # fresh radishes
    "koolraap-gekookt": 9219084,  # cooked rutabaga
    "tomaat": 33254177,  # fresh tomatoes
    "paprika-rauw": 39145600,  # fresh bell peppers
    "komkommer": 3568039,  # fresh cucumber
    "courgette-gebakken": 12254248,  # sauteed zucchini
    "aubergine-gebakken": 8696543,  # cooked eggplant
    "pompoen-gekookt": 7368079,  # cooked pumpkin
    "ui-rauw": 10159434,  # yellow onions
    "prei-gekookt": 4965038,  # cooked leeks
    "knoflook": 6638901,  # garlic bulbs
    "asperges-gekookt": 5182122,  # cooked asparagus
    "mais-kolf": 18142958,  # corn on the cob
    "erwten-diepvries": 3807050,  # green peas bowl
    "sperziebonen-gekookt": 17486836,  # cooked green beans
    "champignons-gebakken": 9144702,  # sauteed mushrooms
    "paddenstoelen-uv": 9144702,  # white button mushrooms
    "zeewier-nori": 7243416,  # nori seaweed sheets
    "avocado": 31833143,  # fresh avocado
    "appel": 14456110,  # fresh apples
    "peer": 8086137,  # fresh pears
    "banaan": 16829201,  # bananas
    "sinaasappel": 37543950,  # oranges
    "mandarijn": 14040574,  # tangerines
    "grapefruit": 17840033,  # grapefruit
    "citroen": 14016160,  # lemons
    "limoen": 38853682,  # limes
    "kiwi": 6123032,  # kiwi fruit
    "mango": 38802739,  # fresh mango
    "ananas": 15554361,  # fresh pineapple
    "druiven": 5500454,  # grapes
    "aardbeien": 1788912,  # strawberries
    "blauwe-bessen": 12755895,  # blueberries
    "frambozen": 8626406,  # raspberries
    "bramen": 28882152,  # blackberries
    "kersen": 2747421,  # cherries
    "perzik": 31956599,  # peaches
    "nectarine": 31956599,  # nectarines
    "pruim": 12889634,  # fresh plums
    "abrikoos-vers": 38390562,  # fresh apricots
    "meloen": 18281447,  # cantaloupe melon
    "granaatappel": 12027268,  # pomegranate
    "vijg-vers": 15662976,  # fresh figs
    "dadels": 18435590,  # dried dates
    "rozijnen": 7368078,  # raisins
    "fruit-diepvries": 32654673,  # frozen mixed berries
    "appelmoes": 33489594,  # applesauce bowl
    "havermout": 13950819,  # rolled oats
    "haverzemelen": 13950819,  # oat bran
    "rijst-wit-gekookt": 8992843,  # cooked white rice
    "zilvervliesrijst": 343871,  # cooked brown rice
    "basmatirijst-gekookt": 28674713,  # cooked basmati rice
    "wilde-rijst-gekookt": 14164520,  # cooked wild rice
    "quinoa": 9893191,  # cooked quinoa
    "bulgur-gekookt": 14164523,  # cooked bulgur
    "couscous-gekookt": 19824910,  # cooked couscous
    "boekweit-gekookt": 101669,  # cooked buckwheat groats
    "gierst-gekookt": 20434734,  # cooked millet
    "amarant-gekookt": 101669,  # cooked amaranth grain
    "teff": 14430641,  # teff grain
    "gerst-gekookt": 38391818,  # cooked barley
    "spelt-gekookt": 31744871,  # cooked spelt grain
    "polenta": 7627441,  # polenta
    "volkorenbrood": 4444068,  # whole wheat bread loaf
    "witbrood": 5567093,  # white bread loaf
    "meergranenbrood": 2680601,  # multigrain bread
    "roggebrood": 30452364,  # rye bread
    "zuurdesembrood": 4444068,  # sourdough bread
    "speltbrood": 2680601,  # spelt bread
    "stokbrood": 19793984,  # baguette
    "pita": 15820586,  # pita bread
    "naan": 15820586,  # naan bread
    "tortilla-wrap": 2955819,  # flour tortilla
    "bagel": 9691647,  # bagel
    "croissant": 13439698,  # croissant
    "crackers-volkoren": 36040665,  # whole wheat crackers
    "knackebrod": 36040665,  # crispbread
    "beschuit": 30660275,  # rusk toast
    "rijstwafel": 18283713,  # rice cakes
    "maiswafel": 38802738,  # corn cakes
    "toast": 30660275,  # toasted bread
    "volkoren-pasta-gekookt": 38802734,  # cooked whole wheat pasta
    "pasta-wit-gekookt": 15597774,  # cooked spaghetti
    "linzenpasta-droog": 3807028,  # red lentil pasta
    "kikkererwtenpasta-droog": 38802734,  # chickpea pasta
    "rijstnoedels-gekookt": 13729069,  # cooked rice noodles
    "eiernoedels-gekookt": 16620746,  # cooked egg noodles
    "ramen-noedels": 13085835,  # ramen noodles bowl
    "sobanoedels-gekookt": 4541393,  # soba noodles
    "kikkererwten-gekookt": 34949285,  # cooked chickpeas
    "linzen-gekookt": 30203314,  # cooked lentils
    "kidneybonen-gekookt": 8992843,  # cooked kidney beans
    "zwarte-bonen-gekookt": 32612769,  # cooked black beans
    "witte-bonen-gekookt": 8992843,  # cooked white beans
    "bruine-bonen-gekookt": 8992843,  # cooked brown beans
    "sojabonen-gekookt": 101669,  # cooked soybeans
    "edamame": 5514818,  # edamame
    "spliterwten-gekookt": 17486836,  # cooked split peas
    "kapucijners": 6541767,  # marrowfat peas
    "tuinbonen-gekookt": 8992843,  # cooked fava beans
    "amandelen": 11590667,  # raw almonds
    "walnoten": 37309469,  # walnuts
    "cashewnoten": 5869852,  # cashew nuts
    "hazelnoten": 20556454,  # hazelnuts
    "pecannoten": 34623625,  # pecan nuts
    "pistachenoten": 6664421,  # pistachios
    "paranoten": 5869852,  # brazil nuts
    "macadamia": 20556452,  # macadamia nuts
    "pinda": 39289748,  # peanuts
    "pijnboompitten": 15430081,  # pine nuts
    "notenmix": 18435586,  # mixed nuts unsalted
    "chiazaad": 7439731,  # chia seeds
    "lijnzaad": 29956305,  # ground flaxseed
    "hennepzaad": 35156984,  # hulled hemp seeds
    "sesamzaad": 20598694,  # sesame seeds
    "pompoenzaden": 34623198,  # pumpkin seeds
    "zonnebloempitten": 19282822,  # sunflower seeds
    "maanzaad": 17209436,  # poppy seeds
    "kipfilet": 7368041,  # chicken breast
    "kipdij": 32986476,  # chicken thighs
    "kippenvleugel": 5946433,  # chicken wings
    "kalkoenfilet": 9219086,  # turkey breast
    "rundvlees-mager": 36850059,  # lean beef steak
    "biefstuk": 36850059,  # beef steak
    "rundergehakt": 4929692,  # ground beef
    "half-om-half-gehakt": 1314041,  # ground meat
    "varkenshaas": 19362399,  # pork tenderloin
    "varkenskarbonade": 19362399,  # pork chop
    "schnitzel": 23106705,  # schnitzel
    "kalfsvlees": 31064588,  # veal
    "lamsvlees": 32986473,  # lamb meat
    "eend": 18651635,  # duck breast
    "konijn": 7408291,  # rabbit meat
    "wild": 5643415,  # venison steak
    "hamburger": 20722048,  # beef hamburger patty
    "worst": 37264133,  # sausage
    "bacon": 5041477,  # bacon strips
    "ham": 5634630,  # sliced ham
    "rosbief": 36829374,  # roast beef slices
    "salami": 8743948,  # salami slices
    "kipfilet-vleeswaren": 9219093,  # sliced chicken deli
    "runderlever": 5643415,  # beef liver raw
    "kippenlever": 38278287,  # chicken liver
    "varkenslever": 19362399,  # pork liver
    "leverpastei": 4586810,  # liver pate
    "hart": 5643415,  # beef heart
    "nier": 8992843,  # beef kidney
    "tong": 36829374,  # beef tongue
    "pens": 8321980,  # tripe
    "zalm-gekweekt": 7627414,  # salmon fillet
    "makreel": 37703358,  # mackerel fish
    "haring": 20141098,  # herring fish
    "sardines-blik": 20141098,  # canned sardines
    "ansjovis": 11912788,  # anchovies
    "sprot": 20141098,  # sprat fish
    "forel": 5326155,  # trout fillet
    "tonijn-vers": 5713732,  # tuna steak
    "kabeljauw": 8696562,  # cod fillet
    "koolvis": 28899084,  # pollock fillet
    "schelvis": 7627414,  # haddock fillet
    "schol": 37703370,  # plaice fish
    "zeebaars": 7394229,  # sea bass
    "dorade": 19239122,  # sea bream
    "paling": 37888892,  # eel fish
    "pangasius": 28899084,  # pangasius fillet
    "vissticks": 343873,  # fish sticks
    "garnalen": 7636375,  # shrimp
    "mosselen": 5713733,  # mussels
    "oesters": 37935968,  # oysters
    "krab": 18113137,  # crab
    "kreeft": 37795033,  # lobster
    "inktvis": 15801007,  # squid calamari
    "octopus": 37215012,  # octopus
    "ei-gekookt": 14827255,  # boiled eggs
    "roerei": 26576013,  # scrambled eggs
    "omelet": 1346381,  # omelette
    "eiwit": 32986480,  # egg whites
    "eidooier": 4394258,  # egg yolks
    "verrijkte-eieren": 7094745,  # brown eggs
    "melk-vol": 37304947,  # glass of milk
    "karnemelk": 18635174,  # buttermilk
    "yoghurt-vol": 32986486,  # bowl of yogurt
    "griekse-yoghurt": 32986486,  # greek yogurt
    "skyr": 20854117,  # skyr yogurt
    "magere-kwark": 10165775,  # quark bowl
    "kefir": 5967316,  # kefir drink
    "huttenkase": 7368035,  # cottage cheese
    "creme-fraiche": 7190369,  # creme fraiche
    "room": 37935979,  # heavy cream
    "slagroom": 8250849,  # whipped cream
    "boter": 32986461,  # butter
    "drinkyoghurt": 20854117,  # drinking yogurt
    "jonge-kaas": 8743918,  # young gouda cheese
    "belegen-kaas": 8743918,  # aged gouda cheese
    "oude-kaas": 8743918,  # old gouda cheese
    "magere-kaas": 6493113,  # low fat cheese slices
    "mozzarella": 29699537,  # mozzarella
    "feta": 29285460,  # feta cheese
    "geitenkaas": 34565448,  # goat cheese
    "schapenkaas": 35910438,  # sheep cheese
    "parmezaan": 6428247,  # parmesan cheese
    "blauwe-kaas": 19239123,  # blue cheese
    "roomkaas": 979310,  # cream cheese
    "smeerkaas": 24206926,  # cheese spread
    "sojadrink-verrijkt": 36183642,  # soy milk glass
    "havermelk": 21802643,  # oat milk glass
    "amandeldrink": 7573152,  # almond milk glass
    "kokosdrink": 16077079,  # coconut milk drink
    "rijstdrink": 34477395,  # rice milk glass
    "plantaardige-drank-verrijkt": 7573152,  # plant milk glass
    "sojayoghurt": 20854117,  # soy yogurt
    "plantaardige-yoghurt": 20854117,  # plant based yogurt
    "tofu": 5182122,  # tofu block
    "tempe": 37052502,  # tempeh
    "seitan": 5056823,  # seitan
    "vegan-gehakt": 16329380,  # plant based mince
    "vegan-burger": 20741663,  # veggie burger
    "vegan-worst": 14269237,  # vegetarian sausage
    "vleesvervanger-stukjes": 38802739,  # plant based chunks
    "olijfolie-ev": 9070120,  # olive oil bottle
    "koolzaadolie": 39281916,  # rapeseed oil
    "zonnebloemolie": 29340968,  # sunflower oil
    "avocado-olie": 31833143,  # avocado oil
    "lijnzaadolie": 13787562,  # flaxseed oil
    "sesamolie": 7636382,  # sesame oil
    "kokosolie": 9931541,  # coconut oil
    "algenolie": 35414228,  # algae oil
    "halvarine": 4775247,  # margarine spread
    "margarine": 13970067,  # margarine
    "bakboter": 7111399,  # cooking butter
    "pindakaas": 5567076,  # peanut butter
    "amandelpasta": 57042,  # almond butter
    "tahin": 14774984,  # tahini
    "hummus": 14774984,  # hummus
    "mayonaise": 15801054,  # mayonnaise
    "ketchup": 30682735,  # ketchup
    "mosterd": 15934124,  # mustard
    "pesto": 39236392,  # pesto
    "tomatensaus": 29039081,  # tomato pasta sauce
    "sojasaus": 5616129,  # soy sauce
    "teriyakisaus": 37279872,  # teriyaki sauce
    "chilisaus": 4985531,  # chili sauce
    "sambal": 37107035,  # sambal chili paste
    "currysaus": 32986463,  # curry sauce
    "dressing": 8738025,  # salad dressing
    "appelstroop": 16144684,  # apple syrup
    "muesli": 31596348,  # muesli
    "granola": 31596348,  # granola
    "cornflakes": 6948044,  # cornflakes
    "ontbijtgranen-volkoren": 6948044,  # whole grain cereal
    "ontbijtgranen-verrijkt": 6948044,  # breakfast cereal bowl
    "ontbijtkoek": 9329433,  # spice cake slice
    "jam": 26341194,  # fruit jam
    "honing": 38773865,  # honey
    "hagelslag": 14122680,  # chocolate sprinkles
    "popcorn": 5331317,  # popcorn
    "chips": 6485538,  # potato chips
    "tortillachips": 10497790,  # tortilla chips
    "koek": 34979324,  # cookie
    "pure-chocolade": 8498186,  # dark chocolate
    "melkchocolade": 37857736,  # milk chocolate
    "snoep": 11659346,  # candy
    "ijs": 17558647,  # ice cream scoop
    "proteinereep": 8482368,  # protein bar
    "mueslireep": 31596348,  # granola bar
    "gebak": 28251609,  # slice of cake
    "stroopwafel": 9592625,  # stroopwafel
    "groentesoep": 8580433,  # vegetable soup
    "tomatensoep": 4062274,  # tomato soup
    "linzensoep": 28241683,  # lentil soup
    "erwtensoep": 8696758,  # pea soup
    "kippensoep": 8696758,  # chicken soup
    "pompoensoep": 8743923,  # pumpkin soup
    "champignonsoep": 8580433,  # mushroom soup
    "bouillon": 15735751,  # broth in a bowl
    "pizza": 8967721,  # pizza
    "lasagne": 10839494,  # lasagna
    "nasi": 37106714,  # nasi goreng
    "bami": 15820588,  # bami goreng noodles
    "curry-maaltijd": 27287005,  # curry with rice
    "stamppot": 26245461,  # mashed potato kale stew
    "maaltijdsalade": 6895775,  # meal salad bowl
    "pokebowl": 31815433,  # poke bowl
    "burrito": 9258714,  # burrito
    "wrap-gevuld": 10361459,  # filled wrap
    "quiche": 37271785,  # quiche
    "friet": 27758755,  # french fries
    "aardappel-gekookt": 5249331,  # boiled potatoes
    "zoete-aardappel-gekookt": 9219092,  # cooked sweet potato
    "water": 9000378,  # glass of water
    "bruiswater": 14086822,  # sparkling water glass
    "koffie": 5665246,  # cup of coffee
    "thee": 34318763,  # cup of tea
    "groene-thee": 37515885,  # green tea
    "sinaasappelsap": 33434017,  # orange juice
    "appelsap": 27119207,  # apple juice
    "groentesap": 1346347,  # vegetable juice
    "frisdrank": 15823325,  # soda glass
    "frisdrank-light": 17650223,  # diet soda can
    "chocolademelk": 9838131,  # chocolate milk
    "sportdrank": 11754189,  # sports drink
    "bier": 3641322,  # glass of beer
    "wijn": 15503675,  # glass of wine
    "eiwitshake": 1346347,  # protein shake
}

# If a primary id 404s — never reuse an id already assigned.
RESERVE: list[int] = []


def pexels_url(photo_id: int) -> str:
    return (
        f"https://images.pexels.com/photos/{photo_id}/pexels-photo-{photo_id}.jpeg"
        f"?auto=compress&cs=tinysrgb&w=1600"
    )


def fetch(photo_id: int) -> bytes:
    req = urllib.request.Request(
        pexels_url(photo_id),
        headers={
            "User-Agent": UA,
            "Accept": "image/jpeg,image/*;q=0.8,*/*;q=0.5",
            "Referer": "https://www.pexels.com/",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = resp.read()
        ctype = resp.headers.get("Content-Type", "")
    if not data.startswith(b"\xff\xd8") and "jpeg" not in ctype.lower():
        raise RuntimeError(f"not jpeg for {photo_id} ({ctype}, {data[:20]!r})")
    return data


def crop_square(data: bytes, dest: Path) -> None:
    im = Image.open(BytesIO(data)).convert("RGB")
    target = 1200
    src_w, src_h = im.size
    side = min(src_w, src_h)
    left = (src_w - side) // 2
    top = (src_h - side) // 2
    im = im.crop((left, top, left + side, top + side))
    im = im.resize((target, target), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "JPEG", quality=82, optimize=True)


def take_reserve(used: set[int]) -> int:
    for photo_id in RESERVE:
        if photo_id not in used:
            used.add(photo_id)
            return photo_id
    raise RuntimeError("reserve pool exhausted")


def save_one(label: str, dest: Path, photo_id: int, used: set[int]) -> int:
    last_err: Exception | None = None
    try:
        data = fetch(photo_id)
        crop_square(data, dest)
        print(f"OK  {label:42s} pexels/{photo_id}  {dest.stat().st_size:7d}b")
        return photo_id
    except Exception as err:  # noqa: BLE001
        last_err = err
        print(f"FAIL {label} pexels/{photo_id}: {err}")
    if not RESERVE:
        raise RuntimeError(
            f"could not download {label}: {last_err} (RESERVE is empty — add fallback ids)"
        )
    for _ in range(8):
        fallback = take_reserve(used)
        try:
            data = fetch(fallback)
            crop_square(data, dest)
            print(f"OK  {label:42s} pexels/{fallback} (fallback)  {dest.stat().st_size:7d}b")
            return fallback
        except Exception as err:  # noqa: BLE001
            last_err = err
            print(f"FAIL {label} fallback pexels/{fallback}: {err}")
    raise RuntimeError(f"could not download {label}: {last_err}")


def main() -> int:
    if not IMAGES:
        print(
            "IMAGES is empty. Review scripts/out/food-image-candidates.tsv, "
            "then paste chosen key -> pexels_id pairs into IMAGES."
        )
        return 0

    used = set(IMAGES.values())
    if len(used) != len(IMAGES):
        print(f"note: {len(IMAGES) - len(used)} keys share a pexels id with another key (SHARED_OWNER-style reuse)")

    only = set(sys.argv[1:])
    jobs: list[tuple[str, Path, int]] = []
    for key, photo_id in IMAGES.items():
        if only and key not in only:
            continue
        jobs.append((key, OUT_DIR / f"{key}.jpg", photo_id))

    mapping: dict[str, int] = {}
    failed: list[str] = []
    for key, dest, photo_id in jobs:
        try:
            actual = save_one(key, dest, photo_id, used)
            mapping[key] = actual
            time.sleep(0.12)
        except Exception as err:  # noqa: BLE001
            failed.append(f"{key}: {err}")

    previous: dict[str, str] = {}
    if TSV_PATH.exists():
        for line in TSV_PATH.read_text(encoding="utf-8").splitlines()[1:]:
            if not line.strip():
                continue
            key, value = line.split("\t", 1)
            previous[key] = value
    previous.update({key: str(photo_id) for key, photo_id in mapping.items()})

    lines = ["key\tpexels_id"]
    for key in sorted(previous):
        lines.append(f"{key}\t{previous[key]}")
    TSV_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"\nwrote {TSV_PATH} ({len(previous)} ids)")
    if failed:
        print("FAILED:")
        print("\n".join(failed))
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
