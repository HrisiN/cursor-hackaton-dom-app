-- ============================================================
-- Seed listings for development / demo
-- Run AFTER schema.sql
-- ============================================================

INSERT INTO listings (external_id, source, url, title, deal_type, price, area_m2, rooms, floor, neighborhood, address, latitude, longitude, furnished, images, description, nearest_kindergarten_m, nearest_hospital_m, nearest_transit_m, nearest_park_m) VALUES

('NJ-10001', 'njuskalo', 'https://www.njuskalo.hr/nekretnine/10001',
 'Svijetli stan u centru, 2 sobe', 'rent', 650, 58, 2, 3,
 'Donji Grad', 'Ilica 45, Zagreb', 45.8131, 15.9720, true,
 ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600'],
 'Potpuno namješten stan na odličnoj lokaciji. Blizu tramvajske stanice.',
 250, 800, 100, 400),

('NJ-10002', 'njuskalo', 'https://www.njuskalo.hr/nekretnine/10002',
 'Garsonijera na Trešnjevci', 'rent', 380, 32, 1, 1,
 'Trešnjevka Sjever', 'Ozaljska 12, Zagreb', 45.8040, 15.9560, true,
 ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600'],
 'Mala ali funkcionalna garsonijera. Internet uključen.',
 400, 1200, 150, 300),

('NJ-10003', 'njuskalo', 'https://www.njuskalo.hr/nekretnine/10003',
 'Prostrani 3-sobni stan, Maksimir', 'rent', 900, 85, 3, 2,
 'Maksimir', 'Bukovačka 78, Zagreb', 45.8240, 16.0150, false,
 ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600'],
 'Veliki stan blizu parka Maksimir. Renoviran 2023.',
 300, 1500, 200, 50),

('IX-20001', 'index-hr', 'https://www.index.hr/oglasi/20001',
 'Novogradnja Novi Zagreb, 2 sobe', 'sale', 185000, 62, 2, 5,
 'Novi Zagreb Istok', 'Avenija Dubrovnik 15, Zagreb', 45.7760, 15.9940, false,
 ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600'],
 'Novogradnja s garažnim mjestom. Useljivo odmah.',
 200, 600, 100, 500),

('IX-20002', 'index-hr', 'https://www.index.hr/oglasi/20002',
 'Kuća s vrtom, Sesvete', 'sale', 320000, 180, 5, NULL,
 'Sesvete', 'Jelkovečka 33, Zagreb', 45.8310, 16.1080, false,
 ARRAY['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600'],
 'Obiteljska kuća s velikim vrtom. Mirna lokacija.',
 500, 2000, 400, 100),

('C21-30001', 'century21', 'https://www.century21.hr/30001',
 'Penthouse Trnje, pogled na Savu', 'sale', 450000, 120, 4, 8,
 'Trnje', 'Savska cesta 100, Zagreb', 45.7990, 15.9870, true,
 ARRAY['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600'],
 'Luksuzan penthouse s terasom i pogledom na Savu.',
 350, 500, 80, 200),

('C21-30002', 'century21', 'https://www.century21.hr/30002',
 'Studio apartman, Gornji Grad', 'rent', 550, 40, 1, 2,
 'Gornji Grad', 'Tkalčićeva 22, Zagreb', 45.8155, 15.9770, true,
 ARRAY['https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600'],
 'Šarmantan studio u srcu Gornjeg grada.',
 500, 700, 150, 300),

('RM-40001', 'remax', 'https://www.remax.hr/40001',
 'Obiteljski stan, Medveščak', 'rent', 1100, 95, 3, 4,
 'Medveščak', 'Medveščak 44, Zagreb', 45.8270, 15.9810, false,
 ARRAY['https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=600'],
 'Prostran stan u mirnom dijelu Medveščaka.',
 150, 400, 200, 250),

('CZ-50001', 'crozilla', 'https://www.crozilla.com/50001',
 'Dvosobni stan, Črnomerec', 'sale', 165000, 55, 2, 1,
 'Črnomerec', 'Ilica 300, Zagreb', 45.8175, 15.9390, false,
 ARRAY['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600'],
 'Renoviran stan na mirnoj lokaciji blizu centra.',
 300, 1000, 100, 400),

('CZ-50002', 'crozilla', 'https://www.crozilla.com/50002',
 'Stan s balkonom, Peščenica', 'rent', 700, 65, 2, 3,
 'Peščenica', 'Slavonska avenija 55, Zagreb', 45.8105, 16.0090, true,
 ARRAY['https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600'],
 'Svijetli stan s velikim balkonom. Parking uključen.',
 200, 800, 50, 350),

('NJ-10004', 'njuskalo', 'https://www.njuskalo.hr/nekretnine/10004',
 'Adaptiran stan, Dubrava', 'sale', 120000, 48, 2, 2,
 'Gornja Dubrava', 'Dubrava 150, Zagreb', 45.8340, 16.0580, false,
 ARRAY['https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600'],
 'Potpuno adaptiran 2019. Odlična cijena za kvadraturu.',
 200, 1800, 300, 500),

('IX-20003', 'index-hr', 'https://www.index.hr/oglasi/20003',
 'Garsonijera, Studentski Grad', 'rent', 350, 28, 1, 6,
 'Maksimir', 'Studentski grad bb, Zagreb', 45.8200, 16.0100, true,
 ARRAY['https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=600'],
 'Idealno za studente. Blizu FER-a i PMF-a.',
 600, 1500, 100, 150)

ON CONFLICT (source, external_id) DO UPDATE SET
  price = EXCLUDED.price,
  scraped_at = now();
