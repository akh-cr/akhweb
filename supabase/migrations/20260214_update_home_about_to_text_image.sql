-- Update home.about to text_image type with all required fields
UPDATE public.content_blocks
SET 
    type = 'text_image',
    content = jsonb_build_object(
        'title', 'Proč absolventi?',
        'text', 'Studentský život mají již za sebou, ale do rodinných společenství ještě nezapadají. Na skupinu mladých pracujících, kteří ještě nemají vlastní rodiny, se nejenom v církvi často zapomíná. AKH ČR si klade za cíl vyplnit tuto mezeru v pastorační péči, kterou mnozí absolventi cítí během hledání svého místa ve světě.',
        'items', COALESCE(content->'items', '[]'::jsonb),
        'ctaText', 'Více o naší vizi',
        'ctaLink', '/o-nas'
    )
WHERE id = 'home.about';
