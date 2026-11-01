import { APIError } from 'payload'
import type { Access, CollectionConfig } from 'payload'

const isAdmin: Access = ({ req }) => req.user?.collection === 'admins'

export const RSVPs: CollectionConfig = {
  slug: 'rsvps',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    group: 'Wedding OS',
    useAsTitle: 'guestName',
    defaultColumns: ['guestName', 'guest', 'attendance', 'guestCount', 'updatedAt'],
  },
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, operation, req }) => {
        if (!data) return data

        const guestRef = data.guest ?? originalDoc?.guest
        const guestId = typeof guestRef === 'object' && guestRef !== null ? guestRef.id : guestRef
        if (!guestId) return data

        const guest = await req.payload.findByID({
          collection: 'guests',
          id: guestId,
          depth: 0,
          overrideAccess: true,
        })
        const isGroup = guest.invitationType === 'group'

        if (operation === 'create') {
          if (!isGroup) {
            // Perorangan: satu RSVP per tamu
            const existing = await req.payload.find({
              collection: 'rsvps',
              where: { guest: { equals: guestId } },
              limit: 1,
              depth: 0,
              overrideAccess: true,
            })
            if (existing.totalDocs > 0) {
              throw new APIError('Tamu ini sudah punya RSVP. Ubah yang sudah ada.', 400)
            }
          } else if (guest.maxResponses) {
            // Grup terbuka: ada batas total
            const total = await req.payload.count({
              collection: 'rsvps',
              where: { guest: { equals: guestId } },
              overrideAccess: true,
            })
            if (total.totalDocs >= guest.maxResponses) {
              throw new APIError('Batas RSVP untuk undangan ini sudah tercapai.', 400)
            }
          }
        }

        const attendance = data.attendance ?? originalDoc?.attendance
        if (attendance === 'declined') {
          data.guestCount = 0
        } else if (attendance === 'attending') {
          const count = Number(data.guestCount ?? originalDoc?.guestCount)
          if (!Number.isInteger(count) || count < 1 || count > guest.maxGuests) {
            throw new APIError(`Jumlah tamu harus antara 1 dan ${guest.maxGuests}.`, 400)
          }
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'guest',
      type: 'relationship',
      relationTo: 'guests',
      required: true,
      index: true,
      admin: { description: 'Undangan (perorangan atau grup) yang menerima konfirmasi ini.' },
    },
    {
      name: 'guestName',
      type: 'text',
      required: true,
      maxLength: 80,
      admin: { description: 'Nama yang mengisi RSVP (untuk grup: nama yang diketik pengunjung).' },
    },
    {
      name: 'attendance',
      type: 'select',
      required: true,
      options: [
        { label: 'Hadir', value: 'attending' },
        { label: 'Tidak hadir', value: 'declined' },
      ],
    },
    {
      name: 'guestCount',
      type: 'number',
      required: true,
      min: 0,
      max: 10,
      admin: { description: 'Otomatis 0 jika tidak hadir.' },
    },
  ],
}