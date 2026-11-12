import { notFound } from 'next/navigation'
import WeddingExperience from '../components/WeddingExperience' // <--- Perhatikan titiknya ada dua (../)
import { loadWeddingData } from '@/lib/wedding-data'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const revalidate = 60

export default async function GuestPage({ params }: { params: { slug: string } }) {
  const { slug } = params

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

  const guest = docs[0] || null

  if (!guest) {
    notFound()
  }

  return (
    <WeddingExperience 
      settings={settings} 
      gallery={gallery} 
      messages={messages} 
      guest={guest} 
    />
  )
}