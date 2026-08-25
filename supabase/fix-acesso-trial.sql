-- ============================================================================
-- PersonControl — FIX: usuários sem registro de acesso travados na ativação
-- Execute este script COMPLETO no SQL Editor do Supabase.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) Cria registro de acesso para usuários existentes sem linha
--    (30 dias de teste; admin recebe 100 anos)
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

-- Garante admin mesmo se a linha já existia
update public.user_access
   set is_admin      = true,
       expira_em     = now() + interval '36500 days',
       atualizado_em = now()
 where lower(email) = 'marlonfpessoa@gmail.com';

-- ---------------------------------------------------------------------------
-- 2) RPC de auto-recuperação: se um usuário autenticado estiver sem linha
--    (ex.: cadastro anterior ao sistema de chaves), o app pode se curar sozinho
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
