# Tech keuzes en redenen

- Supabase ipv SQLite: dashboard, schaalbaar, gratis tier ruim genoeg
- Supabase ipv Firebase: relationele data, SQL queries voor patronen, geen vendor lock-in, goedkoper bij schaal
- Hetzner ipv Vercel: volledige controle, vaste prijs, cron via server of externe trigger
- Resend ipv Mailgun/SendGrid: gratis tier 3000/maand, React email templates, simpele API
- DM Sans + DM Serif Display: warm + professioneel, past bij doelgroep
- localStorage afgeschaft: data moet server-side voor herhaalmeting
- Geen account-systeem (nog): drempel te hoog voor MVP
- Affiliate links: monetisatie, geen eigen webshop
