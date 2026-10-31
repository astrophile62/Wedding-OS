import config from '@payload-config'
import { getPayload } from 'payload'
import WeddingExperience from './components/WeddingExperience'

export default async function HomePage() {
  const payload = await getPayload({ config })
  const [settings, gallery, messages, guests] = await Promise.all([
    payload.findGlobal({ slug: 'wedding-settings', overrideAccess: true }),
    payload.find({
      collection: 'gallery-items',
      depth: 1,
      limit: 20,
      overrideAccess: true,
      sort: 'order',
    }),
    payload.find({
      collection: 'rsvps',
      limit: 6,
      overrideAccess: true,
      sort: '-createdAt',
      where: { approved: { equals: true } },
    }),
    payload.find({
      collection: 'guests',
      limit: 1,
      overrideAccess: true,
      where: { slug: { equals: 'alya-pradana' } },
    }),
  ])

  const guest = guests.docs[0]

  return (
    <WeddingExperience
      settings={settings}
      gallery={gallery.docs}
      messages={messages.docs}
      guest={
        guest
          ? {
              id: String(guest.id),
              name: guest.name,
              partnerLabel: guest.partnerLabel || '',
              maxGuests: guest.maxGuests,
            }
          : null
      }
    />
  )
}
