create extension if not exists pgcrypto;

create or replace function public.is_bakery_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select auth.jwt() ->> 'email') = 'holycrowbakery@gmail.com', false);
$$;

create table if not exists public.categories (
  name text primary key check (char_length(name) between 1 and 50),
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key default gen_random_uuid()::text,
  name text not null check (char_length(name) between 1 and 120),
  description text not null default '',
  price_cents integer not null check (price_cents > 0),
  category text not null references public.categories(name) on update cascade on delete restrict,
  available boolean not null default true,
  image_url text not null default '',
  ingredients text[] not null default '{}',
  max_quantity integer not null default 1 check (max_quantity between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default (
    'HC-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
  ),
  idempotency_key uuid not null unique,
  customer_name text not null check (char_length(customer_name) between 1 and 120),
  customer_email text not null check (char_length(customer_email) between 3 and 320),
  customer_phone text not null default '',
  notes text not null default '',
  total_cents integer not null default 0 check (total_cents >= 0),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'ready', 'completed')),
  is_custom_order boolean not null default false,
  custom_description text,
  preferred_pickup_date date,
  venmo_paid boolean not null default false,
  email_status text not null default 'pending' check (email_status in ('pending', 'sent', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  product_name text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity between 1 and 100)
);

create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_customer_email_created_idx on public.orders(customer_email, created_at desc);
create index if not exists order_items_order_id_idx on public.order_items(order_id);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Anyone can read categories"
on public.categories for select
using (true);

create policy "Anyone can read products"
on public.products for select
using (true);

create policy "Owner manages categories"
on public.categories for all
using (public.is_bakery_admin())
with check (public.is_bakery_admin());

create policy "Owner manages products"
on public.products for all
using (public.is_bakery_admin())
with check (public.is_bakery_admin());

create policy "Owner reads orders"
on public.orders for select
using (public.is_bakery_admin());

create policy "Owner updates orders"
on public.orders for update
using (public.is_bakery_admin())
with check (public.is_bakery_admin());

create policy "Owner reads order items"
on public.order_items for select
using (public.is_bakery_admin());

insert into public.categories(name) values
  ('Cakes'), ('Cupcakes'), ('Cookies'), ('Macarons'), ('Bars'), ('Tarts'), ('Breads'), ('Seasonal')
on conflict do nothing;

insert into public.products
  (id, name, description, price_cents, category, available, image_url, ingredients, max_quantity)
values
  ('1', 'Black Velvet Cake', 'Rich dark chocolate cake with black cocoa, topped with crimson cream cheese frosting and edible roses.', 750, 'Cakes', true, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&auto=format', array['Gluten-free flour blend','Black cocoa','Sugar','Eggs','Butter','Cream cheese','Vanilla'], 2),
  ('2', 'Lavender Earl Grey Macarons', '4-pack. Delicate lavender-tinted shells with fragrant earl grey buttercream filling.', 1300, 'Macarons', true, 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=400&h=300&fit=crop&auto=format', array['Almond flour','Powdered sugar','Egg whites','Lavender','Earl Grey tea','Butter'], 3),
  ('3', 'Rose Garden Cupcakes', '2-pack. Dark chocolate cupcakes with rosewater buttercream, topped with a dried rose petal.', 1000, 'Cupcakes', true, 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400&h=300&fit=crop&auto=format', array['Gluten-free flour blend','Cocoa','Sugar','Eggs','Butter','Rosewater','Cream'], 3),
  ('4', 'Sage & Lemon Shortbread', '6-pack. Buttery almond flour shortbread with fresh sage and lemon zest, dusted in gold.', 900, 'Cookies', true, 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop&auto=format', array['Almond flour','Butter','Sugar','Fresh sage','Lemon zest','Sea salt'], 4),
  ('5', 'Matcha Crow-Swirl Brownies', '2-pack. Fudgy dark chocolate brownies swirled with ceremonial matcha cream.', 800, 'Bars', true, 'https://images.unsplash.com/photo-1515037893149-de7f840978e2?w=400&h=300&fit=crop&auto=format', array['Dark chocolate','Butter','Sugar','Eggs','Gluten-free flour','Matcha'], 3),
  ('6', 'Blood Orange Tart', 'Crisp almond tart shell filled with blood orange curd and topped with candied citrus.', 850, 'Tarts', true, 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=400&h=300&fit=crop&auto=format', array['Almond flour','Butter','Eggs','Blood orange','Sugar','Citrus peel'], 2),
  ('7', 'Spiced Pumpkin Loaf Slice', 'Moist pumpkin bread with warming spices, brown sugar crust, and maple glaze.', 550, 'Breads', true, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&auto=format', array['Pumpkin','Gluten-free flour','Brown sugar','Eggs','Cinnamon','Maple'], 4),
  ('8', 'Crow''s Treasure Cookie Box', '6-pack assorted decorated sugar cookies — crows, feathers, berries, and flowers.', 1500, 'Cookies', false, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop&auto=format', array['Gluten-free flour blend','Butter','Sugar','Eggs','Vanilla','Royal icing'], 2)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Public reads product images"
on storage.objects for select
using (bucket_id = 'product-images');

create policy "Owner uploads product images"
on storage.objects for insert
with check (bucket_id = 'product-images' and public.is_bakery_admin());

create policy "Owner updates product images"
on storage.objects for update
using (bucket_id = 'product-images' and public.is_bakery_admin())
with check (bucket_id = 'product-images' and public.is_bakery_admin());

create policy "Owner deletes product images"
on storage.objects for delete
using (bucket_id = 'product-images' and public.is_bakery_admin());
