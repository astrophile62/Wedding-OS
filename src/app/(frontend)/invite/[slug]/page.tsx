import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'
import WeddingExperience from '../../components/WeddingExperience'
import { loadWeddingData } from '@/lib/wedding-data'

export const revalidate = 60

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function InvitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const found = await payload.find({
    collection: 'guests',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const guest = found.docs[0]
  if (!guest) notFound()

  const { settings, gallery, messages } = await loadWeddingData()
  const isGroup = guest.invitationType === 'group'

  return (
    <WeddingExperience
      settings={settings}
      gallery={gallery}
      messages={messages}
      guest={{
        id: guest.slug ?? '', // dikirim sebagai kolom "guestId" di form
        name: guest.name,
        partnerLabel: isGroup
          ? ''
          : guest.partnerName
            ? `& ${guest.partnerName}`
            : guest.partnerLabel || '',
        maxGuests: guest.maxGuests,
        // 'personal' = nama dari data tamu; 'group' = pengunjung mengisi nama sendiri
        invitationType: isGroup ? 'group' : 'personal',
    }}
    />
  )
}