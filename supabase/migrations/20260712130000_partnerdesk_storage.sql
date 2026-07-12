-- PartnerDesk fase 3 — private storage-bucket voor contract-PDF's, banners en
-- ander materiaal. Toegang uitsluitend server-side via de service-role-client
-- (signed URLs, kort geldig). Geen storage-policies = geen anon/authenticated
-- toegang. Uitvoeren via de Supabase Dashboard SQL Editor.

insert into storage.buckets (id, name, public, file_size_limit)
values ('partner-documents', 'partner-documents', false, 20971520) -- 20 MB
on conflict (id) do nothing;
