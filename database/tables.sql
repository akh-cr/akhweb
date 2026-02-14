-- Current Database Schema (Snapshot)
-- Generated on 2026-02-13

-- Table: cities
CREATE TABLE public.cities (
    id text NOT NULL PRIMARY KEY,
    name text NOT NULL,
    description text,
    contact_email text,
    slug text,
    meeting_time text,
    meeting_place text,
    contact_name text,
    image_url text,
    content text,
    metadata jsonb DEFAULT '{}'::jsonb,
    gallery_images text[] DEFAULT '{}'::text[],
    region text,
    news_publish_date timestamp with time zone,
    is_hidden boolean DEFAULT false
);

-- Table: content_blocks
CREATE TABLE public.content_blocks (
    id text NOT NULL PRIMARY KEY,
    type text NOT NULL,
    content jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table: council_members
CREATE TABLE public.council_members (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    role text NOT NULL,
    bio text,
    image_url text,
    active boolean DEFAULT true,
    priority integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- Table: events
CREATE TABLE public.events (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone,
    location text,
    city_id text,
    image_url text,
    registration_link text,
    created_at timestamp with time zone DEFAULT now(),
    slug text,
    content text,
    tags text[] DEFAULT '{}'::text[],
    gallery_images text[] DEFAULT '{}'::text[],
    facebook_event_link text,
    news_publish_date timestamp with time zone,
    is_hidden boolean DEFAULT false
);



-- Table: posts
CREATE TABLE public.posts (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    slug text NOT NULL,
    title text NOT NULL,
    excerpt text,
    content text,
    image_url text,
    published_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    author_id uuid,
    is_hidden boolean DEFAULT false
);

-- Table: user_roles
-- Note: profiles table was removed (was unused - see migration 20260214_drop_profiles_table.sql)
-- RBAC is handled through user_roles table only
CREATE TABLE public.user_roles (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    role text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);
