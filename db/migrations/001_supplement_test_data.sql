-- Test data: 2 omega-3 producten + 3 magnesium producten

-- =============================================
-- PRODUCTS
-- =============================================
INSERT INTO products (id, naam, merk, categorie, url_affiliate, commissie_pct)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Visolie Vloeibaar', 'Arctic Blue', 'omega-3',
   'https://www.arctic-blue.com/winkel/visolie/visolie-vloeibaar/?sld=dennisvanwestbroek', 10.00),

  ('a1000000-0000-0000-0000-000000000002', 'Algenolie Vloeibaar', 'Arctic Blue', 'omega-3',
   'https://www.arctic-blue.com/winkel/algenolie/algenolie-vloeibaar/?sld=dennisvanwestbroek', 10.00),

  ('a1000000-0000-0000-0000-000000000003', 'Magnesium Bisglycinaat 400 mg', 'PerfectSupplement', 'magnesium',
   NULL, NULL),

  ('a1000000-0000-0000-0000-000000000004', 'Magnesium Citraat 300 mg', 'PerfectSupplement', 'magnesium',
   NULL, NULL),

  ('a1000000-0000-0000-0000-000000000005', 'Magnesium Malaat 500 mg', 'PerfectSupplement', 'magnesium',
   NULL, NULL);

-- =============================================
-- INGREDIENTEN
-- =============================================
INSERT INTO ingredienten (product_id, naam, hoeveelheid, eenheid, vorm)
VALUES
  -- Arctic Blue Visolie
  ('a1000000-0000-0000-0000-000000000001', 'EPA', 810, 'mg', 'vetzuur'),
  ('a1000000-0000-0000-0000-000000000001', 'DHA', 540, 'mg', 'vetzuur'),
  ('a1000000-0000-0000-0000-000000000001', 'Omega-3 totaal', 1620, 'mg', 'vetzuur'),

  -- Arctic Blue Algenolie
  ('a1000000-0000-0000-0000-000000000002', 'DHA', 400, 'mg', 'algen-vetzuur'),
  ('a1000000-0000-0000-0000-000000000002', 'EPA', 200, 'mg', 'algen-vetzuur'),

  -- Magnesium Bisglycinaat
  ('a1000000-0000-0000-0000-000000000003', 'Magnesium', 400, 'mg', 'bisglycinaat'),

  -- Magnesium Citraat
  ('a1000000-0000-0000-0000-000000000004', 'Magnesium', 300, 'mg', 'citraat'),

  -- Magnesium Malaat
  ('a1000000-0000-0000-0000-000000000005', 'Magnesium', 500, 'mg', 'malaat');

-- =============================================
-- EVALUATIES
-- =============================================
INSERT INTO evaluaties (product_id, kwaliteitsscore, prijs_per_dag, transparantie_score, notities)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 9.2, 0.65, 9.0,
   'Hoge EPA/DHA concentratie, IFOS-gecertificeerd, duurzame visserij MSC.'),

  ('a1000000-0000-0000-0000-000000000002', 8.8, 0.90, 9.5,
   'Plantaardig alternatief voor visolie, geschikt voor vegans, geen vislucht.'),

  ('a1000000-0000-0000-0000-000000000003', 8.5, 0.30, 8.0,
   'Goed geabsorbeerde chelaatvorm, mild voor maag, aanbevolen bij slaapproblemen.'),

  ('a1000000-0000-0000-0000-000000000004', 7.8, 0.25, 7.5,
   'Populaire basisvorm, goede biologische beschikbaarheid, licht laxerend effect.'),

  ('a1000000-0000-0000-0000-000000000005', 8.0, 0.35, 7.8,
   'Combinatie met appelzuur ondersteunt energieproductie (Krebs-cyclus), geschikt bij fibromyalgie.');

-- =============================================
-- DOELGROEP MATCH
-- =============================================
INSERT INTO doelgroep_match (product_id, doelgroep, match_score, aanbeveling_tekst)
VALUES
  -- Visolie: hart & cognitie, breed inzetbaar
  ('a1000000-0000-0000-0000-000000000001', 'man_40', 9.0,
   'Ondersteunt hart, cognitie en gewrichten bij mannen boven de 40.'),
  ('a1000000-0000-0000-0000-000000000001', 'man_50plus', 9.2,
   'Extra relevant bij verhoogd cardiovasculair risico na de 50.'),
  ('a1000000-0000-0000-0000-000000000001', 'vrouw_menopauze', 8.5,
   'EPA/DHA ondersteunt stemming en cognitie tijdens menopauze.'),

  -- Algenolie: vegan omega-3
  ('a1000000-0000-0000-0000-000000000002', 'vrouw_premenopauze', 8.8,
   'Plantaardige bron van DHA voor vrouwen die geen vis eten.'),
  ('a1000000-0000-0000-0000-000000000002', 'vrouw_menopauze', 8.5,
   'Vegan alternatief met vergelijkbare effectiviteit als visolie.'),

  -- Magnesium Bisglycinaat: ontspanning & slaap
  ('a1000000-0000-0000-0000-000000000003', 'vrouw_premenopauze', 8.5,
   'Ondersteunt ontspanning, slaap en PMS-klachten.'),
  ('a1000000-0000-0000-0000-000000000003', 'man_40', 8.0,
   'Helpt bij herstel na sport en ontspanning van het zenuwstelsel.'),

  -- Magnesium Citraat: breed inzetbaar
  ('a1000000-0000-0000-0000-000000000004', 'man_40', 7.5,
   'Goede instapvorm voor algemene magnesiumaanvulling.'),
  ('a1000000-0000-0000-0000-000000000004', 'man_50plus', 7.8,
   'Ondersteunt spierfunctie en energiemetabolisme.'),

  -- Magnesium Malaat: energie & spieren
  ('a1000000-0000-0000-0000-000000000005', 'man_50plus', 8.2,
   'Combinatie met malaat bevordert energie en vermindert spierpijn.'),
  ('a1000000-0000-0000-0000-000000000005', 'vrouw_menopauze', 8.0,
   'Ondersteunt energieniveau en spierfunctie tijdens hormonale overgang.');
