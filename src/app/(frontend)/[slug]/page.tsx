import { notFound } from 'next/navigation'
import WeddingExperience from '../components/WeddingExperience'
import { loadWeddingData } from '@/lib/wedding-data'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const revalidate = 60

type Args = {
  params: Promise<{
    slug: string
  }>
}

export default async function GuestPage({ params }: Args) {
  // 1. Tangkap slug dengan aman
  const resolvedParams = await params
  const { slug } = resolvedParams

  const { settings, gallery, messages } = await loadWeddingData()
  
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'guests',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  })

  const rawGuest = docs[0]

  if (!rawGuest) {
    notFound()
  }

  // 2. CUCI DATA: Ekstrak hanya teks dan angka murni
  // Ini kunci untuk menghilangkan React Error 441
  const cleanGuest = {
    id: String(rawGuest.id),
    name: String(rawGuest.name),
    partnerLabel: rawGuest.partnerLabel ? String(rawGuest.partnerLabel) : '',
    maxGuests: Number(rawGuest.maxGuests) || 1,
    invitationType: rawGuest.invitationType === 'group' ? 'group' : 'personal'
  }

  // 3. Kirim data yang sudah bersih ke komponen
  return (
    <WeddingExperience 
      settings={settings} 
      gallery={gallery} 
      messages={messages} 
      guest={cleanGuest} 
    />
  )
}