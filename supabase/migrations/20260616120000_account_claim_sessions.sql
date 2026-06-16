create or replace function public.count_claimable_intake_sessions(p_account_id uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  select count(*)::int
  from public.intake_sessions s
  join public.accounts a on a.id = p_account_id
  where s.account_id is null
    and s.marketing_email is not null
    and lower(s.marketing_email) = lower(a.email::text);
$$;

create or replace function public.claim_intake_sessions_for_account(p_account_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_count int;
begin
  select a.email::text
    into v_email
  from public.accounts a
  where a.id = p_account_id
    and a.status <> 'revoked';

  if v_email is null then
    return 0;
  end if;

  update public.intake_sessions s
    set account_id = p_account_id
  where s.account_id is null
    and s.marketing_email is not null
    and lower(s.marketing_email) = lower(v_email);

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.count_claimable_intake_sessions(uuid) from public, anon, authenticated;
revoke all on function public.claim_intake_sessions_for_account(uuid) from public, anon, authenticated;
grant execute on function public.count_claimable_intake_sessions(uuid) to service_role;
grant execute on function public.claim_intake_sessions_for_account(uuid) to service_role;
