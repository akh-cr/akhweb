export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Event {
  id: string
  created_at: string
  title: string
  description: string | null
  content: string | null
  start_time: string
  end_time: string | null
  location: string | null
  image_url: string | null
  slug: string
  city_id: string | null
  is_hidden: boolean
  registration_link: string | null
  facebook_event_link: string | null
  gallery_images: string[] | null
}

export interface City {
  id: string
  name: string
  slug: string
}

export interface EventWithCity extends Event {
  cities: {
    name: string
  } | null
}

export interface Database {
  public: {
    Tables: {
      events: {
        Row: Event
        Insert: Partial<Event>
        Update: Partial<Event>
      }
      cities: {
        Row: City
        Insert: Partial<City>
        Update: Partial<City>
      }
    }
  }
}
