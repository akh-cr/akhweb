export interface EventData {
    id: string;
    title: string;
    description: string | null;
    content: string | null;
    start_time: string;
    end_time: string | null;
    location: string | null;
    registration_link: string | null;
    image_url: string | null;
    gallery_images: string[] | null;
    facebook_event_link: string | null;
    organizer?: {
        name: string;
        color_hex?: string | null;
    } | null;
    city: {
        name: string;
        image_url?: string | null;
    } | null;
}

export interface EventLayoutProps {
    event: EventData;
    akhOrganizerColorHex?: string | null;
}
