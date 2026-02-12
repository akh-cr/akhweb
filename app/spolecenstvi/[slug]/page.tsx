import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CommunityLayoutV1 } from "@/components/communities/CommunityLayoutV1";


import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = (await params).slug;
  const supabase = await createClient();
  const { data: city } = await supabase.from('cities').select('name, description').eq('slug', slug).single();

  return {
    title: city?.name || 'Společenství nenalezeno',
    description: `Společenství v ${city?.name}. ${city?.description ? city.description.substring(0, 100) : ''}`,
  }
}

export default async function CommunityDetailPage({ 
    params
}: { 
    params: Promise<{ slug: string }>
}) {
  const unwrappedParams = await params;
  
  console.log('CommunityDetailPage: slug=', unwrappedParams.slug);

  const supabase = await createClient();
  const { data: city, error } = await supabase
    .from('cities')
    .select('*')
    .eq('slug', unwrappedParams.slug)
    .single();

  console.log('CommunityDetailPage: city=', city, 'error=', error);

  if (!city) {
    notFound();
  }

  // Cast specific types or ensure data structure matches CommunityData interface
  const communityData = {
      ...city,
      mayor: {
          nickname: city.contact_name,
          contact_email: city.contact_email
      }
  };

  return <CommunityLayoutV1 community={communityData} />;
}
