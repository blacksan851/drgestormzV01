CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    category TEXT,
    price NUMERIC(15,2) NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    img TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tx_id TEXT UNIQUE NOT NULL,
    client_name TEXT,
    amount NUMERIC(15,2) NOT NULL,
    status TEXT NOT NULL,
    items_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    tax_id TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create simple policies (Allow all for development. In production, restrict to authenticated users)
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Allow public read sales" ON public.sales FOR SELECT USING (true);
CREATE POLICY "Allow public insert sales" ON public.sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update sales" ON public.sales FOR UPDATE USING (true);
CREATE POLICY "Allow public delete sales" ON public.sales FOR DELETE USING (true);

CREATE POLICY "Allow public read clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Allow public insert clients" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update clients" ON public.clients FOR UPDATE USING (true);
CREATE POLICY "Allow public delete clients" ON public.clients FOR DELETE USING (true);

-- Roles and Permissions Table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    users_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read roles" ON public.roles FOR SELECT USING (true);
CREATE POLICY "Allow public insert roles" ON public.roles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update roles" ON public.roles FOR UPDATE USING (true);
CREATE POLICY "Allow public delete roles" ON public.roles FOR DELETE USING (true);

-- Insert default roles
INSERT INTO public.roles (name, description, permissions, users_count) VALUES 
('Administrador', 'Acesso total ao sistema', '["all"]', 1),
('Gerente de Loja', 'Gestão de inventário e relatórios de vendas', '["inventory_read", "inventory_write", "sales_read", "pos_access"]', 3),
('Operador de Caixa', 'Acesso exclusivo ao Ponto de Venda', '["pos_access"]', 5)
ON CONFLICT (name) DO NOTHING;

-- Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    legal_name TEXT DEFAULT 'DR GESTOR MZ Lda.',
    commercial_name TEXT DEFAULT 'DR GESTOR MZ',
    tax_id TEXT DEFAULT '400123456',
    phone TEXT DEFAULT '+258 84 123 4567',
    address TEXT DEFAULT 'Av. Kenneth Kaunda, 1200\nMaputo, Moçambique',
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert settings" ON public.settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update settings" ON public.settings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete settings" ON public.settings FOR DELETE USING (true);

-- Insert default settings if empty
INSERT INTO public.settings (id) 
SELECT '00000000-0000-0000-0000-000000000000' 
WHERE NOT EXISTS (SELECT 1 FROM public.settings);

-- Stores (Lojas) Table
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    terminals_count INTEGER DEFAULT 1,
    status TEXT DEFAULT 'Ativa',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read stores" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Allow public insert stores" ON public.stores FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update stores" ON public.stores FOR UPDATE USING (true);
CREATE POLICY "Allow public delete stores" ON public.stores FOR DELETE USING (true);

-- API Keys Table
CREATE TABLE IF NOT EXISTS public.api_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_name TEXT NOT NULL,
    api_key TEXT,
    status TEXT DEFAULT 'Inativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.api_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read api_int" ON public.api_integrations FOR SELECT USING (true);
CREATE POLICY "Allow public insert api_int" ON public.api_integrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update api_int" ON public.api_integrations FOR UPDATE USING (true);
CREATE POLICY "Allow public delete api_int" ON public.api_integrations FOR DELETE USING (true);

-- Pre-populate default store
INSERT INTO public.stores (name, location, status) VALUES 
('Loja Sede', 'Maputo', 'Ativa')
ON CONFLICT DO NOTHING;


-- Taxes Settings Table
CREATE TABLE IF NOT EXISTS public.taxes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    rate NUMERIC NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.taxes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read taxes" ON public.taxes FOR SELECT USING (true);
CREATE POLICY "Allow public insert taxes" ON public.taxes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update taxes" ON public.taxes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete taxes" ON public.taxes FOR DELETE USING (true);

INSERT INTO public.taxes (name, rate, is_default) VALUES 
('IVA (Normal)', 16, true),
('Isento (M)', 0, false)
ON CONFLICT DO NOTHING;

-- And update settings if we added more receipt and security cols
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS receipt_footer TEXT DEFAULT 'Obrigado pela preferência! Volte sempre.';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS receipt_paper_size TEXT DEFAULT '80mm';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS receipt_show_logo BOOLEAN DEFAULT true;

ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS security_2fa_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS security_password_policy BOOLEAN DEFAULT true;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS security_session_timeout TEXT DEFAULT '30';




