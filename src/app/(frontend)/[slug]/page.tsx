import { notFound } from 'next/navigation'
import WeddingExperience from '../components/WeddingExperience'
import { loadWeddingData } from '@/lib/wedding-data'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const revalidate = 60

export default async function GuestPage(props: { params: Promise<{ slug: string }> | { slug: string } }) {
  try {
    // 1. Tangkap slug dengan aman (Mendukung Next.js 14 maupun 15)
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

    // 4. Pastikan tidak ada sisa objek Server (Penyebab utama Error 441)
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
    
  } catch (error: any) {
    // JIKA GAGAL: Ini akan menelanjangi Error 441 dan mencetak pesan aslinya ke layar!
    return (
      <div style={{ padding: '50px', color: 'white', backgroundColor: 'black', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <h2>🚨 Terjadi Kesalahan di Server</h2>
        <p style={{ color: '#ccc' }}>Pesan Error Asli (Tolong screenshot ini):</p>
        <pre style={{ color: '#ff6b6b', whiteSpace: 'pre-wrap', marginTop: '20px', padding: '20px', border: '1px solid #ff6b6b' }}>
          {error?.message || String(error)}
        </pre>
      </div>
    )
  }
}