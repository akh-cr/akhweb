-- Insert sample Posts
INSERT INTO public.posts (title, slug, excerpt, content, published_at, image_url, author_id)
SELECT 
    'Nové vedení AKH se představuje', 
    'nove-vedeni-akh-se-predstavuje', 
    'Po valné hromadě, která proběhla minulý víkend, má Absolventské křesťanské hnutí nové vedení. Přečtěte si, kdo jsou noví členové rady a jaké jsou jejich vize.', 
    '{"html": "<h2>Nová rada AKH</h2><p>Vážení členové a přátelé,</p><p>s radostí vám představujeme nové složení rady AKH, které bylo zvoleno na víkendové valné hromadě na Velehradě.</p><h3>Předseda: Jan Novák</h3><p>Jan je dlouholetým členem společenství v Brně a v minulé radě působil jako místopředseda. Jeho vizí je prohloubení duchovního života v regionech.</p><h3>Místopředsedkyně: Marie Svobodová</h3><p>Marie přichází z Prahy, kde se věnuje organizaci plesů a kulturních akcí. Chtěla by se zaměřit na propojování absolventů s rodinnými centry.</p><p>Děkujeme odstupujícímu vedení za jejich obětavou službu a prosíme o modlitbu za novou radu.</p>"}'::jsonb,
    NOW() - INTERVAL '1 day',
    NULL,
    (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.posts WHERE slug = 'nove-vedeni-akh-se-predstavuje');

INSERT INTO public.posts (title, slug, excerpt, content, published_at, image_url, author_id)
SELECT 
    'Reflexe: Jak žít víru v práci?', 
    'reflexe-jak-zit-viru-v-praci', 
    'Mnoho absolventů řeší otázku, jak integrovat svou víru do profesního života. Přinášíme zamyšlení otce Tomáše Halíka z naší poslední duchovní obnovy.', 
    '{"html": "<p><em>\"Víra není kabát, který si oblékáme jen v neděli do kostela,\"</em> připomněl otec Tomáš na úvod své promluvy. V pracovním prostředí často čelíme etickým dilematům, stresu a tlaku na výkon.</p><p>Křesťan v práci nemá být nutně ten, kdo má na stole Bibli a kříž, ale ten, kdo do vztahů vnáší pokoj, spravedlnost a naději. Je to o poctivosti, o ochotě pomoci kolegovi, o tom, jak mluvíme o druhých, když tam nejsou.</p><blockquote>Kde je láska a moudrost, tam není ani strach, ani nevědomost. - sv. František z Assisi</blockquote><p>Celý záznam přednášky najdete brzy v naší sekci Videogalerie.</p>"}'::jsonb,
    NOW() - INTERVAL '4 days',
    NULL,
    (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.posts WHERE slug = 'reflexe-jak-zit-viru-v-praci');

INSERT INTO public.posts (title, slug, excerpt, content, published_at, image_url, author_id)
SELECT 
    'Pozvánka na Absolventský Velehrad 2026', 
    'pozvanka-na-absolventsky-velehrad-2026', 
    'Přípravy na největší setkání absolventů jsou v plném proudu. Tématem příštího ročníku bude "Naděje v nejisté době".', 
    '{"html": "<p>Milí absolventi, už nyní si můžete zapsat do diářů termín příštího Absolventského Velehradu: <strong>15. - 18. srpna 2026</strong>.</p><p>Víme, že doba, ve které žijeme, přináší mnoho nejistot. Proto jsme jako hlavní téma zvolili Naději. Ne laciný optimismus, ale křesťanskou naději, která má kořeny v Kristově zmrtvýchvstání.</p><ul><li>Hlavní hosté: P. Ladislav Heryán, Markéta Sedláčková</li><li>Koncerty: Pavel Helan, Schola brněnské mládeže</li><li>Program pro děti zajištěn</li></ul><p>Registrace bude spuštěna 1. května.</p>"}'::jsonb,
    NOW() - INTERVAL '7 days',
    NULL,
    (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.posts WHERE slug = 'pozvanka-na-absolventsky-velehrad-2026');

-- Promote an existing Community (if exists)
UPDATE public.communities 
SET 
    news_publish_date = NOW() - INTERVAL '3 days',
    is_hidden = false
WHERE id IN (SELECT id FROM public.communities LIMIT 1);

-- Promote an existing Event (if exists)
UPDATE public.events 
SET 
    news_publish_date = NOW() - INTERVAL '2 days',
    is_hidden = false
WHERE id IN (SELECT id FROM public.events LIMIT 1);
