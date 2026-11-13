import config from '@payload-config'
import { getPayload } from 'payload'

export async function loadWeddingData() {
  const payload = await getPayload({ config })
  const [settings, gallery, messages] = await Promise.all([
    payload.findGlobal({ slug: 'wedding-settings', overrideAccess: true }),
    payload.find({
      collection: 'gallery-items',
      depth: 1,
      limit: 20,
      overrideAccess: true,
      sort: 'order',
    }),
    payload.find({
      collection: 'guest-messages',
      limit: 6,
      overrideAccess: true,
      sort: '-createdAt',
      // KEMBALIKAN KE 'approved' karena ini adalah nama enum/value aslinya di database
      where: { status: { equals: 'approved' } }, 
    }),
  ])

  return {
    settings,
    gallery: gallery.docs,
    messages: messages.docs.map((m) => ({
      id: m.id,
      guestName: m.guestName,
      message: m.message,
      createdAt: m.createdAt,
    })),
  }
}