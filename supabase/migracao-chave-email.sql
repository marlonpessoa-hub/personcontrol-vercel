-- ============================================================================
-- PersonControl — Chaves usadas ficam vinculadas ao E-MAIL do usuário
-- Execute este script COMPLETO no SQL Editor do Supabase.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) Nova coluna: e-mail de quem usou a chave
-- ---------------------------------------------------------------------------
alter table public.access_keys
  add column if not exists usado_por_email text;

-- ---------------------------------------------------------------------------
-- 2) Backfill: preenche o e-mail das chaves já utilizadas
-- ---------------------------------------------------------------------------
update public.access_keys k
   set usado_por_email = u.email
  from auth.users u
 where k.usado_por = u.id
   and k.usado_por_email is null;

-- ---------------------------------------------------------------------------
-- 3) RPC atualizada: grava o e-mail junto com o UUID na ativação
-- ---------------------------------------------------------------------------
create or replace function public.ativar_chave(p_codigo text)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_duracao int;
  v_base    timestamptz;
  v_nova    timestamptz;
begin
  if auth.uid() is null then
    raise exception 'NAO_AUTENTICADO';
  end if;

  update public.access_keys
     set usado_por        = auth.uid(),
         usado_por_email  = auth.email(),
         usado_em         = now()
   where codigo = upper(btrim(p_codigo))
     and usado_por is null
   returning duracao_dias into v_duracao;

  if v_duracao is null then
    raise exception 'CHAVE_INVALIDA';
  end if;

  select coalesce(max(expira_em), now()) into v_base
    from public.user_access
   where user_id = auth.uid();

  if v_base < now() then
    v_base := now();
  end if;

  v_nova := v_base + make_interval(days => v_duracao);

  insert into public.user_access (user_id, email, expira_em, is_admin, atualizado_em)
  values (auth.uid(), auth.email(), v_nova, false, now())
  on conflict (user_id) do update
    set expira_em     = excluded.expira_em,
        email         = excluded.email,
        atualizado_em = now();

  return v_nova;
end $$;

grant execute on function public.ativar_chave(text) to authenticated;
