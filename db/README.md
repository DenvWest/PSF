# Database migraties

Pure SQL migraties voor de PerfectSupplement productdatabase. Geen ORM — uitvoeren met `psql`.

## Uitvoeren op Hetzner VPS

### 1. Schema aanmaken

```bash
psql -U postgres -d perfectsupplement -f db/migrations/001_supplement_product_database.sql
```

### 2. Test data inladen

```bash
psql -U postgres -d perfectsupplement -f db/migrations/001_supplement_test_data.sql
```

## Tabellen

| Tabel | Beschrijving |
|-------|-------------|
| `products` | Supplement producten met merk, categorie en affiliate URL |
| `ingredienten` | Ingrediënten per product met hoeveelheid, eenheid en vorm |
| `evaluaties` | Kwaliteits- en transparantiescores per product |
| `doelgroep_match` | Match-score per product per doelgroep met aanbevelingstekst |
| `conversies` | Klik- en aankoopregistraties per product |

## Categorieën

Toegestane waarden voor `products.categorie`:
- `omega-3`
- `magnesium`
- `vitamine-d`
- `overig`

## Vereisten

- PostgreSQL 14 of hoger (vanwege `gen_random_uuid()` zonder extensie)
- Database `perfectsupplement` moet bestaan: `CREATE DATABASE perfectsupplement;`
