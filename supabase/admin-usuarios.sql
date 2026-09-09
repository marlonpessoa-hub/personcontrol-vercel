-- ============================================================================
-- PersonControl — Administração de Usuários (RPCs para o admin)
-- Execute este script COMPLETO no SQL Editor do Supabase (Dashboard).
-- Pode ser executado com segurança mais de uma vez (idempotente).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) Listar todos os usuários com dados de acesso
--    Retorna email, data de expiração, flag admin e data de criação
-- ---------------------------------------------------------------------------
create or replace function public.admin_listar_usuarios()
returns table (
  user_id    uuid,
  email      text,
  expira_em  timestamptz,
  is_admin   boolean,
  criado_em  timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.eh_admin() then
    raise exception 'ACESSO_NEGADO: apenas administradores podem listar usuários.';
  end if;

  return query
    select
      ua.user_id,
      ua.email,
      ua.expira_em,
      ua.is_admin,
      u.created_at as criado_em
    from public.user_access ua
    left join auth.users u on u.id = ua.user_id
    order by ua.is_admin desc, ua.email asc;
end $$;

grant execute on function public.admin_listar_usuarios() to authenticated;

-- ---------------------------------------------------------------------------
-- 2) Bloquear usuário (zera a data de expiração para agora)
-- ---------------------------------------------------------------------------
create or replace function public.admin_bloquear_usuario(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.eh_admin() then
    raise exception 'ACESSO_NEGADO';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'ACAO_PROPRIA: você não pode bloquear a si mesmo.';
  end if;

  update public.user_access
     set expira_em     = now(),
         atualizado_em = now()
   where user_id = p_user_id;

  if not found then
    raise exception 'USUARIO_NAO_ENCONTRADO';
  end if;
end $$;

grant execute on function public.admin_bloquear_usuario(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 3) Liberar/Estender acesso do usuário por N dias a partir de agora
-- ---------------------------------------------------------------------------
create or replace function public.admin_liberar_usuario(p_user_id uuid, p_dias int)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nova timestamptz;
begin
  if not public.eh_admin() then
    raise exception 'ACESSO_NEGADO';
  end if;

  if p_dias < 1 or p_dias > 36500 then
    raise exception 'DIAS_INVALIDOS: informe entre 1 e 36500.';
  end if;

  v_nova := now() + make_interval(days => p_dias);

  update public.user_access
     set expira_em     = v_nova,
         atualizado_em = now()
   where user_id = p_user_id;

  if not found then
    raise exception 'USUARIO_NAO_ENCONTRADO';
  end if;

  return v_nova;
end $$;

grant execute on function public.admin_liberar_usuario(uuid, int) to authenticated;

-- ---------------------------------------------------------------------------
-- 4) Alternar flag de administrador
-- ---------------------------------------------------------------------------
create or replace function public.admin_toggle_admin(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_novo boolean;
begin
  if not public.eh_admin() then
    raise exception 'ACESSO_NEGADO';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'ACAO_PROPRIA: você não pode remover seu próprio admin.';
  end if;

  update public.user_access
     set is_admin      = not is_admin,
         atualizado_em = now()
   where user_id = p_user_id
   returning is_admin into v_novo;

  if v_novo is null then
    raise exception 'USUARIO_NAO_ENCONTRADO';
  end if;

  return v_novo;
end $$;

grant execute on function public.admin_toggle_admin(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 5) Excluir usuário (remove acesso e jornadas; auth.users tem ON DELETE CASCADE)
-- ---------------------------------------------------------------------------
create or replace function public.admin_excluir_usuario(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.eh_admin() then
    raise exception 'ACESSO_NEGADO';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'ACAO_PROPRIA: você não pode excluir a si mesmo.';
  end if;

  -- Remove jornadas do usuário
  delete from public.jornadas where user_id = p_user_id;

  -- Remove registro de acesso
  delete from public.user_access where user_id = p_user_id;

  -- Remove o usuário do auth (cascade nas FKs)
  delete from auth.users where id = p_user_id;
end $$;

grant execute on function public.admin_excluir_usuario(uuid) to authenticated;

-- ============================================================================
-- Pronto! Após executar, as funções estarão disponíveis para o app.
-- ============================================================================
