import { notFound } from 'next/navigation'
import WeddingExperience from '@/app/(frontend)/components/WeddingExperience'
import { loadWeddingData } from '@/lib/wedding-data'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const revalidate = 60

export default async function GuestPage(props: { params: Promise<{ slug: string }> | { slug: string } }) {
  // 1. Tangkap slug
  const resolvedParams = await Promise.resolve(props.params);
  const slug = resolvedParams?.slug;

  if (!slug) return notFound();

  // 2. Ambil Data Global (Pesan yang sudah approved ada di dalam sini)
  const { settings, gallery, messages } = await loadWeddingData();
  
  const payload = await getPayload({ config: configPromise });
  const { docs } = await payload.find({
    collection: 'guests',
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  });

  const rawGuest = docs?.[0];
  if (!rawGuest) return notFound();

  // 3. FITUR ILUSI VIP: Ambil pesan milik tamu ini yang masih 'pending'
  const pendingMessages = await payload.find({
    collection: 'guest-messages',
    where: {
      and: [
        { guest: { equals: rawGuest.id } },
        { status: { equals: 'pending' } }
      ]
    },
    overrideAccess: true,
  });

  // 4. Gabungkan: Taruh pesan pending milik dia sendiri di urutan paling atas!
  let finalMessages = [...messages];
  if (pendingMessages.docs.length > 0) {
     const ownPending = pendingMessages.docs.map(m => ({
        id: m.id,
        guestName: String(m.guestName),
        message: String(m.message),
        createdAt: String(m.createdAt),
     }));
     finalMessages = [...ownPending, ...finalMessages];
  }

  // 5. Cuci data tamu
  const cleanGuest = {
    id: String(rawGuest.id || ''),
    name: String(rawGuest.name || ''),
    partnerLabel: rawGuest.partnerLabel ? String(rawGuest.partnerLabel) : '',
    maxGuests: Number(rawGuest.maxGuests) || 1,
    invitationType: rawGuest.invitationType === 'group' ? 'group' : 'personal'
  };

  // 6. Mencegah React Error 441
  const safeSettings = JSON.parse(JSON.stringify(settings));
  const safeGallery = JSON.parse(JSON.stringify(gallery));
  const safeMessages = JSON.parse(JSON.stringify(finalMessages)); // <-- Gunakan pesan gabungan
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