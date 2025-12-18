-- Seed Cities
INSERT INTO public.cities (name, slug, description) VALUES
('AKH Brno', 'brno', 'Společenství v Brně je největší. Scházíme se každé úterý.'),
('AKH Praha', 'praha', 'Pražské společenství absolventů.'),
('AKH Ostrava', 'ostrava', 'Společenství v Ostravě.'),
('AKH Zlín', 'zlin', 'Společenství ve Zlíně.'),
('Hradec Králové', 'hradec', 'Společenství v Hradci Králové.'),
('AKH Olomouc', 'olomouc', 'Společenství v Olomouci.'),
('České Budějovice', 'ceske-budejovice', 'Společenství v Českých Budějovicích.'),
('Plzeň', 'plzen', 'Společenství v Plzni.'),
('AKH Náchod', 'akhnachod', 'Společenství v Náchodě.'),
('Česká Lípa', 'akhceskalipa', 'Společenství v České Lípě.')
ON CONFLICT (slug) DO UPDATE SET 
    description = EXCLUDED.description;

