-- ============================================================================
-- PersonControl — FIX: permitir auto-registro de acesso + garantir RPC trial
-- Execute este script COMPLETO no SQL Editor do Supabase (Dashboard).
-- Pode ser executado com segurança mais de uma vez (idempotente).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) Política INSERT para user_access: permite que o próprio usuário
--    crie seu registro de acesso (fallback caso a RPC falhe).
-- ---------------------------------------------------------------------------
drop policy if exists "usuario cria proprio acesso" on public.user_access;
create policy "usuario cria proprio acesso" on public.user_access
  for insert
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 2) Política UPDATE para o próprio usuário atualizar seu registro
--    (necessário para upsert funcionar via client).
-- ---------------------------------------------------------------------------
drop policy if exists "usuario atualiza proprio acesso" on public.user_access;
create policy "usuario atualiza proprio acesso" on public.user_access
  for update
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 3) Re-cria a função garantir_acesso_trial (caso não exista no banco).
--    Essa é a primeira tentativa do app antes do fallback direto.
-- ---------------------------------------------------------------------------
create or replace function public.garantir_acesso_trial()
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_expira   timestamptz;
  v_email    text;
  v_is_admin boolean;
begin
  if auth.uid() is null then
    raise exception 'NAO_AUTENTICADO';
  end if;

  select expira_em into v_expira
    from public.user_access
   where user_id = auth.uid();

  if v_expira is not null then
    return v_expira;
  end if;

  select email into v_email from auth.users where id = auth.uid();
  v_is_admin := lower(coalesce(v_email, '')) = 'marlonfpessoa@gmail.com';

  insert into public.user_access (user_id, email, expira_em, is_admin)
  values (
    auth.uid(),
    coalesce(v_email, auth.email()),
    now() + case when v_is_admin then interval '36500 days' else interval '30 days' end,
    v_is_admin
  )
  on conflict (user_id) do nothing;

  select expira_em into v_expira
    from public.user_access
   where user_id = auth.uid();

  return v_expira;
end $$;

grant execute on function public.garantir_acesso_trial() to authenticated;

-- ---------------------------------------------------------------------------
-- 4) Backfill: cria registro para usuários existentes que ainda não têm.
-- ---------------------------------------------------------------------------
insert into public.user_access (user_id, email, expira_em, is_admin)
select u.id,
       u.email,
       now() + case
                 when lower(u.email) = 'marlonfpessoa@gmail.com'
                   then interval '36500 days'
                 else interval '30 days'
               end,
       lower(u.email) = 'marlonfpessoa@gmail.com'
  from auth.users u
on conflict (user_id) do nothing;

-- Garante admin
update public.user_access
   set is_admin      = true,
       expira_em     = now() + interval '36500 days',
       atualizado_em = now()
 where lower(email) = 'marlonfpessoa@gmail.com';

-- ============================================================================
-- Pronto! Após executar, reinicie o app ou clique "Tentar novamente".
-- ============================================================================
