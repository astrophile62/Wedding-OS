import { notFound } from 'next/navigation'
import WeddingExperience from '../components/WeddingExperience'
import { loadWeddingData } from '@/lib/wedding-data'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const revalidate = 60

export default async function GuestPage(props: { params: Promise<{ slug: string }> | { slug: string } }) {
  // 1. Tangkap slug
  const resolvedParams = await Promise.resolve(props.params);
  const slug = resolvedParams?.slug;

  if (!slug) return notFound();

  // 2. Ambil Data
  const { settings, gallery, messages } = await loadWeddingData();
  
  const payload = await getPayload({ config: configPromise });
  const { docs } = await payload.find({
    collection: 'guests',
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true, // <--- KUNCI MASTER: Izinkan server membaca data privat
  });

  const rawGuest = docs?.[0];
  if (!rawGuest) return notFound();

  // 3. Cuci data murni
  const cleanGuest = {
    id: String(rawGuest.id || ''),
    name: String(rawGuest.name || ''),
    partnerLabel: rawGuest.partnerLabel ? String(rawGuest.partnerLabel) : '',
    maxGuests: Number(rawGuest.maxGuests) || 1,
    invitationType: rawGuest.invitationType === 'group' ? 'group' : 'personal'
  };

  // 4. Mencegah React Error 441
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