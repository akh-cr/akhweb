-- Insert 'blog.hero' content block
INSERT INTO public.content_blocks (id, type, content)
VALUES 
    ('blog.hero', 'header', '{"title": "Aktuality", "subtitle": "Články, zamyšlení a novinky ze života hnutí."}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Insert sample posts if none exist
INSERT INTO public.posts (title, slug, excerpt, content, published_at, image_url, author_id)
SELECT 
    'Vedení chval na mši svaté', 
    'vedeni-chval-na-msi-svate', 
    'Minulý týden jsme měli tu čest vést chvály na večerní mši svaté u Nejsvětějšího Salvátora. Byla to krásná příležitost ke službě a společné modlitbě.', 
    '{"html": "<p>Minulý týden jsme měli tu čest vést chvály na večerní mši svaté u Nejsvětějšího Salvátora. Byla to krásná příležitost ke službě a společné modlitbě. Děkujeme všem, kteří se přidali i těm, kteří nás podpořili svou přítomností.</p><p>Hudba je nedílnou součástí naší spirituality a jsme rádi, že můžeme tímto způsobem sloužit farnosti.</p>"}'::jsonb,
    NOW() - INTERVAL '2 days',
    NULL,
    (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.posts);

INSERT INTO public.posts (title, slug, excerpt, content, published_at, image_url, author_id)
SELECT 
    'Postní duchovní obnova', 
    'postni-duchovni-obnova', 
    'Zveme vás na postní duchovní obnovu, která se uskuteční v klášteře na Hoře Matky Boží. Tématem bude "Návrat k pramenům".', 
    '{"html": "<p>Zveme vás na postní duchovní obnovu, která se uskuteční v klášteře na Hoře Matky Boží. Tématem bude \"Návrat k pramenům\".</p><p>Program začne v pátek večer a skončí v neděli po obědě. Čekají nás přednášky, modlitby, ticho i prostor pro sdílení.</p><ul><li>Termín: 14.-16. března</li><li>Cena: 1500 Kč (studenti 1000 Kč)</li><li>Přihlašování: přes formulář na webu</li></ul>"}'::jsonb,
    NOW() - INTERVAL '5 days',
    NULL,
    (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.posts WHERE slug = 'postni-duchovni-obnova');

INSERT INTO public.posts (title, slug, excerpt, content, published_at, image_url, author_id)
SELECT 
    'Nové společenství v Brně', 
    'nove-spolecenstvi-v-brne', 
    'S radostí oznamujeme vznik nového absolventského společenství v Brně. Scházíme se každé úterý u jezuitů.', 
    '{"html": "<p>S radostí oznamujeme vznik nového absolventského společenství v Brně. Scházíme se každé úterý u jezuitů v 19:00.</p><p>Pokud jste z Brna a okolí a hledáte společenství věřících vrstevníků, jste srdečně zváni. Více informací nejdete v sekci Společenství.</p>"}'::jsonb,
    NOW() - INTERVAL '10 days',
    NULL,
    (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.posts WHERE slug = 'nove-spolecenstvi-v-brne');
