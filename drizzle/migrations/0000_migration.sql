create table public.landing_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  price numeric(12,2) not null default 0,
  old_price numeric(12,2),
  images text[] not null default '{}',
  ask_address boolean not null default true,
  ask_wilaya boolean not null default true,
  ask_quantity boolean not null default true,
  is_active boolean not null default true,
  views integer not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.landing_pages to anon;
grant select, insert, update, delete on public.landing_pages to authenticated;
grant all on public.landing_pages to service_role;
alter table public.landing_pages enable row level security;
create policy "public read active" on public.landing_pages for select to anon, authenticated using (is_active or auth.uid() = user_id);
create policy "owner insert" on public.landing_pages for insert to authenticated with check (auth.uid() = user_id);
create policy "owner update" on public.landing_pages for update to authenticated using (auth.uid() = user_id);
create policy "owner delete" on public.landing_pages for delete to authenticated using (auth.uid() = user_id);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.landing_pages(id) on delete cascade,
  merchant_id uuid,
  product_title text,
  customer_name text not null,
  phone text not null,
  wilaya text,
  address text,
  quantity integer not null default 1,
  total numeric(12,2) not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
grant insert on public.orders to anon;
grant select, insert, update, delete on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "anyone order" on public.orders for insert to anon, authenticated with check (true);
create policy "merchant read" on public.orders for select to authenticated using (auth.uid() = merchant_id);
create policy "merchant update" on public.orders for update to authenticated using (auth.uid() = merchant_id);
create policy "merchant delete" on public.orders for delete to authenticated using (auth.uid() = merchant_id);

create or replace function public.prepare_order() returns trigger language plpgsql security definer set search_path = public as $$
declare p record;
begin
  select * into p from public.landing_pages where id = new.page_id and is_active;
  if not found then raise exception 'page not available'; end if;
  if new.quantity < 1 or new.quantity > 100 then new.quantity := 1; end if;
  if length(trim(new.customer_name)) < 2 or length(new.customer_name) > 100 then raise exception 'invalid name'; end if;
  if new.phone !~ '^[0-9+ ]{8,16}$' then raise exception 'invalid phone'; end if;
  new.merchant_id := p.user_id;
  new.product_title := p.title;
  new.total := p.price * new.quantity;
  new.status := 'pending';
  return new;
end $$;
create trigger orders_prepare before insert on public.orders for each row execute function public.prepare_order();

create or replace function public.check_status() returns trigger language plpgsql set search_path = public as $$
begin
  if new.status not in ('pending','confirmed','shipped','delivered','cancelled') then raise exception 'bad status'; end if;
  new.merchant_id := old.merchant_id; new.total := old.total; new.page_id := old.page_id;
  return new;
end $$;
create trigger orders_status before update on public.orders for each row execute function public.check_status();

create or replace function public.increment_view(_slug text) returns void language sql security definer set search_path = public as $$
  update public.landing_pages set views = views + 1 where slug = _slug and is_active;
$$;
grant execute on function public.increment_view(text) to anon, authenticated;

create policy "read product images" on storage.objects for select to anon, authenticated using (bucket_id = 'product-images');
create policy "users upload own images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users delete own images" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);