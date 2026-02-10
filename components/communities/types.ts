export interface CommunityData {
    id: string;
    name: string;
    description: string | null;
    content: string | null;
    image_url: string | null;
    mayor_id: string | null;
    mayor?: {
        nickname: string | null;
        contact_email: string | null;
    } | null;
    gallery_images: string[] | null;
    latitude?: number;
    longitude?: number;
}

export interface CommunityLayoutProps {
    community: CommunityData;
}
