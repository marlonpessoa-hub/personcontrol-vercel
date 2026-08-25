-- ============================================================================
-- PersonControl — Controle de acesso por chave
-- Execute este script COMPLETO no SQL Editor do Supabase (Dashboard).
-- Pode ser executado com segurança mais de uma vez (idempotente).
--
-- Regras:
--   - Novo usuário sem chave  -> 30 dias de teste automático
--   - Chaves válidas          -> 30, 60, 90, 180 dias ou 1 ano
--   - Ativar nova chave       -> soma os dias ao tempo restante
--   - marlonfpessoa@gmail.com -> administrador (acesso de 100 anos)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) Tabela de chaves de acesso
-- ---------------------------------------------------------------------------
create table if not exists public.access_keys (
  id           uuid primary key default gen_random_uuid(),
  codigo       text unique not null,
  duracao_dias int not null check (duracao_dias in (30, 60, 90, 180, 365)),
  criado_por   text,
  criado_em    timestamptz not null default now(),
  usado_por    uuid references auth.users (id),
  usado_em     timestamptz
);

-- ---------------------------------------------------------------------------
-- 2) Tabela de acesso do usuário
-- ---------------------------------------------------------------------------
create table if not exists public.user_access (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  email         text not null,
  expira_em     timestamptz not null,
  is_admin      boolean not null default false,
  atualizado_em timestamptz not null default now()
);

alter table public.access_keys enable row level security;
alter table public.user_access enable row level security;

-- ---------------------------------------------------------------------------
-- 3) Função auxiliar: usuário atual é administrador?
-- ---------------------------------------------------------------------------
create or replace function public.eh_admin()
returns boolean
language sql stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_access
    where user_id = auth.uid() and is_admin
  );
$$;

-- ---------------------------------------------------------------------------
-- 4) Políticas RLS — user_access
--    Usuário lê apenas a própria linha; escrita só via RPC (security definer).
-- ---------------------------------------------------------------------------
drop policy if exists "usuario le propria linha ou admin" on public.user_access;
create policy "usuario le propria linha ou admin" on public.user_access
  for select
  using (auth.uid() = user_id or public.eh_admin());

drop policy if exists "admin atualiza acessos" on public.user_access;
create policy "admin atualiza acessos" on public.user_access
  for update
  using (public.eh_admin());

drop policy if exists "admin remove acessos" on public.user_access;
create policy "admin remove acessos" on public.user_access
  for delete
  using (public.eh_admin());

-- ---------------------------------------------------------------------------
-- 5) Políticas RLS — access_keys (somente administradores)
-- ---------------------------------------------------------------------------
drop policy if exists "admin le chaves" on public.access_keys;
create policy "admin le chaves" on public.access_keys
  for select
  using (public.eh_admin());

drop policy if exists "admin cria chaves" on public.access_keys;
create policy "admin cria chaves" on public.access_keys
  for insert
  with check (public.eh_admin());

drop policy if exists "admin remove chaves" on public.access_keys;
create policy "admin remove chaves" on public.access_keys
  for delete
  using (public.eh_admin());

-- ---------------------------------------------------------------------------
-- 6) RPC: ativar chave (atômica; soma os dias ao saldo restante)
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
     set usado_por = auth.uid(),
         usado_em  = now()
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

-- ---------------------------------------------------------------------------
-- 7) Trigger: novo usuário ganha 30 dias de teste (admin ganha 100 anos)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user_acesso()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_access (user_id, email, expira_em, is_admin)
  values (
    new.id,
    new.email,
    now() + case
              when lower(new.email) = 'marlonfpessoa@gmail.com'
                then interval '36500 days'
              else interval '30 days'
            end,
    lower(new.email) = 'marlonfpessoa@gmail.com'
  )
  on conflict (user_id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user_acesso();

-- ---------------------------------------------------------------------------
-- 8) Backfill: usuários existentes + admin inicial
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

update public.user_access
   set is_admin  = true,
       expira_em = now() + interval '36500 days',
       atualizado_em = now()
 where lower(email) = 'marlonfpessoa@gmail.com';
