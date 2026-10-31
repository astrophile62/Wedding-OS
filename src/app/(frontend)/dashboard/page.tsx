import config from '@payload-config'
import { getPayload } from 'payload'
import AdminDashboard from '../components/AdminDashboard'

export default async function DashboardPage() {
  const payload = await getPayload({ config })
  const [guests, rsvps, settings] = await Promise.all([
    payload.find({ collection: 'guests', limit: 100, overrideAccess: true, sort: 'name' }),
    payload.find({ collection: 'rsvps', limit: 100, overrideAccess: true, sort: '-createdAt' }),
    payload.findGlobal({ slug: 'wedding-settings' }),
  ])

  return (
    <AdminDashboard
      guests={guests.docs.map((guest) => ({
        id: String(guest.id),
        name: guest.name,
        slug: guest.slug,
        invitationStatus: guest.invitationStatus,
      }))}
      rsvps={rsvps.docs.map((rsvp) => ({
        attendance: rsvp.attendance,
        guestCount: rsvp.guestCount,
      }))}
      sections={
        settings.sectionOrder?.map((section) => ({
          id: section.id || section.label,
          label: section.label,
          enabled: section.enabled !== false,
        })) || []
      }
    />
  )
}
