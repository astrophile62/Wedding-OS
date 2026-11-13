import { notFound } from 'next/navigation'
import WeddingExperience from '../components/WeddingExperience'
import { loadWeddingData } from '@/lib/wedding-data'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const revalidate = 60

export default async function GuestPage(props: any) {
  // 1. Tangkap slug dengan aman (Kompatibel Next.js 14 & 15)
  const params = await props.params;
  const slug = params?.slug;

  if (!slug) notFound();

  // 2. Ambil semua data
  const { settings, gallery, messages } = await loadWeddingData();
  
  const payload = await getPayload({ config: configPromise });
  const { docs } = await payload.find({
    collection: 'guests',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  });

  const rawGuest = docs?.[0];

  if (!rawGuest) {
    notFound();
  }

  // 3. Format data Guest murni
  const cleanGuest = {
    id: String(rawGuest.id || ''),
    name: String(rawGuest.name || ''),
    partnerLabel: rawGuest.partnerLabel ? String(rawGuest.partnerLabel) : '',
    maxGuests: Number(rawGuest.maxGuests) || 1,
    invitationType: rawGuest.invitationType === 'group' ? 'group' : 'personal'
  };

  // 4. SUPER CLEANUP: Hancurkan semua Proxy/Promise tersembunyi dari database
  // Ini adalah kunci utama untuk menghilangkan Error 441 di halaman dinamis!
  const safeSettings = JSON.parse(JSON.stringify(settings));
  const safeGallery = JSON.parse(JSON.stringify(gallery));
  const safeMessages = JSON.parse(JSON.stringify(messages));
  const safeGuest = JSON.parse(JSON.stringify(cleanGuest));

  return (
    <WeddingExperience 
      settings={safeSettings} 
      gallery={safeGallery} 
      messages={safeMessages} 
      guest={safeGuest} 
    />
  );
}