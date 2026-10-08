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
    "sla-kropsla": 11287049,  # lettuce
    "rucola": 5713736,  # fresh arugula leaves
    "veldsla": 11287049,  # lambs lettuce
    "broccoli-gekookt": 105588,  # cooked broccoli florets
    "bloemkool-gekookt": 11663123,  # cauliflower slice
    "spruitjes-gekookt": 4929721,  # cooked brussels sprouts
    "zuurkool": 14269237,  # sausages with sauerkraut
    "paksoi-gekookt": 38078487,  # cooked bok choy
    "wortel-rauw": 38802742,  # fresh carrots
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
    "erwten-diepvries": 39624859,  # green peas in a pan
    "sperziebonen-gekookt": 3004798,  # green beans
    "champignons-gebakken": 9144702,  # sauteed mushrooms
    "zeewier-nori": 7243416,  # nori seaweed sheets
    "avocado": 31833143,  # fresh avocado
    "appel": 14456110,  # fresh apples
    "peer": 8086137,  # fresh pears
    "banaan": 16829201,  # bananas
    "sinaasappel": 37543950,  # oranges
    "mandarijn": 14040574,  # tangerines
    "grapefruit": 17840033,  # grapefruit
    "citroen": 14016160,  # lemons
    "limoen": 19600450,  # limes flat lay
    "kiwi": 6123032,  # kiwi fruit
    "mango": 38802739,  # mango cubes
    "ananas": 15554361,  # fresh pineapple
    "aardbeien": 1788912,  # strawberries
    "blauwe-bessen": 12755895,  # blueberries
    "frambozen": 8626406,  # raspberries
    "bramen": 28882152,  # blackberries
    "kersen": 2747421,  # cherries
    "perzik": 31956599,  # peaches
    "nectarine": 31956599,  # nectarines
    "pruim": 12889634,  # fresh plums
    "meloen": 18281447,  # cantaloupe melon
    "granaatappel": 12027268,  # pomegranate
    "vijg-vers": 15662976,  # fresh figs
    "dadels": 18435590,  # dried dates
    "rozijnen": 7368078,  # raisins
    "fruit-diepvries": 32654673,  # frozen mixed berries
    "havermout": 13950819,  # rolled oats
    "rijst-wit-gekookt": 28674713,  # cooked white rice in pot
    "zilvervliesrijst": 343871,  # cooked brown rice
    "basmatirijst-gekookt": 28674713,  # cooked basmati rice
    "wilde-rijst-gekookt": 14164520,  # cooked wild rice
    "quinoa": 9893191,  # cooked quinoa
    "bulgur-gekookt": 14164523,  # cooked bulgur
    "couscous-gekookt": 19824910,  # cooked couscous
    "boekweit-gekookt": 14430641,  # buckwheat grains
    "gierst-gekookt": 20434734,  # cooked millet
    "teff": 14430641,  # teff grain
    "gerst-gekookt": 38391818,  # cooked barley
    "spelt-gekookt": 31744871,  # cooked spelt grain
    "polenta": 7627441,  # polenta
    "volkorenbrood": 31744871,  # whole grain bread slices
    "witbrood": 5567093,  # white bread loaf
    "meergranenbrood": 30804068,  # rustic dark breads
    "roggebrood": 30452364,  # rye bread
    "zuurdesembrood": 5634637,  # sourdough loaf
    "speltbrood": 4444068,  # loaf of bread on a board
    "stokbrood": 5567093,  # loaf of country bread on a board
    "pita": 17991832,  # stack of pita breads
    "naan": 32986478,  # round flatbread
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
    "rijstnoedels-gekookt": 13729069,  # cooked rice noodles
    "eiernoedels-gekookt": 16620746,  # cooked egg noodles
    "ramen-noedels": 13085835,  # ramen noodles bowl
    "sobanoedels-gekookt": 4541393,  # soba noodles
    "kikkererwten-gekookt": 34949285,  # cooked chickpeas
    "linzen-gekookt": 30203314,  # cooked lentils
    "kidneybonen-gekookt": 8992843,  # kidney beans with rice
    "zwarte-bonen-gekookt": 32612769,  # cooked black beans
    "sojabonen-gekookt": 38802674,  # edamame soybeans
    "edamame": 5514818,  # edamame
    "amandelen": 11590667,  # raw almonds
    "walnoten": 37309469,  # walnuts
    "cashewnoten": 37180553,  # mixed nuts in a bowl
    "hazelnoten": 20556454,  # hazelnuts
    "pecannoten": 34623625,  # pecan nuts
    "pistachenoten": 6664421,  # pistachios
    "macadamia": 20556452,  # macadamia nuts
    "notenmix": 18435586,  # mixed nuts unsalted
    "chiazaad": 7439731,  # chia seeds
    "lijnzaad": 29956305,  # ground flaxseed
    "hennepzaad": 35156984,  # hulled hemp seeds
    "sesamzaad": 20598694,  # sesame seeds
    "pompoenzaden": 34623198,  # pumpkin seeds
    "zonnebloempitten": 19282822,  # sunflower seeds
    "kipfilet": 7368041,  # chicken breast
    "kipdij": 32986476,  # chicken thighs
    "kippenvleugel": 5946433,  # chicken wings
    "kalkoenfilet": 9219086,  # turkey breast
    "biefstuk": 36850059,  # beef steak
    "rundergehakt": 4929692,  # ground beef
    "half-om-half-gehakt": 1314041,  # ground meat
    "varkenshaas": 19362399,  # pork medallions with rice
    "varkenskarbonade": 36850022,  # grilled pork chop
    "schnitzel": 23106705,  # schnitzel
    "kalfsvlees": 31064588,  # veal
    "lamsvlees": 32986473,  # lamb meat
    "hamburger": 20722048,  # beef hamburger patty
    "worst": 772515,  # sausage with potato salad
    "ham": 5634630,  # sliced ham
    "rosbief": 36829374,  # roast beef slices
    "salami": 8743948,  # salami slices
    "kipfilet-vleeswaren": 9219093,  # sliced chicken deli
    "leverpastei": 4586810,  # liver pate
    "pens": 8321980,  # tripe
    "zalm-gekweekt": 7627414,  # salmon fillet
    "makreel": 19239122,  # grilled whole fish
    "haring": 39525500,  # fresh fish in a colander
    "sardines-blik": 20141098,  # tin of sardines
    "forel": 5326155,  # trout fillet
    "tonijn-vers": 5713732,  # tuna steak
    "kabeljauw": 8696562,  # cod fillet
    "koolvis": 28899084,  # pollock fillet
    "schol": 37703370,  # plaice fish
    "zeebaars": 6046747,  # grilled fish fillet
    "dorade": 19239122,  # sea bream
    "vissticks": 343873,  # fish sticks
    "garnalen": 7636375,  # shrimp
    "mosselen": 5713733,  # mussels
    "oesters": 37935968,  # oysters
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
    "skyr": 10165775,  # bowl of white yoghurt
    "magere-kwark": 10165775,  # quark bowl
    "kefir": 5967316,  # kefir drink
    "huttenkase": 7368035,  # cottage cheese
    "room": 37935979,  # heavy cream
    "slagroom": 8250849,  # whipped cream
    "boter": 32986461,  # butter
    "drinkyoghurt": 7190366,  # fruit yoghurt drinks in jars
    "belegen-kaas": 19239123,  # cheese board with gouda cubes
    "magere-kaas": 6493113,  # low fat cheese slices
    "mozzarella": 29699537,  # mozzarella
    "feta": 34406230,  # cubed white cheese
    "geitenkaas": 7368022,  # white cheese rounds on a board
    "schapenkaas": 7368035,  # white cheese and cottage cheese
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
    "sojayoghurt": 29684991,  # bowl of yoghurt
    "plantaardige-yoghurt": 16077079,  # coconut yoghurt in a coconut
    "tempe": 37052502,  # tempeh
    "seitan": 5056823,  # seitan
    "vegan-burger": 20741663,  # veggie burger
    "olijfolie-ev": 9070120,  # olive oil bottle
    "avocado-olie": 31833143,  # avocado oil
    "lijnzaadolie": 13787562,  # flaxseed oil
    "sesamolie": 7636382,  # sesame oil
    "algenolie": 35414228,  # algae oil
    "halvarine": 4775247,  # margarine spread
    "margarine": 13970067,  # margarine
    "bakboter": 7111399,  # cooking butter
    "pindakaas": 5567076,  # peanut butter
    "amandelpasta": 57042,  # almond butter
    "hummus": 14774984,  # hummus
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
    "muesli": 31596348,  # muesli bowl with fruit
    "granola": 32214637,  # granola with yoghurt and cherries
    "cornflakes": 37180554,  # cereal in a bowl
    "ontbijtgranen-volkoren": 6948044,  # cereal with milk
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
    "gebak": 28251609,  # slice of cake
    "stroopwafel": 9592625,  # stroopwafel
    "tomatensoep": 4062274,  # tomato soup
    "linzensoep": 28241683,  # lentil soup
    "erwtensoep": 8696758,  # pea soup
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
    "thee": 33489605,  # cup of tea
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
