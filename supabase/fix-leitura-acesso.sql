-- ============================================================================
-- PersonControl — FIX: leitura do próprio acesso independente de RLS
-- Execute este script COMPLETO no SQL Editor do Supabase.
-- ============================================================================

-- Lê o acesso do usuário autenticado como admin (bypassa RLS).
-- Resolve casos em que a policy de SELECT filtra indevidamente a própria linha.
create or replace function public.meu_acesso()
returns table (
  user_id   uuid,
  email     text,
  expira_em timestamptz,
  is_admin  boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select ua.user_id, ua.email, ua.expira_em, ua.is_admin
    from public.user_access ua
   where ua.user_id = auth.uid();
$$;

grant execute on function public.meu_acesso() to authenticated;
