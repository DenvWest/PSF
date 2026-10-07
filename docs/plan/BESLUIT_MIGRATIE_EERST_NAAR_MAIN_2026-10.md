# Besluit: migratie-eerst naar main

- **Datum:** 7 oktober 2026
- **Status:** besloten (verzoek Dennis)

## Aanleiding

Een nieuwe migratie stond met de code op de feature-branch (`feat/eetpatroon`). Dennis kijkt in de hoofdmap (`~/psf`, altijd `main`) in `supabase/migrations/OPENSTAAND.md` en zag de migratie daardoor niet, en kon hem dus ook niet draaien. Gevolg: de PR wachtte op een migratie die voor Dennis onzichtbaar was.

## Besluit

- Een **additieve** migratie (nieuwe tabel, kolom of index) gaat meteen als **eigen kleine PR naar `main`**: alleen het `.sql`-bestand en het blok in `OPENSTAAND.md`, geen code. Bij groene CI merget Claude die direct en werkt de hoofdmap bij (`git pull --ff-only`), zodat de migratie in `~/psf` zichtbaar is.
- De **code** die het schema nodig heeft blijft op de feature-branch, zoals voorheen ("Blokkeert deploy: ja"), tot Dennis de migratie heeft gedraaid.
- Een migratie die iets **weghaalt of hernoemt** gaat niet vooruit naar `main`: die zou de live code breken. Die gaat met de code mee, zoals voorheen.

## Waarom dit veilig is

Een additieve migratie op `main` zonder code die hem gebruikt, verandert niets aan wat er live draait: het bestand wordt niet automatisch uitgevoerd (alleen via de SQL Editor), en `deploy.sh` raakt het schema niet.

## Afgewezen

- **Een melding bij sessiestart** die openstaande migraties op alle branches opsomt: helpt Claude, niet Dennis, die in de editor in `OPENSTAAND.md` kijkt.
