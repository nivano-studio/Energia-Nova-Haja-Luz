-- SCRIPT DE CONFIGURAÇÃO DO BANCO DE DADOS (SUPABASE)
-- Execute estas instruções no SQL Editor do painel do seu projeto Supabase.

-- =========================================================================
-- 1. EXTENSÃO E TABELAS
-- =========================================================================

-- Ativar geração de UUID
create extension if not exists "uuid-ossp";

-- Tabela de Categorias
create table if not exists categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  icon text not null, -- Nome do ícone do Lucide (ex: 'Lightbulb', 'Cable', 'Power')
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Subcategorias
create table if not exists subcategories (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references categories(id) on delete cascade not null,
  name text not null,
  slug text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (category_id, slug)
);

-- Tabela de Produtos
create table if not exists products (
  id text primary key, -- Mantemos como text para compatibilidade com IDs existentes
  name text not null,
  description text default '',
  category text not null, -- slug da categoria pai
  subcategory text not null, -- slug da subcategoria
  image text not null, -- URL da imagem do storage
  price numeric,
  old_price numeric,
  is_best_seller boolean default false,
  sales_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- 2. HABILITAR SEGURANÇA DE LINHA (RLS - ROW LEVEL SECURITY)
-- =========================================================================

alter table categories enable row level security;
alter table subcategories enable row level security;
alter table products enable row level security;

-- =========================================================================
-- 3. POLÍTICAS DE RLS (SEGURANÇA DO BANCO DE DADOS)
-- =========================================================================

-- Permissões de Leitura Pública (Qualquer usuário do site pode ver)
create policy "Leitura pública de categorias" on categories
  for select using (true);

create policy "Leitura pública de subcategorias" on subcategories
  for select using (true);

create policy "Leitura pública de produtos" on products
  for select using (true);

-- Permissões de Escrita do Admin (Somente usuário autenticado pode gravar/alterar/excluir)
create policy "Modificação de categorias pelo admin" on categories
  for all using (auth.role() = 'authenticated');

create policy "Modificação de subcategorias pelo admin" on subcategories
  for all using (auth.role() = 'authenticated');

create policy "Modificação de produtos pelo admin" on products
  for all using (auth.role() = 'authenticated');

-- =========================================================================
-- 4. POLÍTICAS PARA O BUCKET DE STORAGE (IMAGENS)
-- =========================================================================
-- Certifique-se de criar o bucket chamado 'product-images' no painel "Storage" do Supabase.
-- E ative a opção "Public bucket". As políticas de segurança serão:

-- Nota: O Supabase costuma criar as políticas do Storage na interface visual, 
-- mas você também pode criá-las via SQL se o bucket já existir:
--
-- create policy "Permitir visualização pública de imagens" on storage.objects 
--   for select using (bucket_id = 'product-images');
--
-- create policy "Permitir alteração de imagens apenas por admin autenticado" on storage.objects 
--   for all using (bucket_id = 'product-images' and auth.role() = 'authenticated');
