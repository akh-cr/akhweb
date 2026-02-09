import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CommunityLayoutV1 } from "@/components/communities/CommunityLayoutV1";
import { CommunityLayoutV2 } from "@/components/communities/CommunityLayoutV2";
import { CommunityLayoutV3 } from "@/components/communities/CommunityLayoutV3";
import { CommunityLayoutV4 } from "@/components/communities/CommunityLayoutV4";

export default async function CommunityDetailPage({ 
    params,
    searchParams 
}: { 
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ design?: string }>
}) {
  const unwrappedParams = await params;
  const unwrappedSearchParams = await searchParams;
  const design = unwrappedSearchParams.design || 'v1';
  
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

  switch (design) {
      case 'v2':
          return <CommunityLayoutV2 community={communityData} />;
      case 'v3':
          return <CommunityLayoutV3 community={communityData} />;
      case 'v4':
          return <CommunityLayoutV4 community={communityData} />;
      case 'v1':
      default:
          return <CommunityLayoutV1 community={communityData} />;
  }
}
