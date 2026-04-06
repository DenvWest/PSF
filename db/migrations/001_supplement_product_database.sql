CREATE TABLE products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  naam text NOT NULL,
  merk text NOT NULL,
  categorie text NOT NULL CHECK (
    categorie IN ('omega-3', 'magnesium', 'vitamine-d', 'overig')
  ),
  url_affiliate text,
  commissie_pct numeric(5,2),
  datum_toegevoegd timestamptz DEFAULT now()
);

CREATE TABLE ingredienten (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  naam text NOT NULL,
  hoeveelheid numeric,
  eenheid text,
  vorm text
);

CREATE TABLE evaluaties (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  kwaliteitsscore numeric(3,1) CHECK (kwaliteitsscore BETWEEN 1 AND 10),
  prijs_per_dag numeric(6,2),
  transparantie_score numeric(3,1) CHECK (transparantie_score BETWEEN 1 AND 10),
  notities text,
  datum timestamptz DEFAULT now()
);

CREATE TABLE doelgroep_match (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  doelgroep text NOT NULL,
  match_score numeric(3,1),
  aanbeveling_tekst text
);

CREATE TABLE conversies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  lead_tag text,
  klik_datum timestamptz DEFAULT now(),
  aankoop boolean DEFAULT false
);

CREATE INDEX idx_products_categorie ON products(categorie);
CREATE INDEX idx_evaluaties_product ON evaluaties(product_id);
CREATE INDEX idx_conversies_product ON conversies(product_id);
CREATE INDEX idx_doelgroep_product ON doelgroep_match(product_id);
