# Besluit — webgidsen verhuizen naar `<thema>-en-voeding`

**Datum:** 7 oktober 2026
**Status:** uitgevoerd op feature-branch, wacht op review en deploy door Dennis
**Aanleiding:** Dennis: "Doe slugs veranderen, SEO sterk voor voeding" — elke gids benoemt leefstijlfactoren en zoomt in op voeding, met als enige CTA de check "Wat mis je?" (`/intake`).

## Wat verandert

| Oud | Nieuw (301) |
|---|---|
| `/slaap-verbeteren-na-40` | `/slaap-en-voeding` |
| `/stress-verminderen-na-40` | `/stress-en-voeding` |
| `/energie-na-40` | `/energie-en-voeding` |
| `/herstel-verbeteren-na-40` | `/herstel-en-voeding` |
| `/beweging-na-40` | `/beweging-en-voeding` |
| `/testosteron-na-40` | `/testosteron-en-voeding` |
| `/overgang` | `/overgang-en-voeding` |

`/voeding-na-40` blijft zoals het is. Titel, description, OG, JSON-LD headline en `<h1>` zijn per pagina op voeding geschreven. Alle interne links, sitemap en content-graph wijzen naar de nieuwe URL's; de oude URL's zijn permanente redirects in `next.config.ts` (bestaande redirects `/thema/herstel` en `/stress-verminderen-man` wijzen direct naar de nieuwe URL, geen ketting).

## Afwijking van een eerder besluit

`ARCHITECTUUR_ECOSYSTEEM_CONTENTGRAAF_2026-09.md` (§ fase 9) kende "geen URL-wijzigingen behalve drie gemotiveerde 301's", en 301's pas bij GSC ≈ 0 impressies. Dit besluit wijkt daar bewust van af op expliciete vraag van Dennis. Risico: de pagina's verliezen tijdelijk ranking op "slaap verbeteren"-achtige zoektermen; de 301's dragen het grootste deel van de waarde over.

## Nog te doen na deploy

- Sitemap opnieuw indienen in Search Console; oude URL's 90 dagen monitoren op impressies.
- Naam "Voedingcheck" blijft afgewezen: de check heet "Wat mis je?" (`CORRECTIE_VOEDINGCHECK_NAAMGEVING_2026-09.md`).
- Niet aangepast: externe backlinks, nurture-mails die al verstuurd zijn (die lopen via de 301).
