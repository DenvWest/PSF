-- Default B2C-org: volledige stepped-care-trap (tier 1–3) voor PLAN-journey.
-- Merge via jsonb_set; andere settings-keys blijven intact.
update public.organizations
set settings = jsonb_set(
  coalesce(settings, '{}'::jsonb),
  '{maxTier}',
  '3'::jsonb,
  true
)
where id = '00000000-0000-0000-0000-000000000001';
