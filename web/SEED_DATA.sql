-- =============================================================
-- PITGO - SEED DATA
-- Cole este SQL no Supabase SQL Editor e clique em "Run"
-- =============================================================

-- 1. Inserir oficinas (shops)
INSERT INTO shops (name, category, rating, address, latitude, longitude, image_url, service_radius_km, is_active) VALUES
('Eco Mobile Wash', 'wash', 4.8, 'Av. Paulista, 1000 - Bela Vista, São Paulo', -23.561414, -46.655881, 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=800&auto=format&fit=crop', 25, true),
('Home Detailer Pro', 'detailing', 4.9, 'Rua Augusta, 500 - Consolação, São Paulo', -23.551631, -46.648004, 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?q=80&w=800&auto=format&fit=crop', 20, true),
('Quick Tire Support', 'repair', 4.7, 'Av. Rebouças, 2000 - Pinheiros, São Paulo', -23.553942, -46.684449, 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?q=80&w=800&auto=format&fit=crop', 30, true),
('PitStop Express', 'wash', 4.6, 'Av. Brigadeiro Faria Lima, 3000 - Itaim Bibi, São Paulo', -23.586089, -46.681965, 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=800&auto=format&fit=crop', 15, true),
('Precision Auto Care', 'repair', 4.5, 'Av. Ibirapuera, 3103 - Moema, São Paulo', -23.609869, -46.665574, 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?q=80&w=800&auto=format&fit=crop', 20, true);

-- 2. Inserir serviços para cada oficina
INSERT INTO services (shop_id, title, price, duration_mins)
SELECT id, 'Lavagem Completa', 50, 30 FROM shops WHERE name = 'Eco Mobile Wash'
UNION ALL
SELECT id, 'Lavagem Premium + Cera', 120, 60 FROM shops WHERE name = 'Eco Mobile Wash'
UNION ALL
SELECT id, 'Polimento Cristalizado', 180, 90 FROM shops WHERE name = 'Home Detailer Pro'
UNION ALL
SELECT id, 'Detailing Completo', 350, 180 FROM shops WHERE name = 'Home Detailer Pro'
UNION ALL
SELECT id, 'Higienização Interna', 150, 60 FROM shops WHERE name = 'Home Detailer Pro'
UNION ALL
SELECT id, 'Troca de Pneu', 80, 30 FROM shops WHERE name = 'Quick Tire Support'
UNION ALL
SELECT id, 'Balanceamento + Alinhamento', 120, 45 FROM shops WHERE name = 'Quick Tire Support'
UNION ALL
SELECT id, 'Revisão de Freios', 200, 90 FROM shops WHERE name = 'Quick Tire Support'
UNION ALL
SELECT id, 'Lavagem Expressa', 35, 20 FROM shops WHERE name = 'PitStop Express'
UNION ALL
SELECT id, 'Lavagem + Aspiração', 70, 40 FROM shops WHERE name = 'PitStop Express'
UNION ALL
SELECT id, 'Diagnóstico Completo', 150, 60 FROM shops WHERE name = 'Precision Auto Care'
UNION ALL
SELECT id, 'Troca de Óleo + Filtros', 250, 45 FROM shops WHERE name = 'Precision Auto Care'
UNION ALL
SELECT id, 'Revisão Geral', 500, 180 FROM shops WHERE name = 'Precision Auto Care';
