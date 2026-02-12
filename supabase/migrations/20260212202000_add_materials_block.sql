-- Insert the default materials block for Společenství page
INSERT INTO content_blocks (id, type, content)
VALUES (
    'spolecenstvi.materials',
    'materials',
    '{
        "title": "Pro vedoucí společenství",
        "description": "Hledáš materiály, tipy pro vedení nebo inspiraci pro tvé společenství? Připravili jsme pro tebe sekci plnou užitečných zdrojů.",
        "items": [
            {
                "url": "https://docs.google.com/spreadsheets/d/10v4XYUtua2s5mbCZYWK1jJZWRBxAeWNz_PQCv1oRzUE/edit?usp=sharing",
                "icon": "Home",
                "title": "Databáze ubytování",
                "description": "Přehled ubytovacích možností pro víkendovky a akce společenství."
            },
            {
                "url": "https://docs.google.com/document/d/1ZyCQmEj6_oeI9ZrkTTHfXKGOrK6iuitYPPyU0oIuSAI/edit?usp=sharing",
                "icon": "Lightbulb",
                "title": "Inspiromat pro skupinky",
                "description": "Tipy a podklady pro vedení modlitebních a sdílecích skupinek."
            },
            {
                "url": "https://docs.google.com/document/d/1p2J2KJqbFXwVzJgH9zyf7_ttx1E4CBHd/edit?usp=drive_link&ouid=103164862258109550481&rtpof=true&sd=true",
                "icon": "FileText",
                "title": "Materiály pro vedoucí",
                "description": "Kompletní sada dokumentů, formulářů a návodů pro vedení."
            }
        ]
    }'::jsonb
)
ON CONFLICT (id) DO NOTHING;
