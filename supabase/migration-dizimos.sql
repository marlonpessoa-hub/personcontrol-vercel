-- ============================================================================
-- PersonControl — Tabela de Dízimos
-- Execute este script no SQL Editor do Supabase (Dashboard).
-- Pode ser executado com segurança mais de uma vez (idempotente).
--
-- Funcionalidade:
--   - Armazena 10% do total ganho de cada jornada
--   - Permite consultar soma mensal de dízimos
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) Tabela de dízimos
-- ---------------------------------------------------------------------------
create table if not exists public.dizimos (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  jornada_id       uuid not null references public.jornadas (id) on delete cascade,
  data_jornada     timestamptz not null,
  total_ganho      numeric(12,2) not null default 0,
  dizimo_valor     numeric(12,2) not null default 0,
  criado_em        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2) Índices
-- ---------------------------------------------------------------------------
create index if not exists idx_dizimos_user_data on public.dizimos (user_id, data_jornada desc);
create index if not exists idx_dizimos_jornada on public.dizimos (jornada_id);

-- ---------------------------------------------------------------------------
-- 3) RLS (Row Level Security)
-- ---------------------------------------------------------------------------
alter table public.dizimos enable row level security;

create policy "usuario ve seus dizimos" on public.dizimos
  for select using (auth.uid() = user_id);

create policy "usuario insere seus dizimos" on public.dizimos
  for insert with check (auth.uid() = user_id);

create policy "usuario atualiza seus dizimos" on public.dizimos
  for update using (auth.uid() = user_id);

create policy "usuario remove seus dizimos" on public.dizimos
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 4) Função RPC: soma de dízimos por mês
-- ---------------------------------------------------------------------------
create or replace function public.soma_dizimos_mes(p_user_id uuid, p_mes int, p_ano int)
returns numeric(12,2)
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(d.dizimo_valor), 0)
    from public.dizimos d
   where d.user_id = p_user_id
     and extract(month from d.data_jornada) = p_mes
     and extract(year from d.data_jornada) = p_ano;
$$;

grant execute on function public.soma_dizimos_mes(uuid, int, int) to authenticated;
